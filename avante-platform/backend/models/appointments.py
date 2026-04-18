from core.database import Base
from sqlalchemy import Column, DateTime, Integer, String


class Appointments(Base):
    __tablename__ = "appointments"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    paciente_nombre = Column(String, nullable=False)
    fecha = Column(String, nullable=True)
    tipo = Column(String, nullable=True)
    notas = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)