from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, parse_obj_as
import strawberry
from sqlalchemy.orm import Session
from ..db.connection import engine
from ..db.schema import Item

@strawberry.type
class ItemType:
    id: Optional[int]
    code: str
    categoryId: Optional[int]
    name: str
    description: Optional[str]
    sellingPrice: Optional[Decimal]

@strawberry.type
class Item2Type(BaseModel):
    id: Optional[int]
    code: str
    categoryId: Optional[int]
    name: str
    description: Optional[str]
    sellingPrice: Optional[Decimal]

    class Config:
        orm_mode = True

def get_items() -> List[ItemType]:
    return [
        ItemType(
            id=1,
            code='Test',
            categoryId=1,
            name='test',
            description='test item',
            sellingPrice=Decimal('0'),
        )
    ]

def get_items2(id: Optional[int]) -> List[Item2Type]:
    with Session(engine) as session:
        if id is None:
            items = session.query(Item).all()
            return parse_obj_as(List[Item2Type], items)
        else:
            items = session.query(Item).filter_by(id=id).all()
            return parse_obj_as(List[Item2Type], items)

@strawberry.type
class Query:
    items: List[ItemType] = strawberry.field(resolver=get_items)
    items2: List[Item2Type] = strawberry.field(resolver=get_items2)

schema = strawberry.Schema(query=Query)
