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


class SaveResponse(BaseModel):
    success: bool = True
    error: Optional[str] = None
    item: Optional[ItemModel] = None
    itemCategory: Optional[ItemCategoryModel] = None


@router.get('/category/list', response_model=List[ItemCategoryModel])
async def get_item_category_list(
    q: str = '',
    limit: int = 20,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    if q:
        keywords = q.split(' ')
        conditions = [
            or_(
                Item.Kode.contains(keyword),
                Item.Nama.contains(keyword),
                Item.Barcode.contains(keyword),
                Item.Singkatan.contains(keyword),
                Item.Satuan.contains(keyword),
            )
            for keyword in keywords if len(keyword) > 0
        ]
    else:
        conditions = []

    result = session.execute(
        select(
            ItemCategory
        ).where(
            and_(
                *conditions
            )
        ).limit(limit).offset(offset)
    ).scalars().all()

    return result


@router.post('/category/save', response_model=SaveResponse)
async def save_item_category(
    itemCategory: ItemCategoryModel,
    session: Session = Depends(get_session),
):
    try:
        if itemCategory.id is not None:
            result = session.execute(
                update(ItemCategory).where(
                    ItemCategory.id == itemCategory.id
                ).values(
                    **itemCategory.dict(exclude={'id'})
                )
            )
            assert result.rowcount == 1, 'Error item category not found'
            session.commit()
            saved_item_category = itemCategory
        else:
            new_item_category = ItemCategory(**itemCategory.dict(exclude={'id'}))
            session.add(new_item_category)
            session.commit()
            saved_item_category = ItemCategoryModel.from_orm(new_item_category)

        return SaveResponse(itemCategory=saved_item_category)

    except Exception as ex:
        session.rollback()
        return SaveResponse(success=False, error=str(ex))


@router.get('/list', response_model=List[ItemModel])
async def get_item_list(
    q: str = '',
    limit: int = 20,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    if q:
        keywords = q.split(' ')
        conditions = [
            or_(
                Item.Kode.contains(keyword),
                Item.Nama.contains(keyword),
                Item.Barcode.contains(keyword),
                Item.Singkatan.contains(keyword),
                Item.Satuan.contains(keyword),
            )
            for keyword in keywords if len(keyword) > 0
        ]
    else:
        conditions = []

    result = session.execute(
        select(
            Item, ItemCategory
        ).outerjoin(
            Item.category
        ).where(
            and_(
                *conditions
            )
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
                    **item.dict(exclude={'id', 'category'})
                )
            )
            assert result.rowcount == 1, 'Error item not found'
            session.commit()
            saved_item = ItemModel.from_orm(
                session.execute(
                    select(Item, ItemCategory).where(
                        Item.id == item.id
                    ).limit(1)
                ).scalar_one_or_none()
            )
        else:
            new_item = Item(**item.dict(exclude={'id', 'category'}))
            session.add(new_item)
            session.commit()
            saved_item = ItemModel.from_orm(new_item)

        return SaveResponse(item=saved_item)

    except Exception as ex:
        session.rollback()
        return SaveResponse(success=False, error=str(ex))

