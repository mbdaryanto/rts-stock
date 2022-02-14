from sqlalchemy import Column, Integer, LargeBinary, String, Numeric, Date, Enum, Boolean, Text, ForeignKey, UniqueConstraint, Index, MetaData
from sqlalchemy.orm import declarative_base, relation, relationship


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
    description = Column(Text)
    isActive = Column(Boolean, nullable=False, default=True, server_default='1')


class Item(Base):
    __tablename__ = 'mitem'
    id = Column(Integer, primary_key=True)
    code = Column(String(50), nullable=False)
    categoryId = Column(Integer, ForeignKey(ItemCategory.id))
    name = Column(String(100))
    description = Column(Text)
    sellingPrice = Column(Numeric(20, 0))
    isActive = Column(Boolean, nullable=False, default=True, server_default='1')

    category = relationship('ItemCategory', backref='item_collection')

    UniqueConstraint(code)


class ItemImg(Base):
    __tablename__ = 'mitemimg'
    id = Column(Integer, primary_key=True)
    itemId = Column(Integer, ForeignKey(Item.id, ondelete='CASCADE', onupdate='CASCADE'), nullable=False)
    contentType = Column(String(50))
    content = Column(LargeBinary(10_000_000))
    originalFileName = Column(String(255))

    item = relationship('Item', backref='item_images')


class MarketPlace(Base):
    __tablename__ = 'mmarketplace'
    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False)
    description = Column(Text)
    isActive = Column(Boolean, nullable=False, default=True, server_default='1')


class Sales(Base):
    __tablename__ = 'tsales'
    id = Column(Integer, primary_key=True)
    code = Column(String(50), nullable=False)
    marketPlaceId = Column(Integer, ForeignKey(MarketPlace.id))
    date = Column(Date)

    marketPlace = relationship('MarketPlace', backref='sales_collection')
    details = relationship('SalesD', back_populates='sales')

    UniqueConstraint(code)
    Index('Idx_date', date)


class SalesD(Base):
    __tablename__ = 'tsalesd'
    id = Column(Integer, primary_key=True)
    salesId = Column(Integer, ForeignKey(Sales.id, ondelete='CASCADE', onupdate='CASCADE'), nullable=False)
    itemId = Column(Integer, ForeignKey(Item.id), nullable=False)
    quantity = Column(Numeric(20, 2), nullable=False)
    unitPrice = Column(Numeric(20, 0))

    sales = relationship('Sales', back_populates='details')
    item = relationship('Item')


class Purchase(Base):
    __tablename__ = 'tpurchase'
    id = Column(Integer, primary_key=True)
    code = Column(String(50), nullable=False)
    date = Column(Date)
    marketPlaceId = Column(Integer, ForeignKey(MarketPlace.id))

    marketPlace = relationship('MarketPlace', backref='purchase_collection')
    details = relationship('PurchaseD', back_populates='purchase')

    UniqueConstraint(code)
    Index('Idx_date', date)


class PurchaseD(Base):
    __tablename__ = 'tpurchased'
    id = Column(Integer, primary_key=True)
    purchaseId = Column(Integer, ForeignKey(Purchase.id, ondelete='CASCADE', onupdate='CASCADE'), nullable=False)
    itemId = Column(Integer, ForeignKey(Item.id), nullable=False)
    quantity = Column(Numeric(20, 2), nullable=False)
    unitPrice = Column(Numeric(20, 0))

    purchase = relationship('Purchase', back_populates='details')
    item = relationship('Item')


class ItemJournal(Base):
    __tablename__ = 'titemjournal'
    id = Column(Integer, primary_key=True)
    itemId = Column(Integer, ForeignKey(Item.id), nullable=False)
    date = Column(Date, nullable=False)
    quantity = Column(Numeric(20, 2), nullable=False)
    value = Column(Numeric(20, 2))
    journalType = Column(Enum('Initial Stock', 'Buy', 'Sell', 'Correction', 'Ending Balance'), nullable=False)
    refCode = Column(String(100))
    salesDId = Column(Integer, ForeignKey(SalesD.id, ondelete='CASCADE', onupdate='CASCADE'))
    purchaseDId = Column(Integer, ForeignKey(PurchaseD.id, ondelete='CASCADE', onupdate='CASCADE'))

    item = relationship('Item', backref='itemjournal')
    salesd = relationship('SalesD', backref='itemjournal')
    purchased = relationship('PurchaseD', backref='itemjournal')

    Index('Idx_itemId_date', itemId, date)
