from typing import Optional, Generic, TypeVar
from pydantic import validator
from pydantic.generics import GenericModel


DataT = TypeVar('DataT')


class SaveResponse(GenericModel, Generic[DataT]):
    success: bool = True
    data: Optional[DataT] = None
    error: Optional[str] = None

    @validator('error', always=True)
    def check_consistency(cls, v, values):
        if v is not None and values['data'] is not None:
            raise ValueError('must not provide both data and error')
        if v is None and values.get('data') is None:
            raise ValueError('must provide data or error')
        return v
