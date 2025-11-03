import uuid
from fastapi import APIRouter, HTTPException
from app.schemas.data_generation_v2 import (
    GenerateDataRequest,
    GenerateDataResponse,
    GenerationStatusResponse
)
from app.services.synthetic_data_generator import synthetic_data_generator
from app.core.logger import logger

router = APIRouter(tags=["Synthetic Data Generation"])


@router.post("/generate_data", response_model=GenerateDataResponse)
async def generate_synthetic_data(request: GenerateDataRequest):
    """
    Generate synthetic data with chunked processing and decentralized storage.

    This endpoint:
    1. Validates the request
    2. Creates a generation task
    3. Processes data in chunks (10,000 rows per chunk)
    4. Uploads completed dataset to IPFS/Arweave
    5. Returns storage link when complete

    Args:
        request: Generation parameters including modelId, numberOfRows, and format

    Returns:
        Task information with status and estimated completion time
    """
    try:
        logger.info(f"Received generation request: {request.numberOfRows} rows, format: {request.outputFormat}")

        # Validate model exists (in production, check model registry)
        if not request.modelId:
            raise HTTPException(status_code=400, detail="Model ID is required")

        # Generate unique task ID
        task_id = str(uuid.uuid4())

        # Start generation process
        result = synthetic_data_generator.start_generation(
            task_id=task_id,
            job_id=request.jobId,
            model_id=request.modelId,
            num_rows=request.numberOfRows,
            output_format=request.outputFormat.value
        )

        return GenerateDataResponse(
            status="success",
            taskId=result["taskId"],
            message=f"Generation started for {request.numberOfRows} rows",
            estimatedTime=result["estimatedTime"]
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in generate_data endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.get("/generation_status/{task_id}", response_model=GenerationStatusResponse)
async def get_generation_status(task_id: str):
    """
    Get the status of a data generation task.

    Returns real-time progress including:
    - Current status (queued, processing, completed, failed)
    - Progress percentage
    - Current and total row counts
    - Storage link (when completed)
    - Error details (if failed)

    Args:
        task_id: The unique task identifier

    Returns:
        Task status and progress information
    """
    try:
        task = synthetic_data_generator.get_task_status(task_id)

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        return GenerationStatusResponse(
            taskId=task_id,
            status=task.get("status"),
            progress=task.get("progress", 0),
            currentRows=task.get("currentRows"),
            totalRows=task.get("totalRows"),
            storageLink=task.get("storageLink"),
            outputFormat=task.get("outputFormat"),
            error=task.get("error")
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting task status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")
