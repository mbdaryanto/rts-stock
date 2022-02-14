from typing import Optional, List
import datetime
from pydantic import BaseModel, constr
from .item import ItemModel
from .market_place import MarketPlaceModel


class PurchaseDModel(BaseModel):
    id: Optional[int] = None
    purchaseId: Optional[int] = None
    itemId: int
    quantity: float = 0.0
    unitPrice: float = 0.0

    item: Optional[ItemModel] = None

    class Config:
        orm_mode = True


class PurchaseModel(BaseModel):
    id: Optional[int] = None
    code: constr(max_length=50)
    marketPlaceId: Optional[int] = None
    date: datetime.date

    purchased_collection: List[PurchaseDModel] = []
    marketPlace: Optional[MarketPlaceModel] = None

    class Config:
        orm_mode = True
