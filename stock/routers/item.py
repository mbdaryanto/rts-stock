from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy import select, and_, or_, update
from sqlalchemy.orm import Session
from pydantic import parse_obj_as, BaseModel

from ..db.connection import get_session
from ..db.schema import Item, ItemCategory
from ..model.item import ItemModel, ItemCategoryModel

router = APIRouter(
    prefix='/item',
    tags=['item'],
)


@router.get('/category/list', response_model=List[ItemCategoryModel])
async def get_item_category_list(
    q: str = '',
    limit: int = 20,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    result = session.execute(
        select(ItemCategory).limit(limit).offset(offset)
    ).scalars().all()

    return result


@router.get('/list', response_model=List[ItemModel])
async def get_item_list(
    q: str = '',
    limit: int = 20,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    condition = or_(
        Item.code.contains(q),
        Item.name.contains(q),
        Item.description.contains(q),
        ItemCategory.name.contains(q),
    )
    result = session.execute(
        select(
            Item, ItemCategory
        ).outerjoin(
            Item.category
        ).where(
            condition
        ).limit(limit).offset(offset)
    ).scalars().all()

    return parse_obj_as(List[ItemModel], result)


@router.post('/get/{item_id}', response_model=ItemModel)
async def get_item_by_id(
    item_id: int,
    session: Session = Depends(get_session),
):
    return session.execute(
        select(
            Item, ItemCategory
        ).outerjoin(
            Item.category
        ).where(
            Item.id == item_id
        )
    ).scalars().one()


class SaveResponse(BaseModel):
    success: bool = True
    error: Optional[str] = None
    item: Optional[ItemModel] = None


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
            saved_item = item
        else:
            new_item = Item(**item.dict())
            session.add(new_item)
            saved_item = ItemModel.from_orm(new_item)

        session.commit()
        return SaveResponse(item=saved_item)

    except Exception as ex:
        session.rollback()
        return SaveResponse(success=False, error=str(ex))

