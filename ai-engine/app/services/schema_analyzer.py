import pandas as pd
import numpy as np
from typing import Dict, Any, List
from pathlib import Path
from app.core.logger import logger


class SchemaAnalyzerService:
    def __init__(self):
        self.pii_keywords = ['email', 'phone', 'ssn', 'address', 'name', 'password']

    def analyze_file(self, file_path: str) -> Dict[str, Any]:
        try:
            file_path_obj = Path(file_path)

            if not file_path_obj.exists():
                raise FileNotFoundError(f"File does not exist: {file_path}")

            if file_path_obj.suffix.lower() == '.csv':
                df = pd.read_csv(file_path)
            elif file_path_obj.suffix.lower() in ['.xlsx', '.xls']:
                df = pd.read_excel(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_path_obj.suffix}")

            column_types = self._detect_column_types(df)
            data_distribution = self._calculate_distribution(df, column_types)
            recommendations = self._generate_recommendations(df, column_types)

            return {
                "columnTypes": column_types,
                "dataDistribution": data_distribution,
                "rowCount": len(df),
                "recommendations": recommendations
            }
        except Exception as e:
            logger.error(f"Error analyzing file {file_path}: {str(e)}")
            raise

    def _detect_column_types(self, df: pd.DataFrame) -> Dict[str, str]:
        column_types = {}

        for col in df.columns:
            dtype = df[col].dtype

            if pd.api.types.is_numeric_dtype(dtype):
                if pd.api.types.is_integer_dtype(dtype):
                    column_types[col] = "integer"
                else:
                    column_types[col] = "numeric"
            elif pd.api.types.is_datetime64_any_dtype(dtype):
                column_types[col] = "datetime"
            elif pd.api.types.is_bool_dtype(dtype):
                column_types[col] = "boolean"
            else:
                unique_ratio = df[col].nunique() / len(df)
                if unique_ratio < 0.05:
                    column_types[col] = "categorical"
                else:
                    column_types[col] = "text"

        return column_types

    def _calculate_distribution(
        self,
        df: pd.DataFrame,
        column_types: Dict[str, str]
    ) -> Dict[str, Any]:
        distribution = {}

        for col, col_type in column_types.items():
            try:
                if col_type in ["integer", "numeric"]:
                    distribution[col] = {
                        "type": col_type,
                        "mean": float(df[col].mean()) if not df[col].isnull().all() else None,
                        "std": float(df[col].std()) if not df[col].isnull().all() else None,
                        "min": float(df[col].min()) if not df[col].isnull().all() else None,
                        "max": float(df[col].max()) if not df[col].isnull().all() else None,
                        "median": float(df[col].median()) if not df[col].isnull().all() else None,
                        "missing": int(df[col].isnull().sum()),
                        "missingPercent": float(df[col].isnull().sum() / len(df) * 100)
                    }
                elif col_type == "categorical":
                    value_counts = df[col].value_counts().head(10).to_dict()
                    distribution[col] = {
                        "type": col_type,
                        "uniqueValues": int(df[col].nunique()),
                        "topValues": {str(k): int(v) for k, v in value_counts.items()},
                        "missing": int(df[col].isnull().sum()),
                        "missingPercent": float(df[col].isnull().sum() / len(df) * 100)
                    }
                elif col_type == "boolean":
                    value_counts = df[col].value_counts().to_dict()
                    distribution[col] = {
                        "type": col_type,
                        "distribution": {str(k): int(v) for k, v in value_counts.items()},
                        "missing": int(df[col].isnull().sum())
                    }
                elif col_type == "datetime":
                    distribution[col] = {
                        "type": col_type,
                        "min": str(df[col].min()) if not df[col].isnull().all() else None,
                        "max": str(df[col].max()) if not df[col].isnull().all() else None,
                        "missing": int(df[col].isnull().sum())
                    }
                else:
                    distribution[col] = {
                        "type": col_type,
                        "uniqueValues": int(df[col].nunique()),
                        "avgLength": float(df[col].astype(str).str.len().mean()) if not df[col].isnull().all() else None,
                        "missing": int(df[col].isnull().sum()),
                        "missingPercent": float(df[col].isnull().sum() / len(df) * 100)
                    }
            except Exception as e:
                logger.warning(f"Error calculating distribution for column {col}: {str(e)}")
                distribution[col] = {
                    "type": col_type,
                    "error": "Could not calculate distribution"
                }

        return distribution

    def _generate_recommendations(
        self,
        df: pd.DataFrame,
        column_types: Dict[str, str]
    ) -> List[str]:
        recommendations = []

        total_missing = df.isnull().sum().sum()
        total_cells = df.shape[0] * df.shape[1]
        missing_percent = (total_missing / total_cells) * 100

        if missing_percent > 10:
            recommendations.append(
                f"Dataset has {missing_percent:.1f}% missing values. Consider data cleaning or imputation."
            )

        for col in df.columns:
            col_lower = col.lower()
            if any(keyword in col_lower for keyword in self.pii_keywords):
                recommendations.append(
                    f"Column '{col}' may contain PII (Personally Identifiable Information). Ensure proper handling."
                )

        numeric_cols = [col for col, ctype in column_types.items() if ctype in ["integer", "numeric"]]
        if len(numeric_cols) < len(df.columns) * 0.3:
            recommendations.append(
                "Dataset has few numeric columns. Consider using text-based generation models."
            )

        if len(df) < 100:
            recommendations.append(
                "Small dataset detected. Model training may require more data for better results."
            )
        elif len(df) > 100000:
            recommendations.append(
                "Large dataset detected. Training may take considerable time. Consider sampling."
            )

        categorical_cols = [col for col, ctype in column_types.items() if ctype == "categorical"]
        for col in categorical_cols:
            if df[col].nunique() > 100:
                recommendations.append(
                    f"Column '{col}' has high cardinality ({df[col].nunique()} unique values). May impact model performance."
                )

        if not recommendations:
            recommendations.append("Dataset looks good for synthetic data generation.")

        return recommendations


schema_analyzer_service = SchemaAnalyzerService()
