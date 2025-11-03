import mongoose, { Schema } from 'mongoose';

export type JobStatus = 'queued' | 'analyzing' | 'training' | 'completed' | 'failed';

export interface IJob extends mongoose.Document {
  jobId: string;
  userId: mongoose.Types.ObjectId;
  status: JobStatus;
  progress: number;
  fileName: string;
  filePath: string;
  schemaAnalysis?: {
    columnTypes: Record<string, string>;
    dataDistribution: Record<string, any>;
    rowCount: number;
    recommendations: string[];
  };
  modelPath?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    jobId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['queued', 'analyzing', 'training', 'completed', 'failed'],
      default: 'queued',
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    fileName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    schemaAnalysis: {
      columnTypes: {
        type: Map,
        of: String,
      },
      dataDistribution: {
        type: Map,
        of: Schema.Types.Mixed,
      },
      rowCount: Number,
      recommendations: [String],
    },
    modelPath: {
      type: String,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ userId: 1, createdAt: -1 });
jobSchema.index({ status: 1 });

export const Job = mongoose.model<IJob>('Job', jobSchema);
