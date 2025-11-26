'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { scraperAPI } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import { 
  RiArrowLeftLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiLoader4Line,
} from '@remixicon/react';

type JobStatus = 'DISCOVERING' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

interface ScrapeJob {
  id: string;
  baseUrl: string;
  status: JobStatus;
  discoveredUrls: string[];
  selectedUrls: string[];
  scrapedUrls: string[];
  totalUrls: number;
  scrapedCount: number;
  failedCount: number;
  createdAt: string;
  completedAt?: string;
}

export default function JobStatusPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.jobId as string;
  
  const [job, setJob] = useState<ScrapeJob | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (jobId) {
      loadJob();
    }
  }, [jobId]);
  
  // Setup Socket.IO (only once)
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const socketInstance = io(API_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    
    socketInstance.on('connect', () => {
      console.log('Socket.IO connected');
    });
    
    socketInstance.on('scraper:job-progress', (data: any) => {
      if (data.jobId === jobId) {
        console.log('Socket: Job progress update');
        loadJob();
      }
    });
    
    socketInstance.on('scraper:job-completed', (data: any) => {
      if (data.jobId === jobId) {
        console.log('Socket: Job completed');
        loadJob();
      }
    });
    
    setSocket(socketInstance);
    
    return () => {
      console.log('Disconnecting Socket.IO');
      socketInstance.disconnect();
    };
  }, []); // Empty deps - only connect once

  const loadJob = async () => {
    try {
      const jobData = await scraperAPI.getJob(jobId);
      setJob(jobData);
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load job:', err);
      setLoading(false);
    }
  };
  
  // Auto-refresh polling (fallback for Socket.IO)
  useEffect(() => {
    if (!job) return;
    
    // Only poll while job is active
    if (job.status !== 'IN_PROGRESS' && job.status !== 'DISCOVERING') return;
    
    const interval = setInterval(() => {
      loadJob();
    }, 5000); // Poll every 5 seconds to avoid rate limiting
    
    return () => clearInterval(interval);
  }, [job?.status, jobId]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RiLoader4Line size={48} className="text-primary animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Job not found</p>
      </div>
    );
  }

  const progress = job.totalUrls > 0 ? (job.scrapedCount / job.totalUrls) * 100 : 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/knowledge/scrape')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <RiArrowLeftLine size={20} />
          Back to Scraper
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-2">Scrape Job</h1>
        <p className="text-muted-foreground">{job.baseUrl}</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Status Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Status</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              job.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
              job.status === 'IN_PROGRESS' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
              job.status === 'FAILED' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
              'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}>
              {job.status}
            </span>
          </div>

          {job.status === 'IN_PROGRESS' && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {job.scrapedCount} / {job.totalUrls} pages
                </span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-background rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Total URLs</p>
              <p className="text-2xl font-bold text-foreground">{job.totalUrls}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
              <p className="text-sm text-green-600 dark:text-green-400 mb-1">Scraped</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {job.scrapedCount}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400 mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {job.failedCount}
              </p>
            </div>
          </div>
        </div>

        {/* Recently Scraped URLs */}
        {job.scrapedUrls.length > 0 && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Recently Scraped URLs
              </h2>
              {job.status === 'IN_PROGRESS' && (
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <RiLoader4Line size={16} className="animate-spin" />
                  Updating...
                </span>
              )}
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {job.scrapedUrls.slice(-20).reverse().map((url, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-background rounded-lg animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <RiCheckLine size={20} className="text-green-500 flex-shrink-0" />
                  <span className="text-sm text-foreground truncate">{url}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Showing last 20 of {job.scrapedUrls.length} scraped URLs
            </p>
          </div>
        )}

        {/* Completion Message */}
        {job.status === 'COMPLETED' && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <RiCheckLine size={24} className="text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-300">
                  Scraping Completed!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Successfully scraped {job.scrapedCount} of {job.totalUrls} pages
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/knowledge/documents')}
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View Documents
            </button>
          </div>
        )}

        {/* Error Message */}
        {job.status === 'FAILED' && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <RiErrorWarningLine size={24} className="text-red-600 dark:text-red-400" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-300">Scraping Failed</p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  An error occurred during scraping
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
