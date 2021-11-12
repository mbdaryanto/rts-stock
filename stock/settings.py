from functools import lru_cache
from os import makedirs
from os.path import dirname, abspath, join, exists
from pydantic import BaseSettings


class Settings(BaseSettings):
    sqlite: str = 'stock.db'

    def get_db_url(self) -> str:
        default_storage_dir = join(
            dirname(dirname(abspath(__file__))),
            'storage',
        )
        filename = join(
            default_storage_dir,
            self.sqlite
        )
        if not exists(filename):
            makedirs(default_storage_dir, exist_ok=True)
            with open(filename, "wb") as f:
                pass
        return 'sqlite:///{}'.format(filename)

    class Config:
        env_file = join(dirname(abspath(__file__)), '.env')

@lru_cache()
def get_settings():
    return Settings()
