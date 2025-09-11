from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.reservation import Reservation, ReservationStatus
from app.schemas.reservation import ReservationCreate
from datetime import datetime

def check_conflict(db: Session, asset_id: int, start_time: datetime, end_time: datetime) -> bool:
    q = db.query(Reservation).filter(
        Reservation.asset_id == asset_id,
        Reservation.status == ReservationStatus.active,
        Reservation.start_time < end_time,
        Reservation.end_time > start_time
    )
    return db.query(q.exists()).scalar()

def create_reservation(db: Session, payload: ReservationCreate, user_name: str) -> Reservation:
    r = Reservation(
        asset_id=payload.asset_id,
        user_name=user_name,
        start_time=payload.start_time,
        end_time=payload.end_time,
        purpose=payload.purpose,
        status=ReservationStatus.active
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return r

def list_reservations_for_asset(db: Session, asset_id: int):
    return db.query(Reservation).filter(Reservation.asset_id == asset_id).all()

def get_reservation(db: Session, reservation_id: int):
    return db.get(Reservation, reservation_id)

def cancel_reservation(db: Session, reservation: Reservation):
    reservation.status = ReservationStatus.cancelled
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation
