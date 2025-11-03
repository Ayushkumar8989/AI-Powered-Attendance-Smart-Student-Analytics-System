from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional


class AnalyzeSchemaRequest(BaseModel):
    filePath: str = Field(..., description="Path to the dataset file")


class AnalyzeSchemaResponse(BaseModel):
    columnTypes: Dict[str, str]
    dataDistribution: Dict[str, Any]
    rowCount: int
    recommendations: List[str]


class ModelConfig(BaseModel):
    modelType: Optional[str] = Field("sdv", description="Type of model: sdv or gan")
    epochs: Optional[int] = Field(10, ge=1, le=100)
    batchSize: Optional[int] = Field(32, ge=1, le=512)


class TrainModelRequest(BaseModel):
    jobId: str = Field(..., description="Unique job identifier")
    filePath: str = Field(..., description="Path to the training dataset")
    modelConfig: Optional[ModelConfig] = None


class TrainModelResponse(BaseModel):
    status: str
    message: str
    taskId: str


class JobStatusResponse(BaseModel):
    taskId: str
    status: str
    progress: float = 0
    modelPath: Optional[str] = None
    error: Optional[str] = None
