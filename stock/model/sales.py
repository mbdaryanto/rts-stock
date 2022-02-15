from typing import Optional, List
import datetime
from pydantic import BaseModel, constr
from .item import ItemModel
from .market_place import MarketPlaceModel

class SalesDModel(BaseModel):
    id: Optional[int] = None
    salesId: Optional[int] = None
    itemId: int
    quantity: float = 0.0
    unitPrice: float = 0.0

    item: Optional[ItemModel] = None

    class Config:
        orm_mode = True


class SalesModel(BaseModel):
    id: Optional[int] = None
    code: constr(max_length=50)
    date: datetime.date
    marketPlaceId: Optional[int] = None

    details: List[SalesDModel] = []
    marketPlace: Optional[MarketPlaceModel] = None

    class Config:
        orm_mode = True
