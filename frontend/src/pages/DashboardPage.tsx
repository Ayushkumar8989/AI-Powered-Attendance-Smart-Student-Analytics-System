import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import { jobService, Job } from '@/services/job.service';
import { LogOut, Upload, FileText, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentJobs();
  }, []);

  const loadRecentJobs = async () => {
    try {
      const response = await jobService.getUserJobs(1, 5);
      setRecentJobs(response.jobs);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'training':
      case 'analyzing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const handleJobClick = (job: Job) => {
    if (job.status === 'training') {
      navigate(`/training/${job.jobId}`);
    } else if (job.status === 'queued' || job.status === 'analyzing') {
      navigate(`/analysis/${job.jobId}`);
    } else {
      navigate(`/analysis/${job.jobId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            DeAI Synthetic Data Generator
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <p className="font-medium">{user?.email}</p>
              <p className="text-gray-500 capitalize">{user?.role}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-600">
            Manage your synthetic data generation workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/upload')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upload Dataset</CardTitle>
                <Upload className="h-8 w-8 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Upload CSV or Excel files to analyze and train models
              </p>
              <Button className="w-full">Upload File</Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Total Jobs</CardTitle>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {recentJobs.length}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Recent training jobs
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Active Training</CardTitle>
                <Loader2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {recentJobs.filter(j => j.status === 'training').length}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Models currently training
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Jobs</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/upload')}>
                  <Upload className="h-4 w-4 mr-2" />
                  New Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : recentJobs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">
                    No jobs yet. Upload a dataset to get started.
                  </p>
                  <Button className="mt-4" onClick={() => navigate('/upload')}>
                    Upload Dataset
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentJobs.map((job) => (
                    <div
                      key={job.jobId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleJobClick(job)}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {getStatusIcon(job.status)}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{job.fileName}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(job.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            job.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : job.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : job.status === 'training'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {job.status}
                          </span>
                          {(job.status === 'training' || job.status === 'analyzing') && (
                            <p className="text-xs text-gray-500 mt-1">
                              {job.progress}%
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
