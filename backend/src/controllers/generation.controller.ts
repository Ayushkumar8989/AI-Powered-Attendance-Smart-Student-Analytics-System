import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth.middleware';
import { GenerationJob } from '../models/GenerationJob.model';
import { Job } from '../models/Job.model';
import { aiEngineService } from '../services/ai-engine.service';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';
import { logger } from '../utils/logger';

export class GenerationController {
  async createGenerationJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { jobId } = req.params;
      const { modelId, numberOfRows, outputFormat = 'csv' } = req.body;

      if (!jobId) {
        throw new ValidationError('Job ID is required');
      }

      if (!modelId) {
        throw new ValidationError('Model ID is required');
      }

      if (!numberOfRows || numberOfRows < 1 || numberOfRows > 1000000) {
        throw new ValidationError('Number of rows must be between 1 and 1,000,000');
      }

      const job = await Job.findOne({ jobId });

      if (!job) {
        throw new NotFoundError('Job not found');
      }

      if (job.userId.toString() !== userId) {
        throw new ForbiddenError('Unauthorized access to job');
      }

      if (job.status !== 'completed') {
        throw new ValidationError('Job must be completed before generating synthetic data');
      }

      const generationJobId = uuidv4();

      const generationJob = await GenerationJob.create({
        generationJobId,
        jobId: job._id,
        userId,
        modelId,
        numberOfRows,
        outputFormat,
        status: 'pending',
        progress: 0,
        storageType: 'ipfs',
      });

      logger.info(`Generation job created: ${generationJobId} for user ${userId}`);

      this.startGeneration(generationJobId, modelId, numberOfRows, outputFormat).catch((error) => {
        logger.error(`Generation failed for job ${generationJobId}:`, error);
      });

      res.status(201).json({
        status: 'success',
        data: {
          generationJobId: generationJob.generationJobId,
          status: generationJob.status,
          numberOfRows: generationJob.numberOfRows,
          outputFormat: generationJob.outputFormat,
          message: 'Synthetic data generation started',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getGenerationJob(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { generationJobId } = req.params;

      const generationJob = await GenerationJob.findOne({ generationJobId });

      if (!generationJob) {
        throw new NotFoundError('Generation job not found');
      }

      if (generationJob.userId.toString() !== userId) {
        throw new ForbiddenError('Unauthorized access to generation job');
      }

      res.status(200).json({
        status: 'success',
        data: {
          generationJobId: generationJob.generationJobId,
          modelId: generationJob.modelId,
          numberOfRows: generationJob.numberOfRows,
          outputFormat: generationJob.outputFormat,
          status: generationJob.status,
          progress: generationJob.progress,
          currentRows: generationJob.currentRows,
          storageLink: generationJob.storageLink,
          storageType: generationJob.storageType,
          estimatedTime: generationJob.estimatedTime,
          fileSize: generationJob.fileSize,
          errorMessage: generationJob.errorMessage,
          createdAt: generationJob.createdAt,
          updatedAt: generationJob.updatedAt,
          completedAt: generationJob.completedAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserGenerationJobs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const jobs = await GenerationJob.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('jobId', 'fileName jobId');

      const total = await GenerationJob.countDocuments({ userId });

      res.status(200).json({
        status: 'success',
        data: {
          jobs: jobs.map(job => ({
            generationJobId: job.generationJobId,
            modelId: job.modelId,
            numberOfRows: job.numberOfRows,
            status: job.status,
            progress: job.progress,
            storageLink: job.storageLink,
            outputFormat: job.outputFormat,
            createdAt: job.createdAt,
          })),
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

  private async startGeneration(
    generationJobId: string,
    modelId: string,
    numberOfRows: number,
    outputFormat: string
  ) {
    try {
      const generationResponse = await aiEngineService.generateData({
        jobId: generationJobId,
        modelId,
        numberOfRows,
        outputFormat,
      });

      await GenerationJob.findOneAndUpdate(
        { generationJobId },
        {
          status: 'processing',
          taskId: generationResponse.taskId,
          estimatedTime: generationResponse.estimatedTime,
        }
      );

      logger.info(`Generation initiated for job ${generationJobId}, task: ${generationResponse.taskId}`);

      this.pollGenerationStatus(generationJobId, generationResponse.taskId).catch((error) => {
        logger.error(`Polling failed for job ${generationJobId}:`, error);
      });
    } catch (error: any) {
      logger.error(`Failed to start generation for job ${generationJobId}:`, error);
      await GenerationJob.findOneAndUpdate(
        { generationJobId },
        {
          status: 'failed',
          errorMessage: error.message || 'Failed to start generation',
        }
      );
    }
  }

  private async pollGenerationStatus(generationJobId: string, taskId: string) {
    const maxPolls = 720;
    const pollInterval = 5000;
    let pollCount = 0;

    while (pollCount < maxPolls) {
      try {
        await new Promise((resolve) => setTimeout(resolve, pollInterval));

        const status = await aiEngineService.getGenerationStatus(taskId);

        await GenerationJob.findOneAndUpdate(
          { generationJobId },
          {
            progress: status.progress || 0,
            currentRows: status.currentRows,
            status: status.status === 'completed' ? 'completed' : 'processing',
            storageLink: status.storageLink,
            completedAt: status.status === 'completed' ? new Date() : undefined,
          }
        );

        if (status.status === 'completed' || status.status === 'failed') {
          if (status.status === 'failed') {
            await GenerationJob.findOneAndUpdate(
              { generationJobId },
              {
                status: 'failed',
                errorMessage: status.error || 'Generation failed',
              }
            );
          }
          logger.info(`Generation ${status.status} for job ${generationJobId}`);
          break;
        }

        pollCount++;
      } catch (error: any) {
        logger.error(`Error polling status for job ${generationJobId}:`, error.message);
        pollCount++;
      }
    }

    if (pollCount >= maxPolls) {
      await GenerationJob.findOneAndUpdate(
        { generationJobId },
        {
          status: 'failed',
          errorMessage: 'Generation timeout exceeded',
        }
      );
    }
  }
}

export const generationController = new GenerationController();
