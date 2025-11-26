'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { knowledgeBaseAPI, scraperAPI } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import { 
  RiGlobalLine,
  RiArrowLeftLine,
  RiPlayLine,
  RiCheckLine,
  RiErrorWarningLine,
  RiLoader4Line,
  RiSearchLine
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
}

export default function ScrapePage() {
  const router = useRouter();
  const { selectedWorkspace } = useWorkspace();
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
  const [selectedKB, setSelectedKB] = useState('');
  const [url, setUrl] = useState('');
  const [maxPages, setMaxPages] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Job state
  const [currentJob, setCurrentJob] = useState<ScrapeJob | null>(null);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [searchFilter, setSearchFilter] = useState('');
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [isStartingScrape, setIsStartingScrape] = useState(false);
  const [allJobs, setAllJobs] = useState<ScrapeJob[]>([]);

  useEffect(() => {
    if (selectedWorkspace) {
      loadKnowledgeBases();
    }
  }, [selectedWorkspace]);
  
  // Load jobs when KB is selected
  useEffect(() => {
    if (selectedKB) {
      loadJobs();
    }
  }, [selectedKB]);
  
  // Auto-refresh jobs list every 5 seconds if there are active jobs
  useEffect(() => {
    if (!selectedKB || !allJobs.length) return;
    
    const hasActiveJobs = allJobs.some(job => 
      job.status === 'IN_PROGRESS' || job.status === 'DISCOVERING' || job.status === 'PENDING'
    );
    
    if (!hasActiveJobs) return;
    
    const interval = setInterval(() => {
      loadJobs();
    }, 10000); // Poll every 10 seconds to avoid rate limiting
    
    return () => clearInterval(interval);
  }, [selectedKB, allJobs.length, allJobs.some(j => j.status === 'IN_PROGRESS' || j.status === 'DISCOVERING')]);
  
  // Setup Socket.IO for real-time updates (only once)
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
      console.log('Job progress:', data);
      // Reload jobs list when any job makes progress
      if (selectedKB) {
        loadJobs();
      }
    });
    
    socketInstance.on('scraper:job-completed', (data: any) => {
      console.log('Job completed:', data);
      // Reload jobs list when any job completes
      if (selectedKB) {
        loadJobs();
      }
    });
    
    setSocket(socketInstance);
    
    return () => {
      console.log('Disconnecting Socket.IO');
      socketInstance.disconnect();
    };
  }, []); // Empty deps - only connect once

  const loadKnowledgeBases = async () => {
    if (!selectedWorkspace) return;

    try {
      const data = await knowledgeBaseAPI.getWorkspaceKBs(selectedWorkspace.id);
      setKnowledgeBases(data || []);
      if (data && data.length > 0) {
        setSelectedKB(data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load knowledge bases:', err);
    }
  };
  
  const loadJobs = async () => {
    if (!selectedKB) return;
    
    try {
      const jobs = await scraperAPI.getJobsForKB(selectedKB);
      setAllJobs(jobs || []);
    } catch (err: any) {
      console.error('Failed to load jobs:', err);
    }
  };

  const loadJobStatus = async (jobId: string) => {
    try {
      const job = await scraperAPI.getJob(jobId);
      setCurrentJob(job);
    } catch (err: any) {
      console.error('Failed to load job status:', err);
    }
  };

  const handleDiscoverUrls = async () => {
    if (!selectedKB || !url) return;

    setIsCreatingJob(true);
    try {
      const result = await scraperAPI.createJob(url, selectedKB, maxPages);
      setCurrentJob(result.job);
      
      // Poll for job status until discovery is complete
      const pollInterval = setInterval(async () => {
        const job = await scraperAPI.getJob(result.job.id);
        setCurrentJob(job);
        
        if (job.status === 'PENDING' || job.status === 'FAILED') {
          clearInterval(pollInterval);
          setIsCreatingJob(false);
          
          if (job.status === 'PENDING') {
            // Auto-select all URLs
            setSelectedUrls(new Set(job.discoveredUrls));
          }
        }
      }, 3000); // Poll every 3 seconds to avoid rate limiting
    } catch (err: any) {
      console.error('Failed to create job:', err);
      alert(err.message || 'Failed to discover URLs');
      setIsCreatingJob(false);
    }
  };

  const handleStartScraping = async () => {
    if (!currentJob || selectedUrls.size === 0) return;

    setIsStartingScrape(true);
    try {
      await scraperAPI.startJob(currentJob.id, Array.from(selectedUrls));
      // Reload jobs list
      loadJobs();
      // Job will run in background, we can navigate away
      router.push(`/dashboard/knowledge/scrape/jobs/${currentJob.id}`);
    } catch (err: any) {
      console.error('Failed to start scraping:', err);
      alert(err.message || 'Failed to start scraping');
      setIsStartingScrape(false);
    }
  };

  const handleToggleUrl = (url: string) => {
    const newSelected = new Set(selectedUrls);
    if (newSelected.has(url)) {
      newSelected.delete(url);
    } else {
      newSelected.add(url);
    }
    setSelectedUrls(newSelected);
  };

  const handleSelectAll = () => {
    if (currentJob) {
      setSelectedUrls(new Set(filteredUrls));
    }
  };

  const handleDeselectAll = () => {
    setSelectedUrls(new Set());
  };

  const filteredUrls = currentJob?.discoveredUrls.filter(url =>
    url.toLowerCase().includes(searchFilter.toLowerCase())
  ) || [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/dashboard/knowledge')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <RiArrowLeftLine size={20} />
          Back to Knowledge Base
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-2">Scrape Website</h1>
        <p className="text-muted-foreground">
          Discover URLs, select which to scrape, and run in background
        </p>
      </div>

      <div className="max-w-6xl">
        {/* Step 1: Configure */}
        {!currentJob && (
          <form onSubmit={(e) => { e.preventDefault(); handleDiscoverUrls(); }} className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Select Knowledge Base *
              </label>
              {knowledgeBases.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No knowledge bases found. 
                  <button
                    type="button"
                    onClick={() => router.push('/dashboard/knowledge')}
                    className="text-primary hover:underline ml-1"
                  >
                    Create one first
                  </button>
                </div>
              ) : (
                <select
                  value={selectedKB}
                  onChange={(e) => setSelectedKB(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  required
                >
                  {knowledgeBases.map(kb => (
                    <option key={kb.id} value={kb.id}>{kb.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Website Base URL *
              </label>
              <div className="relative">
                <RiGlobalLine size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  required
                />
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <label className="block text-sm font-medium text-foreground mb-2">
                Maximum Pages to Discover
              </label>
              <input
                type="number"
                value={maxPages}
                onChange={(e) => setMaxPages(parseInt(e.target.value) || 0)}
                min={0}
                placeholder="0 voor ongelimiteerd"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-2">
                0 = ongelimiteerd (max 10.000 pagina's)
              </p>
            </div>

            <button
              type="submit"
              disabled={!selectedKB || !url || isCreatingJob}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
            >
              {isCreatingJob ? (
                <>
                  <RiLoader4Line size={20} className="animate-spin" />
                  Discovering URLs...
                </>
              ) : (
                <>
                  <RiSearchLine size={20} />
                  Discover URLs
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Select URLs */}
        {currentJob && currentJob.status === 'PENDING' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Discovered {currentJob.discoveredUrls.length} URLs
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Select which URLs to scrape
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    Select All ({filteredUrls.length})
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Search filter */}
              <div className="relative mb-4">
                <RiSearchLine size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter URLs..."
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              {/* URL list */}
              <div className="max-h-96 overflow-y-auto border border-border rounded-lg">
                {filteredUrls.map((url, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b border-border last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUrls.has(url)}
                      onChange={() => handleToggleUrl(url)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-foreground flex-1 truncate">{url}</span>
                  </label>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedUrls.size} URL{selectedUrls.size !== 1 ? 's' : ''} selected
                </p>
                <button
                  onClick={handleStartScraping}
                  disabled={selectedUrls.size === 0 || isStartingScrape}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {isStartingScrape ? (
                    <>
                      <RiLoader4Line size={20} className="animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <RiPlayLine size={20} />
                      Start Scraping ({selectedUrls.size})
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={() => setCurrentJob(null)}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              ← Start over
            </button>
          </div>
        )}

        {/* Status messages */}
        {currentJob && currentJob.status === 'DISCOVERING' && (
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3">
              <RiLoader4Line size={24} className="text-primary animate-spin" />
              <div>
                <p className="font-medium text-foreground">Discovering URLs...</p>
                <p className="text-sm text-muted-foreground">Please wait while we crawl the website</p>
              </div>
            </div>
          </div>
        )}

        {currentJob && currentJob.status === 'FAILED' && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <RiErrorWarningLine size={24} className="text-red-600 dark:text-red-400" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-300">Discovery Failed</p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {currentJob.errorMessage || 'An error occurred'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCurrentJob(null)}
              className="mt-4 text-red-600 dark:text-red-400 hover:underline text-sm"
            >
              Try again
            </button>
          </div>
        )}
        
        {/* Jobs List */}
        {allJobs.length > 0 && !currentJob && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Recent Scrape Jobs</h2>
            <div className="space-y-3">
              {allJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => router.push(`/dashboard/knowledge/scrape/jobs/${job.id}`)}
                  className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground truncate">{job.baseUrl}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          job.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                          job.status === 'IN_PROGRESS' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
                          job.status === 'DISCOVERING' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                          job.status === 'PENDING' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' :
                          job.status === 'FAILED' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{job.totalUrls} URLs discovered</span>
                        {job.scrapedCount > 0 && (
                          <span className="text-green-600 dark:text-green-400">
                            {job.scrapedCount} scraped
                          </span>
                        )}
                        {job.failedCount > 0 && (
                          <span className="text-red-600 dark:text-red-400">
                            {job.failedCount} failed
                          </span>
                        )}
                        <span className="ml-auto">
                          {new Date(job.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {job.status === 'IN_PROGRESS' && (
                      <RiLoader4Line size={20} className="text-primary animate-spin ml-4 flex-shrink-0" />
                    )}
                    {job.status === 'COMPLETED' && (
                      <RiCheckLine size={20} className="text-green-500 ml-4 flex-shrink-0" />
                    )}
                    {job.status === 'FAILED' && (
                      <RiErrorWarningLine size={20} className="text-red-500 ml-4 flex-shrink-0" />
                    )}
                  </div>
                  {job.status === 'IN_PROGRESS' && job.totalUrls > 0 && (
                    <div className="mt-3">
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${(job.scrapedCount / job.totalUrls) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
