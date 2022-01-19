from typing import Optional, TypeVar, Generic
from pydantic import BaseModel


T = TypeVar('T', BaseModel)


class SaveResponse(BaseModel, Generic[T]):
    success: bool = True
    error: Optional[str] = None
    data: Optional[T] = None
