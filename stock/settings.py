from typing import Optional
from urllib.parse import quote_plus
from functools import lru_cache
from base64 import urlsafe_b64encode, urlsafe_b64decode
from binascii import unhexlify
from os import makedirs
from os.path import dirname, abspath, join, exists
from pydantic import BaseSettings
from sqlalchemy.engine import URL, make_url
from cryptography.fernet import Fernet


class Settings(BaseSettings):
    secret_key: Optional[str] = None
    driver: str = 'mysql'
    db: str = 'localhost/db'
    db_user: Optional[str] = 'user'
    db_password: Optional[str] = ''

    def get_db_url(self) -> URL:
        kwargs = {}

        if self.driver == 'mysql':
            drivername = 'mysql+mysqlconnector'
            server, kwargs['database'] = self.db.split('/')
            server_port = server.split(':')
            if len(server_port) == 0:
                raise ValueError('DB tidak sesuai dengan format host:port/database {!r}'.format(self.db))

            kwargs['host'] = server_port[0]
            if len(server_port) == 2:
                kwargs['port'] = int(server_port[1])

            kwargs['username'] = self.db_user
            if self.db_password:
                kwargs['password'] = decrypt(self.secret_key, self.db_password)

        elif self.driver == 'sqlite':
            default_storage_dir = join(
                dirname(dirname(abspath(__file__))),
                'storage',
            )
            filename = join(
                default_storage_dir,
                self.db
            )
            if not exists(filename):
                makedirs(default_storage_dir, exist_ok=True)
                with open(filename, "wb") as f:
                    pass

            return make_url('sqlite:///{}'.format(filename))
        else:
            raise Exception('unknown driver {}'.format(self.driver))

        return URL.create(drivername, **kwargs)

    class Config:
        env_file = join(dirname(abspath(__file__)), '.env')


def decrypt(secret_key: str, cipher_text: str) -> str:
    decoded_cipher_text = urlsafe_b64decode(cipher_text)
    fernet = Fernet(urlsafe_b64encode(unhexlify(secret_key)))
    plain_text = fernet.decrypt(decoded_cipher_text)
    return plain_text.decode('ascii')


@lru_cache()
def get_settings():
    return Settings()
