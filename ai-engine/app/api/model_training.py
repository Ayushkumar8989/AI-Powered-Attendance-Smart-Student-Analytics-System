from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.model_training import (
    TrainingRequest,
    TrainingResponse,
    ModelInfo
)
from app.services.model_trainer import model_trainer_service
from app.core.logger import logger

router = APIRouter(prefix="/models", tags=["Model Training"])


@router.post("/train", response_model=TrainingResponse)
async def train_model(request: TrainingRequest):
    try:
        result = model_trainer_service.train_model(
            model_type=request.model_type,
            dataset_config=request.dataset_config,
            hyperparameters=request.hyperparameters,
            epochs=request.epochs
        )

        return TrainingResponse(
            status="success",
            task_id=result["task_id"],
            message=f"Model training completed successfully",
            model_id=result["model_id"]
        )
    except Exception as e:
        logger.error(f"Error in model training endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{model_id}", response_model=ModelInfo)
async def get_model_info(model_id: str):
    model_info = model_trainer_service.get_model_info(model_id)

    if not model_info:
        raise HTTPException(status_code=404, detail="Model not found")

    return ModelInfo(**model_info)


@router.get("/", response_model=List[ModelInfo])
async def list_models():
    models = model_trainer_service.list_models()
    return [ModelInfo(**model) for model in models]
