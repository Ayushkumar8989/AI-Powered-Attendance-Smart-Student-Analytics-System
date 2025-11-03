import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { jobService, Job } from '@/services/job.service';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, Loader2, XCircle } from 'lucide-react';

export const TrainingPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  const loadJob = async () => {
    try {
      const jobData = await jobService.getJob(jobId!);
      setJob(jobData);

      if (jobData.status === 'training') {
        setTimeout(loadJob, 5000);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load job',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!job) return null;

    switch (job.status) {
      case 'training':
        return <Loader2 className="h-12 w-12 animate-spin text-blue-600" />;
      case 'completed':
        return <CheckCircle2 className="h-12 w-12 text-green-600" />;
      case 'failed':
        return <XCircle className="h-12 w-12 text-red-600" />;
      default:
        return <Loader2 className="h-12 w-12 animate-spin text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (!job) return '';

    switch (job.status) {
      case 'training':
        return 'Training in Progress';
      case 'completed':
        return 'Training Completed';
      case 'failed':
        return 'Training Failed';
      default:
        return 'Processing';
    }
  };

  const getStatusColor = () => {
    if (!job) return 'gray';

    switch (job.status) {
      case 'training':
        return 'blue';
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getProgressStage = () => {
    if (!job) return '';

    const progress = job.progress;

    if (progress < 20) return 'Initializing...';
    if (progress < 40) return 'Preprocessing data...';
    if (progress < 80) return 'Training model...';
    if (progress < 100) return 'Finalizing...';
    return 'Complete';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Job Not Found</h1>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Model Training</h1>
          <p className="text-gray-600 mt-2">{job.fileName}</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center text-center space-y-4">
              {getStatusIcon()}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {getStatusText()}
                </h2>
                {job.status === 'training' && (
                  <p className="text-gray-600 mt-1">{getProgressStage()}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Training Progress</CardTitle>
            <CardDescription>
              {job.status === 'training'
                ? 'Model is being trained on your dataset'
                : job.status === 'completed'
                ? 'Training completed successfully'
                : 'Training process failed'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Progress</span>
                <span className="text-gray-600">{job.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    job.status === 'completed'
                      ? 'bg-green-600'
                      : job.status === 'failed'
                      ? 'bg-red-600'
                      : 'bg-blue-600'
                  }`}
                  style={{ width: `${job.progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className={`font-medium text-${getStatusColor()}-600 capitalize`}>
                  {job.status}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Job ID</p>
                <p className="font-medium text-gray-900 text-sm truncate">
                  {job.jobId}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Started</p>
                <p className="font-medium text-gray-900">
                  {new Date(job.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {new Date(job.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {job.status === 'training' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium">Training in progress</p>
                    <p className="text-blue-800 mt-1">
                      This page will automatically update. Training typically takes
                      5-30 minutes depending on dataset size.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {job.status === 'failed' && job.errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="text-sm text-red-900">
                    <p className="font-medium">Error Details</p>
                    <p className="text-red-800 mt-1">{job.errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {job.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-900 flex-1">
                    <p className="font-medium">Training completed successfully</p>
                    <p className="text-green-800 mt-1">
                      Your model is ready to generate synthetic data
                    </p>
                    {job.modelPath && (
                      <p className="text-xs text-green-700 mt-2">
                        Model saved at: {job.modelPath}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {(job.status === 'completed' || job.status === 'failed') && (
          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Back to Dashboard
            </Button>
            {job.status === 'completed' && (
              <Button
                onClick={() => navigate(`/generate/${job.jobId}`)}
                className="flex-1"
              >
                Generate Synthetic Data
              </Button>
            )}
            {job.status === 'failed' && (
              <Button
                onClick={() => navigate(`/analysis/${job.jobId}`)}
                className="flex-1"
              >
                Try Again
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
