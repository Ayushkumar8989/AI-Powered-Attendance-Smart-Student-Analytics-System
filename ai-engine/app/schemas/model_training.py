from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List


class TrainingRequest(BaseModel):
    model_type: str = Field(..., description="Type of model to train")
    dataset_path: Optional[str] = None
    dataset_config: Optional[Dict[str, Any]] = None
    hyperparameters: Optional[Dict[str, Any]] = None
    epochs: int = Field(default=10, gt=0, le=100)

    class Config:
        json_schema_extra = {
            "example": {
                "model_type": "synthetic_gan",
                "dataset_config": {
                    "features": 10,
                    "samples": 1000
                },
                "epochs": 20
            }
        }


class TrainingResponse(BaseModel):
    status: str
    task_id: str
    message: str
    model_id: Optional[str] = None


class ModelInfo(BaseModel):
    model_id: str
    model_type: str
    created_at: str
    metrics: Optional[Dict[str, float]] = None
    status: str
