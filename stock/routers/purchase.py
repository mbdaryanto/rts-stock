from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, and_, or_, update, insert, delete
from sqlalchemy.orm import Session
from pydantic import parse_obj_as

from stock.model.commons import SaveResponse

from ..db.connection import get_session
from ..db.schema import Purchase, PurchaseD, MarketPlace
from ..model.purchase import PurchaseModel, PurchaseModelWithDetails


router = APIRouter(
    prefix='/purchase',
    tags=['purchase'],
)


@router.get('/list', response_model=List[PurchaseModel])
async def list_purchase(
    q: str = '',
    limit: int = 20,
    offset: int = 0,
    session: Session = Depends(get_session),
):
    if q:
        keywords = q.split(' ')
        conditions = [
            or_(
                Purchase.code.contains(keyword),
                and_(
                    Purchase.marketPlaceId.isnot(None),
                    MarketPlace.name.contains(keyword),
                )
            )
            for keyword in keywords if len(keyword) > 0
        ]
    else:
        conditions = []

    result = session.execute(
        select(
            Purchase, MarketPlace,
        ).outerjoin(
            Purchase.marketPlace
        ).where(
            and_(
                *conditions
            )
        ).limit(limit).offset(offset)
    ).scalars().all()

    return parse_obj_as(List[PurchaseModel], result)


@router.get('/get/{purchase_id}', response_model=PurchaseModelWithDetails)
async def get_purchase_by_id(
    purchase_id: int,
    session: Session = Depends(get_session),
):
    return PurchaseModelWithDetails.from_orm(
        session.execute(
            select(
                Purchase
            ).where(
                Purchase.id == purchase_id
            )
        ).scalars().one()
    )


@router.post('/save', response_model=SaveResponse[PurchaseModelWithDetails])
async def save_purchase(
    purchase: PurchaseModelWithDetails,
    session: Session = Depends(get_session),
):
    if purchase.id is None:
        data = Purchase(
            **purchase.dict(exclude={'id', 'details', 'marketPlace'})
        )
        session.add(data)

        details = [
            PurchaseD(
                purchase=data,
                **row.dict(exclude={'id', 'item', 'purchase', 'purchaseId'})
            )
            for row in purchase.details
        ]
        session.add_all(details)
        session.commit()
    else:
        session.execute(
            update(Purchase).where(
                Purchase.id == purchase.id
            ).values(
                **purchase.dict(exclude={'id', 'details', 'marketPlace'})
            )
        )

        existing_id: List[int] = session.execute(
            select(PurchaseD.id).where(
                PurchaseD.purchaseId == purchase.id
            )
        ).scalars().all()

        for row in purchase.details:
            if row.id is not None:
                if row.id not in existing_id:
                    raise HTTPException(404, 'PurchaseD.id {} not valid'.format(row.id))
                # if row id is not None and valid -> update row
                existing_id.remove(row.id)
                session.execute(
                    update(PurchaseD).where(
                        and_(
                            PurchaseD.id == row.id,
                            PurchaseD.purchaseId == purchase.id,
                        )
                    ).values(
                        **row.dict(exclude={'id', 'item', 'purchase', 'purchaseId'})
                    )
                )
            else:
                # if row id is None -> insert row
                session.execute(
                    insert(PurchaseD).values(
                        purchaseId=purchase.id,
                        **row.dict(exclude={'id', 'item', 'purchase', 'purchaseId'})
                    )
                )
        # delete existing id not included
        session.execute(
            delete(PurchaseD).where(
                and_(
                    PurchaseD.purchaseId == purchase.id,
                    PurchaseD.id.in_(existing_id),
                )
            )
        )

        data: Purchase = session.execute(
            select(
                Purchase,
                Purchase.details,
                PurchaseD.item,
            ).outerjoin(
                Purchase.details
            ).outerjoin(
                PurchaseD.item
            ).where(
                Purchase.id == purchase.id
            )
        ).scalar_one_or_none()
        session.commit()

    return SaveResponse(
        data=PurchaseModelWithDetails.from_orm(data)
    )

