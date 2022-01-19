from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy import select, and_, or_, update
from sqlalchemy.orm import Session
from pydantic import parse_obj_as, BaseModel

from ..db.connection import get_session
from ..db.schema import Sales, SalesD, MarketPlace
from ..model.sales import SalesModel, MarketPlaceModel

router = APIRouter(
    prefix='/sales',
    tags=['sales'],
)





