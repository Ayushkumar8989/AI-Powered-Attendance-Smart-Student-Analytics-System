import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { AuthRequest } from '../middleware/auth.middleware';
import { Job } from '../models/Job.model';
import { aiEngineService } from '../services/ai-engine.service';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

const UPLOAD_DIR = '/tmp/uploads';
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];

export class UploadController {
  constructor() {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  async uploadFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const file = req.file;

      if (!file) {
        throw new ValidationError('No file uploaded');
      }

      const fileExt = path.extname(file.originalname).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
        fs.unlinkSync(file.path);
        throw new ValidationError(
          `Invalid file format. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        fs.unlinkSync(file.path);
        throw new ValidationError('File size exceeds 100MB limit');
      }

      const sanitizedFileName = this.sanitizeFileName(file.originalname);
      const jobId = uuidv4();
      const filePath = path.join(UPLOAD_DIR, `${jobId}_${sanitizedFileName}`);

      fs.renameSync(file.path, filePath);

      const job = await Job.create({
        jobId,
        userId,
        status: 'queued',
        progress: 0,
        fileName: sanitizedFileName,
        filePath,
      });

      logger.info(`File uploaded successfully: ${jobId} by user ${userId}`);

      this.scheduleAnalysis(jobId, filePath).catch((error) => {
        logger.error(`Background analysis failed for job ${jobId}:`, error);
      });

      res.status(201).json({
        status: 'success',
        data: {
          jobId: job.jobId,
          fileName: job.fileName,
          status: job.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  private async scheduleAnalysis(jobId: string, filePath: string) {
    try {
      await Job.findOneAndUpdate(
        { jobId },
        { status: 'analyzing', progress: 10 }
      );

      const analysis = await aiEngineService.analyzeSchema(filePath);

      await Job.findOneAndUpdate(
        { jobId },
        {
          status: 'queued',
          progress: 100,
          schemaAnalysis: analysis,
        }
      );

      logger.info(`Schema analysis completed for job ${jobId}`);
    } catch (error: any) {
      logger.error(`Analysis failed for job ${jobId}:`, error);
      await Job.findOneAndUpdate(
        { jobId },
        {
          status: 'failed',
          errorMessage: error.message || 'Schema analysis failed',
        }
      );
    }
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 200);
  }
}

export const uploadController = new UploadController();
