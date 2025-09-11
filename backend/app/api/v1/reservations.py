from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, get_current_user
from app.schemas.reservation import ReservationCreate, ReservationRead
from datetime import datetime, timedelta
from fastapi import Query
from app.crud.crud_reservation import check_conflict, create_reservation, list_reservations_for_asset, get_reservation, cancel_reservation
from app.crud.crud_asset import get_asset

router = APIRouter()

@router.post("/", response_model=ReservationRead, status_code=201)
def create_new_reservation(payload: ReservationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # user_name now always taken from token

    # Validate asset exists
    asset = get_asset(db, payload.asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # validate times
    if payload.end_time <= payload.start_time:
        raise HTTPException(status_code=400, detail="end_time must be after start_time")

    # conflict detection
    if check_conflict(db, payload.asset_id, payload.start_time, payload.end_time):
        raise HTTPException(status_code=409, detail="Requested time overlaps existing reservation")

    res = create_reservation(db, payload, user_name=current_user.username)
    return res

@router.get("/asset/{asset_id}", response_model=List[ReservationRead])
def reservations_for_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    all: bool = Query(False, description="If true, return all reservations (admin only)")
):
    reservations = list_reservations_for_asset(db, asset_id)

    # filtering
    if not all:
        now = datetime.utcnow()
        week_start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
        week_end = week_start + timedelta(days=7)
        reservations = [r for r in reservations if r.start_time < week_end and r.end_time > week_start]
    else:
        if current_user.role.value != "admin":
            raise HTTPException(status_code=403, detail="Only admin can request all reservations")
    masked = []
    for r in reservations:
        data = {
            "id": r.id,
            "asset_id": r.asset_id,
            "user_name": r.user_name if r.user_name == current_user.username else "***",
            "start_time": r.start_time,
            "end_time": r.end_time,
            "purpose": r.purpose,
            "status": r.status,
        }
        masked.append(data)
    return masked

@router.delete("/{reservation_id}", status_code=204)
def cancel_existing_reservation(reservation_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    res = get_reservation(db, reservation_id)
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    # allow cancellation if owner or admin
    if res.user_name != current_user.username and current_user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to cancel")
    cancel_reservation(db, res)
    return {"ok": True}
