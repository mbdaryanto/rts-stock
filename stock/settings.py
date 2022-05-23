from typing import Optional
from pathlib import Path
from functools import lru_cache
from pydantic import BaseSettings
from cryptography.fernet import Fernet
from sqlalchemy.engine import URL


class Settings(BaseSettings):
    secret_key: Optional[str] = None
    db_driver: str = 'mysql'
    db_host: str = 'localhost'
    db_port: int = 3306
    db_database: str = 'test'
    db_user: str = 'user'
    db_password: Optional[str] = None

    class Config:
        env_file = Path(__file__).parent / '.env'

    def save(self) -> None:
        with open(self.Config.env_file, 'wt') as out:
            for key, value in self.dict().items():
                out.write('{}={!r}\n'.format(key.upper(), value))

    def generate_secret_key(self):
        self.secret_key = Fernet.generate_key().decode('utf-8')

    def get_password(self) -> str:
        if self.secret_key is None:
            raise Exception('Secret key is not generated')
        if self.db_password is None:
            raise Exception('DB Password is not configured')
        fernet = Fernet(self.secret_key.encode('utf-8'))
        return fernet.decrypt(self.db_password.encode('utf-8')).decode('utf-8')

    def set_password(self, password: str) -> None:
        if self.secret_key is None:
            raise Exception('Secret is not generated')
        fernet = Fernet(self.secret_key.encode('utf-8'))
        self.db_password = fernet.encrypt(password.encode('utf-8')).decode('utf-8')

    def get_db_url(self) -> URL:
        if self.db_driver == 'mysql':
            password = self.get_password()
            return URL.create(
                drivername='mysql+pymysql',
                username=self.db_user,
                password=password,
                host=self.db_host,
                port=self.db_port,
                database=self.db_database,
            )
        elif self.db_driver == 'sqlite':
            storage_path = Path(__file__).parent.parent / 'storage'
            if not storage_path.exists():
                storage_path.mkdir()

            sqlite_file_path = storage_path / '{}.db'.format(self.db_database)
            if not sqlite_file_path.exists():
                sqlite_file_path.touch()

            return URL.create(
                drivername='sqlite',
                database=str(sqlite_file_path),
            )
        else:
            raise Exception('Unknown db driver {}, supported driver: mysql, sqlite'.format(self.db_driver))


@lru_cache()
def get_settings():
    return Settings()
