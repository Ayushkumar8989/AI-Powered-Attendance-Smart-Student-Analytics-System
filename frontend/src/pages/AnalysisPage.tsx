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
import { AlertCircle, CheckCircle2, Play, Loader2 } from 'lucide-react';

export const AnalysisPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingTraining, setIsStartingTraining] = useState(false);

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);

  const loadJob = async () => {
    try {
      const jobData = await jobService.getJob(jobId!);
      setJob(jobData);

      if (jobData.status === 'analyzing') {
        setTimeout(loadJob, 3000);
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

  const handleStartTraining = async () => {
    if (!jobId) return;

    setIsStartingTraining(true);

    try {
      await jobService.startTraining({
        jobId,
        modelConfig: {
          modelType: 'sdv',
          epochs: 10,
        },
      });

      toast({
        title: 'Success',
        description: 'Model training started',
      });

      navigate(`/training/${jobId}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to start training',
        variant: 'destructive',
      });
    } finally {
      setIsStartingTraining(false);
    }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dataset Analysis</h1>
          <p className="text-gray-600 mt-2">{job.fileName}</p>
        </div>

        {job.status === 'analyzing' && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <div>
                  <p className="font-medium">Analyzing dataset...</p>
                  <p className="text-sm text-gray-600">
                    This may take a few moments
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {job.status === 'failed' && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Analysis Failed</p>
                  <p className="text-sm text-red-800 mt-1">
                    {job.errorMessage || 'An error occurred during analysis'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {job.schemaAnalysis && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Rows</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">
                    {job.schemaAnalysis.rowCount.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Columns</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    {Object.keys(job.schemaAnalysis.columnTypes).length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                    <span className="text-lg font-medium">Ready</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Column Analysis</CardTitle>
                <CardDescription>
                  Detected column types and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                          Column Name
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                          Statistics
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {Object.entries(job.schemaAnalysis.columnTypes).map(
                        ([colName, colType]) => {
                          const dist = job.schemaAnalysis!.dataDistribution[colName];
                          return (
                            <tr key={colName} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {colName}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {colType}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {dist?.mean !== undefined && (
                                  <span>Mean: {dist.mean.toFixed(2)} | </span>
                                )}
                                {dist?.uniqueValues !== undefined && (
                                  <span>Unique: {dist.uniqueValues} | </span>
                                )}
                                {dist?.missing !== undefined && (
                                  <span>Missing: {dist.missing}</span>
                                )}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {job.schemaAnalysis.recommendations.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {job.schemaAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {job.status === 'queued' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        Ready to Train Model
                      </h3>
                      <p className="text-sm text-gray-600">
                        Start training a synthetic data generation model on this dataset
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={handleStartTraining}
                      disabled={isStartingTraining}
                    >
                      {isStartingTraining ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-5 w-5" />
                          Start Training
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
};
