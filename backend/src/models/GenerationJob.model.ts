import mongoose, { Schema } from 'mongoose';

export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IGenerationJob extends mongoose.Document {
  generationJobId: string;
  jobId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  modelId: string;
  numberOfRows: number;
  outputFormat: 'csv' | 'parquet';
  status: GenerationStatus;
  progress: number;
  currentRows?: number;
  storageLink?: string;
  storageType: 'ipfs' | 'arweave';
  taskId?: string;
  estimatedTime?: number;
  fileSize?: number;
  errorMessage?: string;
  metadata?: {
    chunkSize?: number;
    chunksProcessed?: number;
    totalChunks?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const generationJobSchema = new Schema<IGenerationJob>(
  {
    generationJobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    modelId: {
      type: String,
      required: true,
    },
    numberOfRows: {
      type: Number,
      required: true,
      min: 1,
      max: 1000000,
    },
    outputFormat: {
      type: String,
      enum: ['csv', 'parquet'],
      default: 'csv',
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    currentRows: {
      type: Number,
      default: 0,
    },
    storageLink: {
      type: String,
    },
    storageType: {
      type: String,
      enum: ['ipfs', 'arweave'],
      default: 'ipfs',
    },
    taskId: {
      type: String,
    },
    estimatedTime: {
      type: Number,
    },
    fileSize: {
      type: Number,
    },
    errorMessage: {
      type: String,
    },
    metadata: {
      chunkSize: Number,
      chunksProcessed: Number,
      totalChunks: Number,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

generationJobSchema.index({ userId: 1, createdAt: -1 });
generationJobSchema.index({ status: 1, createdAt: -1 });
generationJobSchema.index({ generationJobId: 1, userId: 1 });

export const GenerationJob = mongoose.model<IGenerationJob>('GenerationJob', generationJobSchema);
