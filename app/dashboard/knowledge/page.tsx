'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { knowledgeBaseAPI } from '@/lib/api';
import { 
  RiDatabase2Line,
  RiFileTextLine,
  RiUploadLine,
  RiGlobalLine,
  RiAddLine,
  RiSearchLine,
  RiDeleteBinLine,
  RiArrowRightSLine
} from '@remixicon/react';

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function KnowledgeBasePage() {
  const router = useRouter();
  const { selectedWorkspace } = useWorkspace();
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKB, setNewKB] = useState({ name: '', description: '' });

  useEffect(() => {
    if (selectedWorkspace) {
      loadKnowledgeBases();
    }
  }, [selectedWorkspace]);

  const loadKnowledgeBases = async () => {
    if (!selectedWorkspace) return;

    try {
      setIsLoading(true);
      const data = await knowledgeBaseAPI.getWorkspaceKBs(selectedWorkspace.id);
      setKnowledgeBases(data || []);
    } catch (err: any) {
      console.error('Failed to load knowledge bases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKB = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkspace) return;

    try {
      await knowledgeBaseAPI.create({
        workspaceId: selectedWorkspace.id,
        name: newKB.name,
        description: newKB.description,
      });
      setShowCreateModal(false);
      setNewKB({ name: '', description: '' });
      await loadKnowledgeBases();
    } catch (err: any) {
      alert(err.message || 'Failed to create knowledge base');
    }
  };

  const handleDeleteKB = async (id: string, name: string) => {
    if (!selectedWorkspace) return;
    if (!confirm(`Are you sure you want to delete "${name}"? This will delete all documents in this knowledge base.`)) {
      return;
    }

    try {
      await knowledgeBaseAPI.delete(id, selectedWorkspace.id);
      await loadKnowledgeBases();
    } catch (err: any) {
      alert(err.message || 'Failed to delete knowledge base');
    }
  };

  const quickActions = [
    {
      title: 'View Documents',
      description: 'Browse all documents in your knowledge bases',
      icon: RiFileTextLine,
      href: '/dashboard/knowledge/documents',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Upload Files',
      description: 'Upload PDF, TXT, or other documents',
      icon: RiUploadLine,
      href: '/dashboard/knowledge/upload',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Scrape Website',
      description: 'Import content from websites automatically',
      icon: RiGlobalLine,
      href: '/dashboard/knowledge/scrape',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
  ];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading knowledge bases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Manage your AI agent's knowledge with documents and web content
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <RiAddLine size={20} />
          Create Knowledge Base
        </button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.title}
              onClick={() => router.push(action.href)}
              className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${action.bgColor} p-3 rounded-lg`}>
                  <Icon size={24} className={action.color} />
                </div>
                <RiArrowRightSLine 
                  size={20} 
                  className="text-muted-foreground group-hover:translate-x-1 transition-transform" 
                />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {action.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {action.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Knowledge Bases List */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Your Knowledge Bases</h2>
        
        {knowledgeBases.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <RiDatabase2Line size={64} className="text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No knowledge bases yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Create your first knowledge base to start training your AI agents
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <RiAddLine size={20} />
              Create Knowledge Base
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {knowledgeBases.map((kb) => (
              <div
                key={kb.id}
                className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <RiDatabase2Line size={24} className="text-primary" />
                  </div>
                  <button
                    onClick={() => handleDeleteKB(kb.id, kb.name)}
                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                  >
                    <RiDeleteBinLine size={18} />
                  </button>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {kb.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {kb.description || 'No description'}
                </p>
                
                <div className="pt-4 border-t border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {kb.documentCount} documents
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/knowledge/upload?kb=${kb.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                    >
                      <RiUploadLine size={14} />
                      Upload
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/knowledge/scrape?kb=${kb.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                    >
                      <RiGlobalLine size={14} />
                      Scrape
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Create Knowledge Base
            </h3>
            
            <form onSubmit={handleCreateKB} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={newKB.name}
                  onChange={(e) => setNewKB({ ...newKB, name: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  required
                  placeholder="e.g., Product Documentation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={newKB.description}
                  onChange={(e) => setNewKB({ ...newKB, description: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewKB({ name: '', description: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
