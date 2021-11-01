from functools import lru_cache
from os.path import dirname, abspath, join, exists
from pydantic import BaseSettings


class Settings(BaseSettings):
    sqlite: str

    def get_db_url(self) -> str:
        filename = join(
            dirname(dirname(abspath(__file__))),
            'storage',
            self.sqlite
        )
        if not exists(filename):
            with open(filename, "wb") as f:
                pass
        return 'sqlite:///{}'.format(filename)

    class Config:
        env_file = join(dirname(abspath(__file__)), '.env')

@lru_cache()
def get_settings():
    return Settings()
