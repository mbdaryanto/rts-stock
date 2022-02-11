from typing import Optional
from pydantic import BaseModel


class SaveResponse(BaseModel):
    success: bool = True
    error: Optional[str] = None
    data: Optional[BaseModel] = None
