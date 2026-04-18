import json
import logging
from typing import List, Optional

from datetime import datetime, date

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from services.patients import PatientsService
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/entities/patients", tags=["patients"])


# ---------- Pydantic Schemas ----------
class PatientsData(BaseModel):
    """Entity data schema (for create/update)"""
    expediente: str = None
    nombre: str
    apellido: str
    edad: int = None
    sexo: str = None
    peso: str = None
    talla: str = None
    procedimiento: str = None
    comorbilidades: str = None
    otros_antecedentes: str = None
    asa: str = None
    funcional: str = None
    telefono: str = None
    email_paciente: str = None
    medico: str = None
    medico_id: str = None
    historia_clinica: str = None
    eoss_metabolico: int = None
    eoss_mecanico: int = None
    eoss_psico: int = None
    created_at: Optional[datetime] = None


class PatientsUpdateData(BaseModel):
    """Update entity data (partial updates allowed)"""
    expediente: Optional[str] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    edad: Optional[int] = None
    sexo: Optional[str] = None
    peso: Optional[str] = None
    talla: Optional[str] = None
    procedimiento: Optional[str] = None
    comorbilidades: Optional[str] = None
    otros_antecedentes: Optional[str] = None
    asa: Optional[str] = None
    funcional: Optional[str] = None
    telefono: Optional[str] = None
    email_paciente: Optional[str] = None
    medico: Optional[str] = None
    medico_id: Optional[str] = None
    historia_clinica: Optional[str] = None
    eoss_metabolico: Optional[int] = None
    eoss_mecanico: Optional[int] = None
    eoss_psico: Optional[int] = None
    created_at: Optional[datetime] = None


class PatientsResponse(BaseModel):
    """Entity response schema"""
    id: int
    user_id: str
    expediente: Optional[str] = None
    nombre: str
    apellido: str
    edad: Optional[int] = None
    sexo: Optional[str] = None
    peso: Optional[str] = None
    talla: Optional[str] = None
    procedimiento: Optional[str] = None
    comorbilidades: Optional[str] = None
    otros_antecedentes: Optional[str] = None
    asa: Optional[str] = None
    funcional: Optional[str] = None
    telefono: Optional[str] = None
    email_paciente: Optional[str] = None
    medico: Optional[str] = None
    medico_id: Optional[str] = None
    historia_clinica: Optional[str] = None
    eoss_metabolico: Optional[int] = None
    eoss_mecanico: Optional[int] = None
    eoss_psico: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PatientsListResponse(BaseModel):
    """List response schema"""
    items: List[PatientsResponse]
    total: int
    skip: int
    limit: int


class PatientsBatchCreateRequest(BaseModel):
    """Batch create request"""
    items: List[PatientsData]


class PatientsBatchUpdateItem(BaseModel):
    """Batch update item"""
    id: int
    updates: PatientsUpdateData


class PatientsBatchUpdateRequest(BaseModel):
    """Batch update request"""
    items: List[PatientsBatchUpdateItem]


class PatientsBatchDeleteRequest(BaseModel):
    """Batch delete request"""
    ids: List[int]


