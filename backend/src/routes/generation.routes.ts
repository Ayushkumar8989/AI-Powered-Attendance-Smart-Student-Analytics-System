import { Router } from 'express';
import { body } from 'express-validator';
import { generationController } from '../controllers/generation.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.post(
  '/jobs/:jobId/generate-data',
  authenticate,
  [
    body('modelId').notEmpty().withMessage('Model ID is required'),
    body('numberOfRows')
      .isInt({ min: 1, max: 1000000 })
      .withMessage('Number of rows must be between 1 and 1,000,000'),
    body('outputFormat')
      .optional()
      .isIn(['csv', 'parquet'])
      .withMessage('Output format must be csv or parquet'),
    validate,
  ],
  generationController.createGenerationJob
);

router.get(
  '/generation/:generationJobId',
  authenticate,
  generationController.getGenerationJob
);

router.get(
  '/generation',
  authenticate,
  generationController.getUserGenerationJobs
);

export default router;
