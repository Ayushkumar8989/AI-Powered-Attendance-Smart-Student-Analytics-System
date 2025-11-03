import api from './api';

export interface GenerationJob {
  generationJobId: string;
  modelId: string;
  numberOfRows: number;
  outputFormat: 'csv' | 'parquet';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentRows?: number;
  storageLink?: string;
  storageType: 'ipfs' | 'arweave';
  estimatedTime?: number;
  fileSize?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreateGenerationRequest {
  modelId: string;
  numberOfRows: number;
  outputFormat?: 'csv' | 'parquet';
}

export interface CreateGenerationResponse {
  generationJobId: string;
  status: string;
  numberOfRows: number;
  outputFormat: string;
  message: string;
}

export const generationService = {
  async createGeneration(
    jobId: string,
    request: CreateGenerationRequest
  ): Promise<CreateGenerationResponse> {
    const response = await api.post<{ status: string; data: CreateGenerationResponse }>(
      `/jobs/${jobId}/generate-data`,
      request
    );
    return response.data.data;
  },

  async getGeneration(generationJobId: string): Promise<GenerationJob> {
    const response = await api.get<{ status: string; data: GenerationJob }>(
      `/generation/${generationJobId}`
    );
    return response.data.data;
  },

  async getUserGenerations(page: number = 1, limit: number = 20): Promise<{
    jobs: GenerationJob[];
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
        jobs: GenerationJob[];
        pagination: any;
      };
    }>(`/generation?page=${page}&limit=${limit}`);
    return response.data.data;
  },
};
