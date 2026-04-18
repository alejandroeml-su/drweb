from core.database import Base
from sqlalchemy import Column, DateTime, Integer, String


class Patients(Base):
    __tablename__ = "patients"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True, autoincrement=True, nullable=False)
    user_id = Column(String, nullable=False)
    expediente = Column(String, nullable=True)
    nombre = Column(String, nullable=False)
    apellido = Column(String, nullable=False)
    edad = Column(Integer, nullable=True)
    sexo = Column(String, nullable=True)
    peso = Column(String, nullable=True)
    talla = Column(String, nullable=True)
    procedimiento = Column(String, nullable=True)
    comorbilidades = Column(String, nullable=True)
    otros_antecedentes = Column(String, nullable=True)
    asa = Column(String, nullable=True)
    funcional = Column(String, nullable=True)
    telefono = Column(String, nullable=True)
    email_paciente = Column(String, nullable=True)
    medico = Column(String, nullable=True)
    medico_id = Column(String, nullable=True)
    historia_clinica = Column(String, nullable=True)
    eoss_metabolico = Column(Integer, nullable=True)
    eoss_mecanico = Column(Integer, nullable=True)
    eoss_psico = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=True)