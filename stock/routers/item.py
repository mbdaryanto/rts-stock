from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy import select, and_, or_, update
from sqlalchemy.orm import Session
from pydantic import parse_obj_as, BaseModel

from ..db.connection import get_session
from ..db.schema import Item
from ..model.item import ItemModel

router = APIRouter(
    prefix='/item',
    tags=['item'],
)

@router.get('/list', response_model=List[ItemModel])
async def get_item_list(
    q: str = '',
    limit: int = 20,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    result = session.execute(
        select(Item).limit(limit).offset(offset)
    ).scalars().all()

    return parse_obj_as(List[ItemModel], result)

@router.post('/get/{item_id}', response_model=ItemModel)
async def get_item_by_id(
    item_id: int,
    session: Session = Depends(get_session),
):
    return session.execute(
        select(Item).where(Item.id == item_id)
    ).scalars().one()

class SaveResponse(BaseModel):
    success: bool = True
    error: Optional[str] = None

@router.post('/save', response_model=SaveResponse)
async def save_item(
    item: ItemModel,
    session: Session = Depends(get_session),
):
    try:
        if item.id is not None:
            result = session.execute(
                update(Item).where(
                    Item.id == item.id
                ).values(
                    **item.dict(exclude={'id'})
                )
            )
            assert result.rowcount == 1, 'Error item not found'

        else:
            new_item = Item(**item.dict())
            session.add(new_item)

        session.commit()
        return SaveResponse()

    except Exception as ex:
        session.rollback()
        return SaveResponse(success=False, error=str(ex))

