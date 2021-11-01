from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, constr


class ItemModel(BaseModel):
    id: Optional[int] = None
    code: constr(max_length=50)
    categoryId: Optional[int] = None
    name: constr(max_length=100)
    description: Optional[str]
    sellingPrice: Optional[Decimal] = None

    class Config:
        orm_mode = True
