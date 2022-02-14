from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy import select, and_, or_, update
from sqlalchemy.orm import Session
from pydantic import parse_obj_as, BaseModel

from ..db.connection import get_session
from ..db.schema import Purchase, PurchaseD
from ..model.purchase import PurchaseModel
from ..model.market_place import MarketPlaceModel


router = APIRouter(
    prefix='/purchase',
    tags=['purchase'],
)


@router.post('/save')
async def save_purchase(
    purchase: PurchaseModel,
    session: Session = Depends(get_session),
):
    if purchase.id is None:
        purchase = Purchase(
            **purchase.dict(exclude=set('id', 'purchased_collection', 'marketPlace'))
        )
        session.add(purchase)
        session.commit()
    else:
        session.execute(
            update(Purchase).where(
                Purchase.id == purchase.id
            ).values(
                **purchase.dict(exclude=set('id', 'purchased_collection', 'marketPlace'))
            )
        )
        purchase: Purchase = session.execute(
            select(Purchase).where(
                Purchase.id == purchase.id
            )
        ).scalar_one_or_none()
        session.commit()

    return PurchaseModel.from_orm(purchase)

