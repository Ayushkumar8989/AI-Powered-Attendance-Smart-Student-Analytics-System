import uuid
import threading
import time
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime
from app.core.logger import logger
from app.core.config import settings
from app.services.storage_service import storage_service


class SyntheticDataGenerator:
    """
    Synthetic data generation service with chunked processing and decentralized storage.
    """

    def __init__(self):
        self.tasks = {}
        self.generation_threads = {}
        self.output_dir = Path("/tmp/generated_data")
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Chunk size configuration for scalability
        self.chunk_size = 10000

    def start_generation(
        self,
        task_id: str,
        job_id: str,
        model_id: str,
        num_rows: int,
        output_format: str
    ) -> Dict[str, str]:
        """
        Start asynchronous data generation.

        Args:
            task_id: Unique task identifier
            job_id: Job identifier from backend
            model_id: Model to use for generation
            num_rows: Total number of rows to generate
            output_format: Output format (csv or parquet)

        Returns:
            Task information
        """
        estimated_time = self._estimate_generation_time(num_rows)

        self.tasks[task_id] = {
            "taskId": task_id,
            "jobId": job_id,
            "modelId": model_id,
            "status": "queued",
            "progress": 0,
            "currentRows": 0,
            "totalRows": num_rows,
            "outputFormat": output_format,
            "estimatedTime": estimated_time,
            "createdAt": datetime.utcnow().isoformat(),
        }

        thread = threading.Thread(
            target=self._generate_data_background,
            args=(task_id, job_id, model_id, num_rows, output_format)
        )
        thread.daemon = True
        thread.start()

        self.generation_threads[task_id] = thread

        logger.info(f"Generation task {task_id} queued for {num_rows} rows")

        return {"taskId": task_id, "estimatedTime": estimated_time}

    def _generate_data_background(
        self,
        task_id: str,
        job_id: str,
        model_id: str,
        num_rows: int,
        output_format: str
    ):
        """Background thread for data generation."""
        try:
            self._update_task(task_id, {"status": "processing", "progress": 5})

            logger.info(f"Starting generation for task {task_id}: {num_rows} rows")

            # Calculate number of chunks
            num_chunks = (num_rows + self.chunk_size - 1) // self.chunk_size
            logger.info(f"Processing in {num_chunks} chunks of max {self.chunk_size} rows")

            all_chunks = []
            rows_generated = 0

            # Generate data in chunks
            for chunk_idx in range(num_chunks):
                chunk_start = chunk_idx * self.chunk_size
                chunk_end = min((chunk_idx + 1) * self.chunk_size, num_rows)
                chunk_size = chunk_end - chunk_start

                logger.info(f"Generating chunk {chunk_idx + 1}/{num_chunks}: rows {chunk_start}-{chunk_end}")

                # Generate synthetic data chunk
                chunk_data = self._generate_chunk(model_id, chunk_size)
                all_chunks.append(chunk_data)

                rows_generated += chunk_size
                progress = 5 + int((rows_generated / num_rows) * 70)

                self._update_task(task_id, {
                    "progress": progress,
                    "currentRows": rows_generated
                })

                # Simulate processing time
                time.sleep(0.5)

            # Combine all chunks
            logger.info(f"Combining {len(all_chunks)} chunks")
            self._update_task(task_id, {"progress": 75})

            final_data = pd.concat(all_chunks, ignore_index=True)

            # Save to file
            logger.info(f"Saving {len(final_data)} rows to {output_format}")
            self._update_task(task_id, {"progress": 80})

            file_path = self._save_data(task_id, final_data, output_format)

            # Upload to decentralized storage
            logger.info(f"Uploading to decentralized storage")
            self._update_task(task_id, {"progress": 85})

            storage_link = storage_service.upload_file(file_path, storage_type="ipfs")

            # Get file metadata
            metadata = storage_service.get_file_metadata(file_path)

            # Mark as completed
            self._update_task(task_id, {
                "status": "completed",
                "progress": 100,
                "currentRows": num_rows,
                "storageLink": storage_link,
                "fileSize": metadata["size_mb"],
                "completedAt": datetime.utcnow().isoformat()
            })

            logger.info(f"Generation completed for task {task_id}: {storage_link}")

        except Exception as e:
            logger.error(f"Generation failed for task {task_id}: {str(e)}")
            self._update_task(task_id, {
                "status": "failed",
                "error": str(e),
                "failedAt": datetime.utcnow().isoformat()
            })

    def _generate_chunk(self, model_id: str, num_rows: int) -> pd.DataFrame:
        """
        Generate a chunk of synthetic data.

        This is where you'd integrate with actual ML models (GANs, VAEs, SDV, etc.)
        For demonstration, we generate realistic-looking synthetic data.
        """
        # Simulate model-based generation
        np.random.seed(int(time.time() * 1000) % (2**32))

        # Generate diverse synthetic columns
        data = {
            "id": np.arange(num_rows),
            "user_id": [f"user_{uuid.uuid4().hex[:8]}" for _ in range(num_rows)],
            "age": np.random.randint(18, 80, num_rows),
            "income": np.random.lognormal(10.5, 0.5, num_rows).astype(int),
            "credit_score": np.clip(np.random.normal(700, 80, num_rows), 300, 850).astype(int),
            "account_balance": np.random.exponential(5000, num_rows).round(2),
            "transaction_count": np.random.poisson(20, num_rows),
            "signup_date": pd.date_range(start="2020-01-01", periods=num_rows, freq="H"),
            "is_active": np.random.choice([True, False], num_rows, p=[0.7, 0.3]),
            "risk_category": np.random.choice(["low", "medium", "high"], num_rows, p=[0.6, 0.3, 0.1]),
            "lifetime_value": np.random.gamma(2, 1000, num_rows).round(2),
            "engagement_score": np.random.beta(2, 5, num_rows).round(3),
            "region": np.random.choice(["North", "South", "East", "West", "Central"], num_rows),
            "device_type": np.random.choice(["mobile", "desktop", "tablet"], num_rows, p=[0.6, 0.3, 0.1]),
            "subscription_tier": np.random.choice(["free", "basic", "premium"], num_rows, p=[0.5, 0.3, 0.2])
        }

        df = pd.DataFrame(data)

        return df

    def _save_data(self, task_id: str, data: pd.DataFrame, output_format: str) -> str:
        """Save data to file."""
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")

        if output_format.lower() == "csv":
            file_path = self.output_dir / f"synthetic_data_{task_id}_{timestamp}.csv"
            data.to_csv(file_path, index=False)
        elif output_format.lower() == "parquet":
            file_path = self.output_dir / f"synthetic_data_{task_id}_{timestamp}.parquet"
            data.to_parquet(file_path, index=False, engine='pyarrow')
        else:
            raise ValueError(f"Unsupported format: {output_format}")

        logger.info(f"Data saved to: {file_path}")
        return str(file_path)

    def _estimate_generation_time(self, num_rows: int) -> int:
        """Estimate generation time in seconds."""
        # Roughly 10,000 rows per second
        base_time = num_rows / 10000
        # Add overhead for file operations and upload
        total_time = int(base_time + 10)
        return max(total_time, 5)

    def _update_task(self, task_id: str, updates: Dict[str, Any]):
        """Update task status."""
        if task_id in self.tasks:
            self.tasks[task_id].update(updates)

    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get task status."""
        return self.tasks.get(task_id)


synthetic_data_generator = SyntheticDataGenerator()
