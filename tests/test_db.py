from sqlalchemy import select, func
from sqlalchemy.orm import Session
from stock.settings import get_settings
from stock.db.connection import engine
from stock.db import schema


def test_settings():
    settings = get_settings()
    print(settings.get_db_url())


def test_create_db():
    engine.echo = True
    schema.metadata.create_all(engine, checkfirst=True)
    with Session(engine) as session:
        category_count = session.execute(
            select(func.count(schema.ItemCategory.id).label('count'))
        ).scalars().one()
        print('Category Count = ', category_count)
        if category_count == 0:
            session.add_all([
                schema.ItemCategory(name='Perlengkapan Bayi'),
                schema.ItemCategory(name='Perlengkapan Rumah Tangga'),
                schema.ItemCategory(name='Perawatan Tubuh'),
                schema.ItemCategory(name='Perawatan Mobil'),
            ])
            session.commit()
