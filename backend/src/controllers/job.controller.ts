import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Job } from '../models/Job.model';
import { aiEngineService } from '../services/ai-engine.service';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';

export class JobController {
  async createTrainingJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { jobId, modelConfig } = req.body;

      if (!jobId) {
        throw new ValidationError('Job ID is required');
      }

      const job = await Job.findOne({ jobId });

      if (!job) {
        throw new NotFoundError('Job not found');
      }

      if (job.userId.toString() !== userId) {
        throw new ForbiddenError('Unauthorized access to job');
      }

      if (job.status !== 'queued') {
        throw new ValidationError(`Cannot start training. Job status: ${job.status}`);
      }

      if (!job.schemaAnalysis) {
        throw new ValidationError('Schema analysis not completed');
      }

      await Job.findOneAndUpdate(
        { jobId },
        { status: 'training', progress: 0 }
      );

      this.startTraining(jobId, job.filePath, modelConfig).catch((error) => {
        logger.error(`Training failed for job ${jobId}:`, error);
      });

      res.status(200).json({
        status: 'success',
        data: {
          jobId: job.jobId,
          status: 'training',
          message: 'Training started successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { jobId } = req.params;

      const job = await Job.findOne({ jobId });

      if (!job) {
        throw new NotFoundError('Job not found');
      }

      if (job.userId.toString() !== userId) {
        throw new ForbiddenError('Unauthorized access to job');
      }

      res.status(200).json({
        status: 'success',
        data: {
          jobId: job.jobId,
          status: job.status,
          progress: job.progress,
          fileName: job.fileName,
          schemaAnalysis: job.schemaAnalysis,
          modelPath: job.modelPath,
          errorMessage: job.errorMessage,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const jobs = await Job.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-filePath');

      const total = await Job.countDocuments({ userId });

      res.status(200).json({
        status: 'success',
        data: {
          jobs,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  private async startTraining(jobId: string, filePath: string, modelConfig?: any) {
    try {
      const trainingResponse = await aiEngineService.trainModel({
        jobId,
        filePath,
        modelConfig: modelConfig || { modelType: 'sdv', epochs: 10 },
      });

      logger.info(`Training initiated for job ${jobId}, task: ${trainingResponse.taskId}`);

      this.pollTrainingStatus(jobId, trainingResponse.taskId).catch((error) => {
        logger.error(`Polling failed for job ${jobId}:`, error);
      });
    } catch (error: any) {
      logger.error(`Failed to start training for job ${jobId}:`, error);
      await Job.findOneAndUpdate(
        { jobId },
        {
          status: 'failed',
          errorMessage: error.message || 'Failed to start training',
        }
      );
    }
  }

  private async pollTrainingStatus(jobId: string, taskId: string) {
    const maxPolls = 720;
    const pollInterval = 10000;
    let pollCount = 0;

    while (pollCount < maxPolls) {
      try {
        await new Promise((resolve) => setTimeout(resolve, pollInterval));

        const status = await aiEngineService.getJobStatus(taskId);

        await Job.findOneAndUpdate(
          { jobId },
          {
            progress: status.progress || 0,
            status: status.status === 'completed' ? 'completed' : 'training',
            modelPath: status.modelPath,
          }
        );

        if (status.status === 'completed' || status.status === 'failed') {
          if (status.status === 'failed') {
            await Job.findOneAndUpdate(
              { jobId },
              {
                status: 'failed',
                errorMessage: status.error || 'Training failed',
              }
            );
          }
          logger.info(`Training ${status.status} for job ${jobId}`);
          break;
        }

        pollCount++;
      } catch (error: any) {
        logger.error(`Error polling status for job ${jobId}:`, error.message);
        pollCount++;
      }
    }

    if (pollCount >= maxPolls) {
      await Job.findOneAndUpdate(
        { jobId },
        {
          status: 'failed',
          errorMessage: 'Training timeout exceeded',
        }
      );
    }
  }

  async updateJobProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { jobId } = req.params;
      const { progress, status, modelPath, errorMessage } = req.body;

      const updateData: any = {};
      if (progress !== undefined) updateData.progress = progress;
      if (status) updateData.status = status;
      if (modelPath) updateData.modelPath = modelPath;
      if (errorMessage) updateData.errorMessage = errorMessage;

      const job = await Job.findOneAndUpdate(
        { jobId },
        updateData,
        { new: true }
      );

      if (!job) {
        throw new NotFoundError('Job not found');
      }

      res.status(200).json({
        status: 'success',
        data: { jobId: job.jobId, progress: job.progress, status: job.status },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const jobController = new JobController();
