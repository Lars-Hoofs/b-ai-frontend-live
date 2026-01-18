'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { knowledgeBaseAPI, scraperAPI } from '@/lib/api';
import {
    RiArrowLeftLine,
    RiDatabase2Line,
    RiFileTextLine,
    RiGlobalLine,
    RiUploadLine,
    RiDeleteBinLine,
    RiDownloadLine,
    RiCheckLine,
    RiErrorWarningLine,
    RiLoader4Line,
    RiSearchLine,
    RiCalendarLine,
    RiTimeLine
} from '@remixicon/react';

interface Document {
    id: string;
    title: string;
    content: string;
    sourceType: 'UPLOAD' | 'SCRAPE';
    sourceUrl?: string;
    uploadedFileName?: string;
    createdAt: string;
    chunkCount?: number;
}

interface ScrapeJob {
    id: string;
    baseUrl: string;
    status: string;
    totalUrls: number;
    scrapedCount: number;
    failedCount: number;
    createdAt: string;
}

interface KnowledgeBase {
    id: string;
    name: string;
    description: string;
    documentCount: number;
    createdAt: string;
    updatedAt: string;
}

export default function KnowledgeBaseDetailPage() {
    const router = useRouter();
    const params = useParams();
    const kbId = params.id as string;
    const { selectedWorkspace } = useWorkspace();

    const [kb, setKb] = useState<KnowledgeBase | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [scrapeJobs, setScrapeJobs] = useState<ScrapeJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'scrapes' | 'uploads'>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (selectedWorkspace && kbId) {
            loadData();
        }
    }, [selectedWorkspace, kbId]);

    const loadData = async () => {
        if (!selectedWorkspace) return;

        try {
            setIsLoading(true);

            // Load KB details
            const kbData = await knowledgeBaseAPI.getById(kbId, selectedWorkspace.id);
            setKb(kbData);

            // Load documents
            const docsData = await knowledgeBaseAPI.getDocuments(kbId);
            console.log('📄 Loaded documents:', docsData);
            console.log('📊 Document breakdown:', {
                total: docsData?.length || 0,
                scraped: docsData?.filter((d: any) => d.sourceType === 'SCRAPE').length || 0,
                uploaded: docsData?.filter((d: any) => d.sourceType === 'UPLOAD').length || 0,
            });
            setDocuments(docsData || []);

            // Load scrape jobs
            try {
                const jobsData = await scraperAPI.getJobsForKB(kbId);
                setScrapeJobs(jobsData || []);
            } catch (err) {
                console.warn('Failed to load scrape jobs:', err);
                setScrapeJobs([]);
            }
        } catch (err: any) {
            console.error('Failed to load data:', err);
            alert(err.message || 'Failed to load knowledge base');
            router.push('/dashboard/knowledge');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteDocument = async (docId: string, title: string) => {
        if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

        try {
            await knowledgeBaseAPI.deleteDocument(docId);
            await loadData();
        } catch (err: any) {
            alert(err.message || 'Failed to delete document');
        }
    };

    // Filter documents based on tab and search
    const filteredDocuments = documents.filter(doc => {
        const matchesTab =
            activeTab === 'all' ||
            (activeTab === 'scrapes' && doc.sourceType === 'SCRAPE') ||
            (activeTab === 'uploads' && doc.sourceType === 'UPLOAD');

        const matchesSearch =
            !searchQuery ||
            doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.sourceUrl?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTab && matchesSearch;
    });

    const uploadedDocs = documents.filter(d => d.sourceType === 'UPLOAD');
    const scrapedDocs = documents.filter(d => d.sourceType === 'SCRAPE');

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading knowledge base...</p>
                </div>
            </div>
        );
    }

    if (!kb) return null;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.push('/dashboard/knowledge')}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <RiArrowLeftLine size={20} />
                    Back to Knowledge Bases
                </button>

                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-4 rounded-lg">
                            <RiDatabase2Line size={32} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">{kb.name}</h1>
                            <p className="text-muted-foreground mb-4">
                                {kb.description || 'No description'}
                            </p>
                            <div className="flex gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <RiFileTextLine size={16} />
                                    <span>{documents.length} documents</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <RiCalendarLine size={16} />
                                    <span>Created {new Date(kb.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => router.push(`/dashboard/knowledge/upload?kb=${kbId}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
                        >
                            <RiUploadLine size={18} />
                            Upload Files
                        </button>
                        <button
                            onClick={() => router.push(`/dashboard/knowledge/scrape?kb=${kbId}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                            <RiGlobalLine size={18} />
                            Scrape Website
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-50 dark:bg-blue-950 p-2 rounded-lg">
                            <RiFileTextLine size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground">Total Documents</h3>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{documents.length}</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-purple-50 dark:bg-purple-950 p-2 rounded-lg">
                            <RiGlobalLine size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground">Scraped Pages</h3>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{scrapedDocs.length}</p>
                </div>

                <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-green-50 dark:bg-green-950 p-2 rounded-lg">
                            <RiUploadLine size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-sm font-medium text-muted-foreground">Uploaded Files</h3>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{uploadedDocs.length}</p>
                </div>
            </div>

            {/* Scrape Jobs Section */}
            {scrapeJobs.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Recent Scrape Jobs</h2>
                    <div className="space-y-3">
                        {scrapeJobs.slice(0, 3).map((job) => (
                            <div
                                key={job.id}
                                onClick={() => router.push(`/dashboard/knowledge/scrape/jobs/${job.id}`)}
                                className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-foreground truncate">{job.baseUrl}</h3>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${job.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                                                job.status === 'IN_PROGRESS' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' :
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
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    {job.status === 'IN_PROGRESS' && (
                                        <RiLoader4Line size={20} className="text-primary animate-spin ml-4 flex-shrink-0" />
                                    )}
                                </div>
                            </div>
                        ))}
                        {scrapeJobs.length > 3 && (
                            <button
                                onClick={() => router.push(`/dashboard/knowledge/scrape?kb=${kbId}`)}
                                className="w-full py-2 text-sm text-primary hover:underline"
                            >
                                View all {scrapeJobs.length} jobs →
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Documents Section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Documents & Sources</h2>

                    {/* Search */}
                    <div className="relative w-64">
                        <RiSearchLine size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search documents..."
                            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4 border-b border-border">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'all'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        All ({documents.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('scrapes')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'scrapes'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Scraped ({scrapedDocs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('uploads')}
                        className={`px-4 py-2 font-medium transition-colors ${activeTab === 'uploads'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Uploaded ({uploadedDocs.length})
                    </button>
                </div>

                {/* Documents List */}
                {filteredDocuments.length === 0 ? (
                    <div className="bg-card border border-border rounded-lg p-12 text-center">
                        <RiFileTextLine size={64} className="text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            {searchQuery ? 'No documents found' : 'No documents yet'}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {searchQuery
                                ? 'Try a different search query'
                                : 'Upload files or scrape websites to add documents to this knowledge base'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredDocuments.map((doc) => (
                            <div
                                key={doc.id}
                                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-lg ${doc.sourceType === 'SCRAPE'
                                                ? 'bg-purple-50 dark:bg-purple-950'
                                                : 'bg-green-50 dark:bg-green-950'
                                                }`}>
                                                {doc.sourceType === 'SCRAPE' ? (
                                                    <RiGlobalLine size={16} className="text-purple-600 dark:text-purple-400" />
                                                ) : (
                                                    <RiUploadLine size={16} className="text-green-600 dark:text-green-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-foreground truncate">{doc.title}</h3>
                                                {doc.sourceType === 'SCRAPE' && doc.sourceUrl && (
                                                    <a
                                                        href={doc.sourceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-primary hover:underline truncate block"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {doc.sourceUrl}
                                                    </a>
                                                )}
                                                {doc.sourceType === 'UPLOAD' && doc.uploadedFileName && (
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {doc.uploadedFileName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                            {doc.content.substring(0, 200)}...
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <RiTimeLine size={14} />
                                                {new Date(doc.createdAt).toLocaleDateString()}
                                            </span>
                                            {doc.chunkCount && (
                                                <span>{doc.chunkCount} chunks</span>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteDocument(doc.id, doc.title)}
                                        className="ml-4 p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors flex-shrink-0"
                                    >
                                        <RiDeleteBinLine size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
