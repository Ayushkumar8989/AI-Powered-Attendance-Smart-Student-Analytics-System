from fastapi import APIRouter, HTTPException
from app.schemas.dataset_processing import (
    AnalyzeSchemaRequest,
    AnalyzeSchemaResponse,
    TrainModelRequest,
    TrainModelResponse,
    JobStatusResponse
)
from app.services.schema_analyzer import schema_analyzer_service
from app.services.model_trainer_v2 import model_trainer_v2_service
from app.core.logger import logger

router = APIRouter(tags=["Dataset Processing"])


@router.post("/analyze_schema", response_model=AnalyzeSchemaResponse)
async def analyze_schema(request: AnalyzeSchemaRequest):
    try:
        logger.info(f"Analyzing schema for file: {request.filePath}")

        result = schema_analyzer_service.analyze_file(request.filePath)

        return AnalyzeSchemaResponse(
            columnTypes=result["columnTypes"],
            dataDistribution=result["dataDistribution"],
            rowCount=result["rowCount"],
            recommendations=result["recommendations"]
        )
    except FileNotFoundError as e:
        logger.error(f"File not found: {request.filePath}")
        raise HTTPException(status_code=404, detail=f"File not found: {str(e)}")
    except Exception as e:
        logger.error(f"Error analyzing schema: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Schema analysis failed: {str(e)}")


@router.post("/train_model", response_model=TrainModelResponse)
async def train_model(request: TrainModelRequest):
    try:
        logger.info(f"Starting model training for job: {request.jobId}")

        result = model_trainer_v2_service.start_training(
            job_id=request.jobId,
            file_path=request.filePath,
            model_config=request.modelConfig or {}
        )

        return TrainModelResponse(
            status="success",
            message="Training started successfully",
            taskId=result["taskId"]
        )
    except Exception as e:
        logger.error(f"Error starting training: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start training: {str(e)}")


@router.get("/job_status/{task_id}", response_model=JobStatusResponse)
async def get_job_status(task_id: str):
    try:
        result = model_trainer_v2_service.get_task_status(task_id)

        if not result:
            raise HTTPException(status_code=404, detail="Task not found")

        return JobStatusResponse(
            taskId=task_id,
            status=result["status"],
            progress=result.get("progress", 0),
            modelPath=result.get("modelPath"),
            error=result.get("error")
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving job status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get job status: {str(e)}")
