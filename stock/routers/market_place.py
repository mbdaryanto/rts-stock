from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy import select, and_, or_, update
from sqlalchemy.orm import Session
from pydantic import parse_obj_as, BaseModel

from ..db.connection import get_session
from ..db.schema import MarketPlace
from ..model.sales import MarketPlaceModel
from ..model.commons import SaveResponse

router = APIRouter(
    prefix='/market-place',
    tags=['market-place'],
)


@router.get('/list', response_model=List[MarketPlaceModel])
async def get_market_place_list(
    q: str = '',
    limit: int = 20,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    if q:
        keywords = q.split(' ')
        conditions = [
            or_(
                MarketPlace.name.contains(keyword),
                MarketPlace.description.contains(keyword),
            )
            for keyword in keywords if len(keyword) > 0
        ]
    else:
        conditions = []

    result = session.execute(
        select(
            MarketPlace
        ).where(
            and_(
                *conditions
            )
        ).limit(limit).offset(offset)
    ).scalars().all()

    return parse_obj_as(List[MarketPlaceModel], result)


@router.post('/get/{market_place_id}', response_model=MarketPlaceModel)
async def get_market_place_by_id(
    market_place_id: int,
    session: Session = Depends(get_session),
):
    return session.execute(
        select(
            MarketPlace
        ).where(
            MarketPlace.id == market_place_id
        )
    ).scalars().one()


@router.post('/save', response_model=SaveResponse)
async def save_market_place(
    data: MarketPlaceModel,
    session: Session = Depends(get_session),
):
    try:
        if data.id is not None:
            result = session.execute(
                update(MarketPlace).where(
                    MarketPlace.id == data.id
                ).values(
                    **data.dict(exclude={'id'})
                )
            )
            assert result.rowcount == 1, 'Error item not found'
            session.commit()
            saved_data = MarketPlaceModel.from_orm(
                session.execute(
                    select(MarketPlace).where(
                        MarketPlace.id == data.id
                    ).limit(1)
                ).scalar_one_or_none()
            )
        else:
            new_data = MarketPlace(**data.dict(exclude={'id'}))
            session.add(new_data)
            session.commit()
            saved_data = MarketPlaceModel.from_orm(new_data)

        return SaveResponse(data=saved_data)

    except Exception as ex:
        session.rollback()
        return SaveResponse(success=False, error=str(ex))
