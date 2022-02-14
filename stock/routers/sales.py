from typing import Optional, List
from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy import select, and_, or_, update
from sqlalchemy.orm import Session
from pydantic import parse_obj_as, BaseModel

from ..db.connection import get_session
from ..db.schema import Sales, SalesD, MarketPlace
from ..model.sales import SalesModel
from ..model.market_place import MarketPlaceModel


router = APIRouter(
    prefix='/sales',
    tags=['sales'],
)


@router.post('/import-tokopedia')
async def tokopedia_xlsx(
    xlsx_file: UploadFile,
    session: Session = Depends(get_session),
):
    pass
