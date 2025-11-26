'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { knowledgeBaseAPI } from '@/lib/api';
import { 
  RiArrowLeftLine,
  RiDatabase2Line,
  RiCheckLine
} from '@remixicon/react';

export default function DocumentsPage() {
  const router = useRouter();
  const { selectedWorkspace } = useWorkspace();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!selectedWorkspace || !name.trim()) return;

    setIsCreating(true);
    setError('');

    try {
      await knowledgeBaseAPI.create({
        workspaceId: selectedWorkspace.id,
        name: name.trim(),
        description: description.trim() || undefined,
      });

      setShowSuccess(true);
      setName('');
      setDescription('');

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard/knowledge');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to create knowledge base:', err);
      setError(err.message || 'Failed to create knowledge base');
    } finally {
      setIsCreating(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-foreground mb-2">Create Knowledge Base</h1>
        <p className="text-muted-foreground">
          Create a new knowledge base to store and organize your documents
        </p>
      </div>

      <div className="max-w-2xl">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <RiCheckLine size={20} className="text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="font-medium text-green-700 dark:text-green-300">
                  Knowledge base created successfully!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Redirecting back to knowledge base...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Creation Form */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
              <RiDatabase2Line size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Knowledge Base Details</h2>
              <p className="text-sm text-muted-foreground">Enter the basic information for your knowledge base</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Product Documentation, Customer FAQ"
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                disabled={isCreating}
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this knowledge base will contain..."
                rows={4}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                disabled={isCreating}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={() => router.push('/dashboard/knowledge')}
              className="px-6 py-2 text-foreground hover:bg-muted rounded-lg transition-colors font-medium"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim() || isCreating}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Knowledge Base'}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 <strong>Next steps:</strong> After creating your knowledge base, you can upload documents or scrape websites to populate it with content.
          </p>
        </div>
      </div>
    </div>
  );
}
