import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { jobService, Job } from '@/services/job.service';
import { generationService, GenerationJob } from '@/services/generation.service';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  Database,
  FileText,
} from 'lucide-react';

export const GenerationPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const { toast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [generationJob, setGenerationJob] = useState<GenerationJob | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const [numberOfRows, setNumberOfRows] = useState<string>('10000');
  const [outputFormat, setOutputFormat] = useState<'csv' | 'parquet'>('csv');
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  useEffect(() => {
    if (generationJob && generationJob.status === 'processing') {
      const interval = setInterval(() => {
        loadGenerationStatus();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [generationJob]);

  const loadJob = async () => {
    try {
      const jobData = await jobService.getJob(jobId!);
      setJob(jobData);

      if (jobData.status !== 'completed') {
        toast({
          title: 'Job Not Ready',
          description: 'This job must be completed before generating synthetic data',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load job',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingJob(false);
    }
  };

  const loadGenerationStatus = async () => {
    if (!generationJob) return;

    try {
      const status = await generationService.getGeneration(
        generationJob.generationJobId
      );
      setGenerationJob(status);

      if (status.status === 'completed') {
        toast({
          title: 'Generation Complete',
          description: 'Your synthetic dataset is ready to download',
        });
      } else if (status.status === 'failed') {
        toast({
          title: 'Generation Failed',
          description: status.errorMessage || 'An error occurred during generation',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Failed to load generation status:', error);
    }
  };

  const validateNumberOfRows = (value: string): boolean => {
    const num = parseInt(value);
    if (isNaN(num)) {
      setValidationError('Please enter a valid number');
      return false;
    }
    if (num < 1) {
      setValidationError('Minimum 1 row required');
      return false;
    }
    if (num > 1000000) {
      setValidationError('Maximum 1,000,000 rows allowed');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleNumberOfRowsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNumberOfRows(value);
    if (value) {
      validateNumberOfRows(value);
    } else {
      setValidationError('');
    }
  };

  const handleGenerate = async () => {
    if (!jobId || !job) return;

    if (!validateNumberOfRows(numberOfRows)) {
      return;
    }

    const rows = parseInt(numberOfRows);

    setIsGenerating(true);

    try {
      const result = await generationService.createGeneration(jobId, {
        modelId: job.modelPath || 'default-model',
        numberOfRows: rows,
        outputFormat,
      });

      toast({
        title: 'Generation Started',
        description: `Generating ${rows.toLocaleString()} synthetic rows`,
      });

      const generationStatus = await generationService.getGeneration(
        result.generationJobId
      );
      setGenerationJob(generationStatus);
    } catch (error: any) {
      toast({
        title: 'Generation Failed',
        description: error.response?.data?.message || 'Failed to start generation',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatTimeEstimate = (seconds?: number): string => {
    if (!seconds) return 'Calculating...';
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  if (isLoadingJob) {
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
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
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
          <h1 className="text-3xl font-bold text-gray-900">
            Generate Synthetic Data
          </h1>
          <p className="text-gray-600 mt-2">{job.fileName}</p>
        </div>

        {!generationJob && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Generation Parameters</CardTitle>
              <CardDescription>
                Configure your synthetic data generation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="rows">Number of Rows</Label>
                <Input
                  id="rows"
                  type="number"
                  min="1"
                  max="1000000"
                  value={numberOfRows}
                  onChange={handleNumberOfRowsChange}
                  placeholder="Enter number of rows (1 - 1,000,000)"
                  disabled={isGenerating}
                />
                {validationError && (
                  <p className="text-sm text-red-600">{validationError}</p>
                )}
                <p className="text-xs text-gray-500">
                  Maximum: 1,000,000 rows per generation
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Output Format</Label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setOutputFormat('csv')}
                    disabled={isGenerating}
                    className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                      outputFormat === 'csv'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <p className="font-medium">CSV</p>
                    <p className="text-xs text-gray-600">Comma-separated values</p>
                  </button>
                  <button
                    onClick={() => setOutputFormat('parquet')}
                    disabled={isGenerating}
                    className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                      outputFormat === 'parquet'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Database className="h-6 w-6 mx-auto mb-2 text-green-600" />
                    <p className="font-medium">Parquet</p>
                    <p className="text-xs text-gray-600">Columnar storage format</p>
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Data Generation Info:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-800">
                      <li>Data is generated in chunks for optimal performance</li>
                      <li>Files are uploaded to decentralized storage (IPFS)</li>
                      <li>Generation typically takes 5-30 seconds per 10,000 rows</li>
                      <li>You'll receive a permanent storage link when complete</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleGenerate}
                disabled={
                  isGenerating ||
                  !numberOfRows ||
                  !!validationError ||
                  job.status !== 'completed'
                }
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Starting Generation...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-5 w-5" />
                    Generate Synthetic Data
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {generationJob && (
          <>
            <Card className="mb-6">
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  {generationJob.status === 'processing' && (
                    <>
                      <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Generating Data
                        </h2>
                        <p className="text-gray-600 mt-1">
                          {generationJob.currentRows?.toLocaleString()} of{' '}
                          {generationJob.numberOfRows.toLocaleString()} rows
                        </p>
                      </div>
                    </>
                  )}
                  {generationJob.status === 'completed' && (
                    <>
                      <CheckCircle2 className="h-12 w-12 text-green-600" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Generation Complete
                        </h2>
                        <p className="text-gray-600 mt-1">
                          Successfully generated{' '}
                          {generationJob.numberOfRows.toLocaleString()} rows
                        </p>
                      </div>
                    </>
                  )}
                  {generationJob.status === 'failed' && (
                    <>
                      <AlertCircle className="h-12 w-12 text-red-600" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Generation Failed
                        </h2>
                        <p className="text-gray-600 mt-1">
                          {generationJob.errorMessage || 'An error occurred'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Progress Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Progress</span>
                    <span className="text-gray-600">
                      {generationJob.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        generationJob.status === 'completed'
                          ? 'bg-green-600'
                          : generationJob.status === 'failed'
                          ? 'bg-red-600'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${generationJob.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium capitalize">{generationJob.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Format</p>
                    <p className="font-medium uppercase">
                      {generationJob.outputFormat}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Target Rows</p>
                    <p className="font-medium">
                      {generationJob.numberOfRows.toLocaleString()}
                    </p>
                  </div>
                  {generationJob.estimatedTime && (
                    <div>
                      <p className="text-sm text-gray-600">Est. Time</p>
                      <p className="font-medium">
                        {formatTimeEstimate(generationJob.estimatedTime)}
                      </p>
                    </div>
                  )}
                  {generationJob.fileSize && (
                    <div>
                      <p className="text-sm text-gray-600">File Size</p>
                      <p className="font-medium">{generationJob.fileSize} MB</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Storage Type</p>
                    <p className="font-medium uppercase">
                      {generationJob.storageType}
                    </p>
                  </div>
                </div>

                {generationJob.status === 'completed' && generationJob.storageLink && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div className="flex-1 text-sm text-green-900">
                        <p className="font-medium mb-2">Dataset Ready</p>
                        <p className="text-green-800 mb-3">
                          Your synthetic dataset has been uploaded to decentralized
                          storage
                        </p>
                        <Button
                          onClick={() => window.open(generationJob.storageLink, '_blank')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Synthetic Dataset
                        </Button>
                        <p className="text-xs text-green-700 mt-3 break-all">
                          Link: {generationJob.storageLink}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {generationJob.status !== 'processing' && (
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1"
                >
                  Back to Dashboard
                </Button>
                {generationJob.status === 'failed' && (
                  <Button
                    onClick={() => {
                      setGenerationJob(null);
                      setNumberOfRows('10000');
                    }}
                    className="flex-1"
                  >
                    Try Again
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};
