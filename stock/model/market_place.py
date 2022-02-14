from typing import Optional
from pydantic import BaseModel, constr


class MarketPlaceModel(BaseModel):
    id: Optional[int] = None
    name: constr(max_length=50)
    description: Optional[str]
    isActive: bool = True

    class Config:
        orm_mode = True
