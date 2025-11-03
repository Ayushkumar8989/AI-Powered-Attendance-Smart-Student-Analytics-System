import { Router } from 'express';
import { body } from 'express-validator';
import { jobController } from '../controllers/job.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.post(
  '/train',
  authenticate,
  [
    body('jobId').notEmpty().withMessage('Job ID is required'),
    body('modelConfig').optional().isObject(),
    validate,
  ],
  jobController.createTrainingJob
);

router.get(
  '/:jobId',
  authenticate,
  jobController.getJob
);

router.get(
  '/user/list',
  authenticate,
  jobController.getUserJobs
);

router.put(
  '/:jobId/progress',
  authenticate,
  [
    body('progress').optional().isInt({ min: 0, max: 100 }),
    body('status').optional().isIn(['queued', 'analyzing', 'training', 'completed', 'failed']),
    validate,
  ],
  jobController.updateJobProgress
);

export default router;
