from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logger import logger
from app.api import data_generation, model_training, dataset_processing, generate_data

app = FastAPI(
    title="DeAI Synthetic Data Generator - AI Engine",
    description="AI-powered synthetic data generation and model training service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(data_generation.router, prefix="/api")
app.include_router(model_training.router, prefix="/api")
app.include_router(dataset_processing.router, prefix="/api")
app.include_router(generate_data.router, prefix="/api")


@app.get("/")
async def root():
    return {
        "service": "DeAI AI Engine",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }


@app.on_event("startup")
async def startup_event():
    logger.info("AI Engine starting up...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Model cache directory: {settings.MODEL_CACHE_DIR}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("AI Engine shutting down...")
