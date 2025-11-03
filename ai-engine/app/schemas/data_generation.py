from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum


class DataType(str, Enum):
    TABULAR = "tabular"
    TEXT = "text"
    TIME_SERIES = "time_series"


class GenerationRequest(BaseModel):
    data_type: DataType
    num_samples: int = Field(gt=0, le=10000, description="Number of samples to generate")
    schema_config: Optional[Dict[str, Any]] = None
    model_params: Optional[Dict[str, Any]] = None

    class Config:
        json_schema_extra = {
            "example": {
                "data_type": "tabular",
                "num_samples": 100,
                "schema_config": {
                    "columns": ["age", "income", "credit_score"],
                    "dtypes": ["int", "float", "int"]
                }
            }
        }


class GenerationResponse(BaseModel):
    status: str
    task_id: str
    message: str
    num_samples: int


class TaskStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class TaskStatusResponse(BaseModel):
    task_id: str
    status: TaskStatus
    progress: Optional[float] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
