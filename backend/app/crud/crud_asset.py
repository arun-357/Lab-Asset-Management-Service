from sqlalchemy.orm import Session
from app.models.asset import Asset
from app.schemas.asset import AssetCreate

def create_asset(db: Session, payload: AssetCreate) -> Asset:
    a = Asset(name=payload.name, ip_address=str(payload.ip_address), description=payload.description)
    db.add(a)
    db.commit()
    db.refresh(a)
    return a

def list_assets(db: Session):
    return db.query(Asset).all()

def get_asset(db: Session, asset_id: int):
    return db.get(Asset, asset_id)

def update_asset(db: Session, asset: Asset, **kwargs):
    for k, v in kwargs.items():
        setattr(asset, k, v)
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset

def delete_asset(db: Session, asset: Asset):
    db.delete(asset)
    db.commit()
