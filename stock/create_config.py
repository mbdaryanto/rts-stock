from os.path import join, dirname, abspath
from collections import OrderedDict
from secrets import choice, token_hex
from binascii import unhexlify
from cryptography.fernet import Fernet
from base64 import urlsafe_b64encode, urlsafe_b64decode
from rich.prompt import IntPrompt, Prompt
from rich.console import Console
from .settings import get_settings


DRIVERS = [
    'mysql',
    'sqlite',
]


def create_config():
    console = Console()
    settings = get_settings()
    console.print('Change Settings [old values], blank = keep old values')
    values = OrderedDict()

    if settings.secret_key:
        values['SECRET_KEY'] = settings.secret_key
    else:
        values['SECRET_KEY'] = token_hex(32)

    key = urlsafe_b64encode(unhexlify(values['SECRET_KEY']))
    fernet = Fernet(key)

    console.print('Setting database connection')

    # console.print('[bold]Database Drivers[/bold]')
    # for index, driver in enumerate(DRIVERS):
    #     if settings.driver == driver:
    #         console.print('[italic]{}. {}[/italic]'.format(index, driver))
    #     else:
    #         console.print('{}. {}'.format(index, driver))

    values['DRIVER'] = Prompt.ask(
        'Select db driver',
        console=console,
        choices=DRIVERS,
        default=settings.driver,
    )
    if values['DRIVER'] == 'sqlite':
        values['DB'] = Prompt.ask('filename', console=console, default=settings.db)
    else:
        values['DB'] = Prompt.ask('host:port/db', console=console, default=settings.db)
        values['DB_USER'] = Prompt.ask('user', console=console, default=settings.db_user)
        values['DB_PASSWORD'] = encrypt(
            fernet,
            Prompt.ask(
                'password',
                console=console,
                default='' if not settings.db_password else decrypt(fernet, settings.db_password),
                show_default=False,
                password=True
            )
        )

    env_file = join(dirname(abspath(__file__)), '.env')
    print('Create settings and save to: {}'.format(env_file))

    with open(env_file, "wt") as f:
        for key, value in values.items():
            print("{}={!r}".format(key, value), file=f)


def encrypt(fernet: Fernet, plain_text: str) -> str:
    cipher_text = fernet.encrypt(plain_text.encode('ascii'))
    return urlsafe_b64encode(cipher_text).decode('ascii')


def decrypt(fernet: Fernet, cipher_text: str) -> str:
    decoded_cipher_text = urlsafe_b64decode(cipher_text)
    plain_text = fernet.decrypt(decoded_cipher_text)
    return plain_text.decode('ascii')


if __name__ == '__main__':
    create_config()
