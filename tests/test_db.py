from typing import List, Tuple
from random import choice
from sqlalchemy import select, func
from sqlalchemy.engine import create_engine
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

def test_query():
    engine = create_engine(get_settings().get_db_url(), echo=True)
    with Session(engine) as session:
        result: List[Tuple[schema.Item, schema.ItemCategory]] = session.execute(
            select(schema.Item, schema.ItemCategory).join(schema.Item.category)
        ).scalars().all()
        if len(result) > 0:
            for row in result:
                item = row
                print(item.id, item.code, item.name, item.category.name)
        else:
            cats: List[schema.ItemCategory] = session.query(schema.ItemCategory).all()
            for n in range(1, 5):
                session.add(
                    schema.Item(
                        code='T00{}'.format(n),
                        name='Test {}'.format(n),
                        description='Testing item',
                        sellingPrice=10500,
                        category=choice(cats),
                    )
                )
            session.commit()


