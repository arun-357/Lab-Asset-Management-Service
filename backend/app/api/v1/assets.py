from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_db, require_admin, get_current_user
from app.schemas.asset import AssetCreate, AssetRead
from app.crud.crud_asset import create_asset, list_assets, get_asset, update_asset, delete_asset

router = APIRouter()

@router.get("/", response_model=List[AssetRead], dependencies=[Depends(get_current_user)])
def read_assets(db: Session = Depends(get_db)):
    return list_assets(db)

@router.post("/", response_model=AssetRead, status_code=201, dependencies=[Depends(require_admin)])
def create_new_asset(payload: AssetCreate, db: Session = Depends(get_db)):
    return create_asset(db, payload)

@router.get("/{asset_id}", response_model=AssetRead, dependencies=[Depends(get_current_user)])
def read_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = get_asset(db, asset_id)
    if not asset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    return asset

@router.put("/{asset_id}", response_model=AssetRead, dependencies=[Depends(require_admin)])
def update_existing_asset(asset_id: int, payload: AssetCreate, db: Session = Depends(get_db)):
    asset = get_asset(db, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return update_asset(db, asset, name=payload.name, ip_address=str(payload.ip_address), description=payload.description)

@router.delete("/{asset_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_existing_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = get_asset(db, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    delete_asset(db, asset)
    return {"ok": True}
