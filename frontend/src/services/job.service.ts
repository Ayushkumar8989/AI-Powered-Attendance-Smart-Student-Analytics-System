import api from './api';

export interface Job {
  jobId: string;
  status: 'queued' | 'analyzing' | 'training' | 'completed' | 'failed';
  progress: number;
  fileName: string;
  schemaAnalysis?: {
    columnTypes: Record<string, string>;
    dataDistribution: Record<string, any>;
    rowCount: number;
    recommendations: string[];
  };
  modelPath?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResponse {
  jobId: string;
  fileName: string;
  status: string;
}

export interface TrainingRequest {
  jobId: string;
  modelConfig?: {
    modelType?: 'sdv' | 'gan';
    epochs?: number;
    batchSize?: number;
  };
}

export const jobService = {
  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ status: string; data: UploadResponse }>(
      '/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  },

  async getJob(jobId: string): Promise<Job> {
    const response = await api.get<{ status: string; data: Job }>(
      `/jobs/${jobId}`
    );
    return response.data.data;
  },

  async getUserJobs(page: number = 1, limit: number = 20): Promise<{
    jobs: Job[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await api.get<{
      status: string;
      data: {
        jobs: Job[];
        pagination: any;
      };
    }>(`/jobs/user/list?page=${page}&limit=${limit}`);
    return response.data.data;
  },

  async startTraining(request: TrainingRequest): Promise<any> {
    const response = await api.post<{ status: string; data: any }>(
      '/jobs/train',
      request
    );
    return response.data.data;
  },
};