# ---------- Routes ----------
@router.get("", response_model=PatientsListResponse)
async def query_patientss(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Query patientss with filtering, sorting, and pagination (user can only see their own records)"""
    logger.debug(f"Querying patientss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")
    
    service = PatientsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")
        
        result = await service.get_list(
            skip=skip, 
            limit=limit,
            query_dict=query_dict,
            sort=sort,
            user_id=str(current_user.id),
        )
        logger.debug(f"Found {result['total']} patientss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying patientss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/all", response_model=PatientsListResponse)
async def query_patientss_all(
    query: str = Query(None, description="Query conditions (JSON string)"),
    sort: str = Query(None, description="Sort field (prefix with '-' for descending)"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=2000, description="Max number of records to return"),
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    db: AsyncSession = Depends(get_db),
):
    # Query patientss with filtering, sorting, and pagination without user limitation
    logger.debug(f"Querying patientss: query={query}, sort={sort}, skip={skip}, limit={limit}, fields={fields}")

    service = PatientsService(db)
    try:
        # Parse query JSON if provided
        query_dict = None
        if query:
            try:
                query_dict = json.loads(query)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid query JSON format")

        result = await service.get_list(
            skip=skip,
            limit=limit,
            query_dict=query_dict,
            sort=sort
        )
        logger.debug(f"Found {result['total']} patientss")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error querying patientss: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/{id}", response_model=PatientsResponse)
async def get_patients(
    id: int,
    fields: str = Query(None, description="Comma-separated list of fields to return"),
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single patients by ID (user can only see their own records)"""
    logger.debug(f"Fetching patients with id: {id}, fields={fields}")
    
    service = PatientsService(db)
    try:
        result = await service.get_by_id(id, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Patients with id {id} not found")
            raise HTTPException(status_code=404, detail="Patients not found")
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching patients {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("", response_model=PatientsResponse, status_code=201)
async def create_patients(
    data: PatientsData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new patients"""
    logger.debug(f"Creating new patients with data: {data}")
    
    service = PatientsService(db)
    try:
        result = await service.create(data.model_dump(), user_id=str(current_user.id))
        if not result:
            raise HTTPException(status_code=400, detail="Failed to create patients")
        
        logger.info(f"Patients created successfully with id: {result.id}")
        return result
    except ValueError as e:
        logger.error(f"Validation error creating patients: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating patients: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/batch", response_model=List[PatientsResponse], status_code=201)
async def create_patientss_batch(
    request: PatientsBatchCreateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create multiple patientss in a single request"""
    logger.debug(f"Batch creating {len(request.items)} patientss")
    
    service = PatientsService(db)
    results = []
    
    try:
        for item_data in request.items:
            result = await service.create(item_data.model_dump(), user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch created {len(results)} patientss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch create: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch create failed: {str(e)}")


@router.put("/batch", response_model=List[PatientsResponse])
async def update_patientss_batch(
    request: PatientsBatchUpdateRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update multiple patientss in a single request (requires ownership)"""
    logger.debug(f"Batch updating {len(request.items)} patientss")
    
    service = PatientsService(db)
    results = []
    
    try:
        for item in request.items:
            # Only include non-None values for partial updates
            update_dict = {k: v for k, v in item.updates.model_dump().items() if v is not None}
            result = await service.update(item.id, update_dict, user_id=str(current_user.id))
            if result:
                results.append(result)
        
        logger.info(f"Batch updated {len(results)} patientss successfully")
        return results
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch update: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch update failed: {str(e)}")


@router.put("/{id}", response_model=PatientsResponse)
async def update_patients(
    id: int,
    data: PatientsUpdateData,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update an existing patients (requires ownership)"""
    logger.debug(f"Updating patients {id} with data: {data}")

    service = PatientsService(db)
    try:
        # Only include non-None values for partial updates
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        result = await service.update(id, update_dict, user_id=str(current_user.id))
        if not result:
            logger.warning(f"Patients with id {id} not found for update")
            raise HTTPException(status_code=404, detail="Patients not found")
        
        logger.info(f"Patients {id} updated successfully")
        return result
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Validation error updating patients {id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating patients {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.delete("/batch")
async def delete_patientss_batch(
    request: PatientsBatchDeleteRequest,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete multiple patientss by their IDs (requires ownership)"""
    logger.debug(f"Batch deleting {len(request.ids)} patientss")
    
    service = PatientsService(db)
    deleted_count = 0
    
    try:
        for item_id in request.ids:
            success = await service.delete(item_id, user_id=str(current_user.id))
            if success:
                deleted_count += 1
        
        logger.info(f"Batch deleted {deleted_count} patientss successfully")
        return {"message": f"Successfully deleted {deleted_count} patientss", "deleted_count": deleted_count}
    except Exception as e:
        await db.rollback()
        logger.error(f"Error in batch delete: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch delete failed: {str(e)}")


@router.delete("/{id}")
async def delete_patients(
    id: int,
    current_user: UserResponse = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a single patients by ID (requires ownership)"""
    logger.debug(f"Deleting patients with id: {id}")
    
    service = PatientsService(db)
    try:
        success = await service.delete(id, user_id=str(current_user.id))
        if not success:
            logger.warning(f"Patients with id {id} not found for deletion")
            raise HTTPException(status_code=404, detail="Patients not found")
        
        logger.info(f"Patients {id} deleted successfully")
        return {"message": "Patients deleted successfully", "id": id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting patients {id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")