import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

interface SchemaAnalysisResponse {
  columnTypes: Record<string, string>;
  dataDistribution: Record<string, any>;
  rowCount: number;
  recommendations: string[];
}

interface TrainingRequest {
  jobId: string;
  filePath: string;
  modelConfig?: {
    modelType?: 'sdv' | 'gan';
    epochs?: number;
    batchSize?: number;
  };
}

interface TrainingResponse {
  status: string;
  message: string;
  taskId: string;
}

class AIEngineService {
  private client: AxiosInstance;
  private maxRetries = 3;
  private retryDelay = 2000;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.AI_ENGINE_URL || 'http://localhost:8000',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        logger.error('AI Engine request failed:', error.message);
        throw error;
      }
    );
  }

  async analyzeSchema(filePath: string): Promise<SchemaAnalysisResponse> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.info(`Analyzing schema (attempt ${attempt}/${this.maxRetries}): ${filePath}`);

        const response = await this.client.post<SchemaAnalysisResponse>('/api/analyze_schema', {
          filePath,
        });

        logger.info('Schema analysis completed successfully');
        return response.data;
      } catch (error: any) {
        lastError = error;
        logger.warn(`Schema analysis attempt ${attempt} failed: ${error.message}`);

        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    throw new Error(`Failed to analyze schema after ${this.maxRetries} attempts: ${lastError.message}`);
  }

  async trainModel(request: TrainingRequest): Promise<TrainingResponse> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        logger.info(`Starting model training (attempt ${attempt}/${this.maxRetries}) for job: ${request.jobId}`);

        const response = await this.client.post<TrainingResponse>('/api/train_model', request, {
          timeout: 120000,
        });

        logger.info(`Model training initiated successfully for job: ${request.jobId}`);
        return response.data;
      } catch (error: any) {
        lastError = error;
        logger.warn(`Training initiation attempt ${attempt} failed: ${error.message}`);

        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    throw new Error(`Failed to start training after ${this.maxRetries} attempts: ${lastError.message}`);
  }

  async getJobStatus(jobId: string): Promise<any> {
    try {
      const response = await this.client.get(`/api/job_status/${jobId}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Failed to get job status for ${jobId}: ${error.message}`);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const aiEngineService = new AIEngineService();
