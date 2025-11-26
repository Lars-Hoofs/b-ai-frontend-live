'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { knowledgeBaseAPI } from '@/lib/api';
import { 
  RiUploadLine,
  RiArrowLeftLine,
  RiFileTextLine,
  RiFilePdfLine,
  RiFileWordLine,
  RiDeleteBinLine,
  RiCheckLine,
  RiCloseLine
} from '@remixicon/react';

interface UploadedFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedWorkspace } = useWorkspace();
  const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
  const [selectedKB, setSelectedKB] = useState('');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedWorkspace) {
      loadKnowledgeBases();
    }
  }, [selectedWorkspace]);

  const loadKnowledgeBases = async () => {
    if (!selectedWorkspace) return;

    try {
      const data = await knowledgeBaseAPI.getWorkspaceKBs(selectedWorkspace.id);
      setKnowledgeBases(data || []);
      
      // Pre-select KB from query param if available
      const kbParam = searchParams.get('kb');
      if (kbParam && data?.some((kb: any) => kb.id === kbParam)) {
        setSelectedKB(kbParam);
      } else if (data && data.length > 0) {
        setSelectedKB(data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load knowledge bases:', err);
    }
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map(file => ({
      file,
      status: 'pending',
      progress: 0,
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedKB || files.length === 0) return;
    if (!selectedWorkspace) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      if (files[i].status !== 'pending') continue;

      // Update status to uploading
      setFiles(prev => prev.map((f, idx) => 
        idx === i ? { ...f, status: 'uploading', progress: 0 } : f
      ));

      try {
        // Read file content
        const content = await readFileContent(files[i].file);
        
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 20) {
          setFiles(prev => prev.map((f, idx) => 
            idx === i ? { ...f, progress } : f
          ));
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        // Create document in knowledge base
        await knowledgeBaseAPI.createDocument({
          knowledgeBaseId: selectedKB,
          title: files[i].file.name,
          content: content,
          metadata: {
            filename: files[i].file.name,
            filesize: files[i].file.size,
            mimetype: files[i].file.type,
          },
        });

        // Update status to success
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'success', progress: 100 } : f
        ));
      } catch (err: any) {
        console.error('Upload failed:', err);
        setFiles(prev => prev.map((f, idx) => 
          idx === i ? { ...f, status: 'error', error: err.message } : f
        ));
      }
    }

    setIsUploading(false);
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <RiFilePdfLine size={24} className="text-red-500" />;
    if (ext === 'doc' || ext === 'docx') return <RiFileWordLine size={24} className="text-blue-500" />;
    return <RiFileTextLine size={24} className="text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const allSuccess = files.length > 0 && files.every(f => f.status === 'success');
  const hasErrors = files.some(f => f.status === 'error');

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
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload Files</h1>
        <p className="text-muted-foreground">
          Upload documents to your knowledge base (PDF, TXT, DOC, MD, etc.)
        </p>
      </div>

      <div className="max-w-4xl">
        {/* Knowledge Base Selection */}
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Select Knowledge Base *
          </label>
          {knowledgeBases.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No knowledge bases found. 
              <button
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
            >
              {knowledgeBases.map(kb => (
                <option key={kb.id} value={kb.id}>{kb.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`bg-card border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
        >
          <RiUploadLine size={64} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Drop files here or click to browse
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Supported formats: PDF, TXT, DOC, DOCX, MD, CSV
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.doc,.docx,.md,.csv"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Browse Files
          </button>
        </div>

        {/* Files List */}
        {files.length > 0 && (
          <div className="mt-6 bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 bg-muted/50 border-b border-border">
              <h3 className="font-semibold text-foreground">
                Files ({files.length})
              </h3>
            </div>
            <div className="divide-y divide-border">
              {files.map((fileItem, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {getFileIcon(fileItem.file.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {fileItem.file.name}
                        </h4>
                        {fileItem.status === 'pending' && (
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <RiDeleteBinLine size={18} />
                          </button>
                        )}
                        {fileItem.status === 'success' && (
                          <RiCheckLine size={20} className="text-green-500" />
                        )}
                        {fileItem.status === 'error' && (
                          <RiCloseLine size={20} className="text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {formatFileSize(fileItem.file.size)}
                      </p>
                      
                      {/* Progress Bar */}
                      {(fileItem.status === 'uploading' || fileItem.status === 'success') && (
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${fileItem.progress}%` }}
                          ></div>
                        </div>
                      )}
                      
                      {/* Error Message */}
                      {fileItem.status === 'error' && (
                        <p className="text-xs text-red-500 mt-1">
                          {fileItem.error || 'Upload failed'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success Message */}
        {allSuccess && (
          <div className="mt-6 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <RiCheckLine size={20} className="text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="font-medium text-green-700 dark:text-green-300">
                  All files uploaded successfully!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Your documents are now available in the knowledge base
                </p>
              </div>
              <button
                onClick={() => router.push('/dashboard/knowledge/documents')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
              >
                View Documents
              </button>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {files.length > 0 && !allSuccess && (
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setFiles([])}
              className="px-6 py-2 text-foreground hover:bg-muted rounded-lg transition-colors font-medium"
              disabled={isUploading}
            >
              Clear All
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedKB || isUploading || files.every(f => f.status !== 'pending')}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
            >
              <RiUploadLine size={18} />
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
