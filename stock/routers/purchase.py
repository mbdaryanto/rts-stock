from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, and_, or_, update, insert, delete
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
        data = Purchase(
            **purchase.dict(exclude={'id', 'details', 'marketPlace'})
        )
        session.add(data)

        details = [
            PurchaseD(
                purchaseId=data.id,
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

    return PurchaseModel.from_orm(data)

