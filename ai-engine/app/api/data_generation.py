from fastapi import APIRouter, HTTPException
from app.schemas.data_generation import (
    GenerationRequest,
    GenerationResponse,
    TaskStatusResponse
)
from app.services.data_generator import data_generator_service
from app.core.logger import logger

router = APIRouter(prefix="/data-generation", tags=["Data Generation"])


@router.post("/generate", response_model=GenerationResponse)
async def generate_synthetic_data(request: GenerationRequest):
    try:
        result = data_generator_service.generate_synthetic_data(
            data_type=request.data_type,
            num_samples=request.num_samples,
            schema_config=request.schema_config
        )

        return GenerationResponse(
            status="success",
            task_id=result["task_id"],
            message=f"Generated {request.num_samples} samples successfully",
            num_samples=request.num_samples
        )
    except Exception as e:
        logger.error(f"Error in data generation endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/task/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    result = data_generator_service.get_task_status(task_id)

    if not result:
        raise HTTPException(status_code=404, detail="Task not found")

    return TaskStatusResponse(
        task_id=task_id,
        status=result.get("status"),
        result=result.get("data") if result.get("status") == "completed" else None,
        error=result.get("error")
    )
