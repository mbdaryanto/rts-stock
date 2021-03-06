from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from ..settings import get_settings


engine = create_engine(
    get_settings().get_db_url(),
    future=True,
    # if using sqlite
    connect_args={"check_same_thread": False} if get_settings().db_driver == 'sqlite' else {}
)


def get_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session
