from rich.prompt import IntPrompt, Prompt
from rich.console import Console
from .settings import Settings


DRIVERS = [
    'mysql',
    'sqlite',
]


def create_config():
    console = Console()
    settings = Settings()
    console.print('Change Settings [old values], blank = keep old values')

    if not settings.secret_key:
        settings.generate_secret_key()

    console.print('Setting database connection')

    settings.db_driver = Prompt.ask(
        'Select db driver',
        console=console,
        choices=DRIVERS,
        default=settings.db_driver,
    )

    if settings.db_driver == 'sqlite':
        settings.db_database = Prompt.ask('filename', console=console, default=settings.db_database)
    elif settings.db_driver == 'mysql':
        settings.db_host = Prompt.ask('host', console=console, default=settings.db_database)
        settings.db_port = IntPrompt.ask('port', console=console, default=settings.db_port)
        settings.db_database = Prompt.ask('database', console=console, default=settings.db_database)
        settings.db_user = Prompt.ask('user', console=console, default=settings.db_user)
        settings.set_password(
            Prompt.ask(
                'password',
                console=console,
                default='' if not settings.db_password else settings.get_password(),
                show_default=False,
                password=True,
            )
        )
    else:
        raise Exception('Unknown db driver {}, supported driver: mysql, sqlite'.format(settings.db_driver))

    console.print('Create settings and save to: {}'.format(settings.Config.env_file))
    settings.save()


if __name__ == '__main__':
    create_config()
