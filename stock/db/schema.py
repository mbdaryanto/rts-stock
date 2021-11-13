from sqlalchemy import Column, Integer, String, Numeric, Date, Enum, Text, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.sql.expression import null
from sqlalchemy.sql.schema import MetaData

convention = {
    "ix": "Idx_%(column_0_label)s",
    "uq": "Idx_%(table_name)s_%(column_0_name)s",
    "fk": "FK_%(table_name)s_%(column_0_name)s",
}

metadata = MetaData(naming_convention=convention)
Base = declarative_base(metadata=metadata)


class ItemCategory(Base):
    __tablename__ = 'mitemcategory'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)


class Item(Base):
    __tablename__ = 'mitem'
    id = Column(Integer, primary_key=True)
    code = Column(String(50), nullable=False)
    categoryId = Column(Integer, ForeignKey(ItemCategory.id))
    name = Column(String(100))
    description = Column(Text)
    sellingPrice = Column(Numeric(20, 0))

    category = relationship('ItemCategory', backref='item_collection')

    UniqueConstraint(code)


class ItemJournal(Base):
    __tablename__ = 'titemjournal'
    id = Column(Integer, primary_key=True)
    itemId = Column(Integer, ForeignKey(Item.id), nullable=False)
    date = Column(Date, nullable=False)
    quantity = Column(Numeric(20, 2), nullable=False)
    journalType = Column(Enum('Initial Stock', 'Buy', 'Sell', 'Correction', 'Ending Balance'), nullable=False)
    refCode = Column(String(100))

    item = relationship('Item', backref='itemjournal_collection')

    Index('Idx_itemId_date', itemId, date)
