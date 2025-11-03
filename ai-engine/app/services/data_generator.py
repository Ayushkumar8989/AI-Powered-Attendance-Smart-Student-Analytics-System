import uuid
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional
from app.core.logger import logger
from app.schemas.data_generation import DataType


class DataGeneratorService:
    def __init__(self):
        self.tasks = {}

    def generate_synthetic_data(
        self,
        data_type: DataType,
        num_samples: int,
        schema_config: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        task_id = str(uuid.uuid4())

        try:
            logger.info(f"Generating {num_samples} samples of {data_type} data")

            if data_type == DataType.TABULAR:
                data = self._generate_tabular_data(num_samples, schema_config)
            elif data_type == DataType.TEXT:
                data = self._generate_text_data(num_samples, schema_config)
            elif data_type == DataType.TIME_SERIES:
                data = self._generate_time_series_data(num_samples, schema_config)
            else:
                raise ValueError(f"Unsupported data type: {data_type}")

            result = {
                "task_id": task_id,
                "status": "completed",
                "data": data,
                "num_samples": num_samples
            }

            self.tasks[task_id] = result
            logger.info(f"Data generation completed for task {task_id}")

            return result

        except Exception as e:
            logger.error(f"Error generating data: {str(e)}")
            error_result = {
                "task_id": task_id,
                "status": "failed",
                "error": str(e)
            }
            self.tasks[task_id] = error_result
            raise

    def _generate_tabular_data(
        self,
        num_samples: int,
        config: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        if config and "columns" in config:
            columns = config["columns"]
        else:
            columns = ["feature_1", "feature_2", "feature_3", "feature_4", "feature_5"]

        data = {}
        for col in columns:
            if "int" in col.lower() or "id" in col.lower():
                data[col] = np.random.randint(0, 100, num_samples).tolist()
            elif "category" in col.lower() or "class" in col.lower():
                categories = ["A", "B", "C", "D"]
                data[col] = np.random.choice(categories, num_samples).tolist()
            else:
                data[col] = np.random.randn(num_samples).tolist()

        df = pd.DataFrame(data)

        return {
            "format": "tabular",
            "columns": columns,
            "data": df.to_dict(orient="records"),
            "shape": df.shape
        }

    def _generate_text_data(
        self,
        num_samples: int,
        config: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        templates = [
            "This is a synthetic text sample number {i}",
            "Generated content for testing purposes: sample {i}",
            "DePin network data point {i} for analysis",
            "Synthetic dataset entry {i} created by AI"
        ]

        texts = [templates[i % len(templates)].format(i=i) for i in range(num_samples)]

        return {
            "format": "text",
            "data": texts,
            "count": len(texts)
        }

    def _generate_time_series_data(
        self,
        num_samples: int,
        config: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        time_points = pd.date_range(start="2024-01-01", periods=num_samples, freq="H")

        trend = np.linspace(0, 10, num_samples)
        seasonality = 5 * np.sin(np.linspace(0, 4 * np.pi, num_samples))
        noise = np.random.randn(num_samples)

        values = trend + seasonality + noise

        df = pd.DataFrame({
            "timestamp": time_points,
            "value": values
        })

        return {
            "format": "time_series",
            "data": df.to_dict(orient="records"),
            "count": len(df)
        }

    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        return self.tasks.get(task_id)


data_generator_service = DataGeneratorService()
