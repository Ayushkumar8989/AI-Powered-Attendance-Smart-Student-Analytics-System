import { Router } from 'express';
import authRoutes from './auth.routes';
import uploadRoutes from './upload.routes';
import jobRoutes from './job.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/jobs', jobRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
