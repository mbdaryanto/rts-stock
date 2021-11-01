from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import Session
from pydantic import parse_obj_as

from ..db.connection import get_session
from ..db.schema import Item
from ..model.item import ItemModel

router = APIRouter(
    prefix='/item',
    tags=['item'],
)

@router.get('/list', response_model=List[ItemModel])
async def get_list(
    q: str = '',
    limit: int = 20,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    result = session.execute(
        select(Item).limit(limit).offset(offset)
    ).scalars().all()

    return parse_obj_as(List[ItemModel], result)
