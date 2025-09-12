from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.api.deps import get_db, require_admin
from app.models.user import User
from app.models.asset import Asset
from app.models.reservation import Reservation, ReservationStatus

router = APIRouter(dependencies=[Depends(require_admin)])

@router.get("/summary")
def summary(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    week_ahead = now + timedelta(days=7)
    total_users = db.query(User).count()
    admin_users = db.query(User).filter(User.role == 'admin').count()
    active_users = db.query(User).filter(User.is_active == True).count()  # noqa: E712
    total_assets = db.query(Asset).count()
    total_reservations = db.query(Reservation).count()
    active_reservations = db.query(Reservation).filter(Reservation.status == ReservationStatus.active).count()
    upcoming = db.query(Reservation).filter(
        Reservation.status == ReservationStatus.active,
        Reservation.start_time >= now,
        Reservation.start_time <= week_ahead
    ).count()
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "admins": admin_users,
        },
        "assets": {"total": total_assets},
        "reservations": {
            "total": total_reservations,
            "active": active_reservations,
            "upcoming_7d": upcoming
        },
        "generated_at": now.isoformat() + 'Z'
    }
