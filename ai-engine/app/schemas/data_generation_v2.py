from pydantic import BaseModel, Field
from typing import Optional, Literal
from enum import Enum


class OutputFormat(str, Enum):
    CSV = "csv"
    PARQUET = "parquet"


class GenerateDataRequest(BaseModel):
    modelId: str = Field(..., description="Model identifier for synthetic data generation")
    numberOfRows: int = Field(..., ge=1, le=1000000, description="Number of synthetic rows to generate")
    outputFormat: OutputFormat = Field(default=OutputFormat.CSV, description="Output format: csv or parquet")
    jobId: str = Field(..., description="Job identifier for tracking")

    class Config:
        json_schema_extra = {
            "example": {
                "modelId": "m7n8o9p0-q1r2-s3t4-u5v6-w7x8y9z0a1b2",
                "numberOfRows": 50000,
                "outputFormat": "csv",
                "jobId": "job-123456"
            }
        }


class GenerateDataResponse(BaseModel):
    status: str
    taskId: str
    message: str
    estimatedTime: Optional[int] = None


class GenerationStatusResponse(BaseModel):
    taskId: str
    status: str
    progress: float = 0
    currentRows: Optional[int] = None
    totalRows: Optional[int] = None
    storageLink: Optional[str] = None
    outputFormat: Optional[str] = None
    error: Optional[str] = None
