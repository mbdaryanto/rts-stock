from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, constr


class ItemCategoryModel(BaseModel):
    id: Optional[int] = None
    name: constr(max_length=100)
    description: Optional[str]
    isActive: bool = True

    class Config:
        orm_mode = True


class ItemModel(BaseModel):
    id: Optional[int] = None
    code: constr(max_length=50)
    categoryId: Optional[int] = None
    name: constr(max_length=100)
    description: Optional[str]
    sellingPrice: Optional[Decimal] = None
    isActive: bool = True

    category: Optional[ItemCategoryModel] = None

    class Config:
        orm_mode = True
