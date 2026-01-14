'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { RiAddLine, RiPlayLine, RiStopLine, RiMoreLine, RiDeleteBinLine, RiEditLine, RiFlowChart } from '@remixicon/react';
import { CreateWorkflowModal } from '@/components/workflows/CreateWorkflowModal';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { workflowAPI } from '@/lib/api';

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  version: number;
  _count?: {
    nodes: number;
    edges: number;
  };
  createdAt: string;
  updatedAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const { selectedWorkspace } = useWorkspace();

  // Load workflows when workspace changes
  useEffect(() => {
    if (selectedWorkspace) {
      loadWorkflows();
    } else {
      setWorkflows([]);
      setIsLoading(false);
    }
  }, [selectedWorkspace]);

  const loadWorkflows = async () => {
    if (!selectedWorkspace) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await workflowAPI.getWorkspaceWorkflows(selectedWorkspace.id);
      if (data) {
        setWorkflows(data);
      }
    } catch (err: any) {
      console.error('Failed to load workflows:', err);
      setError(err.message || 'Failed to load workflows');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkflow = async (data: { name: string; description: string }) => {
    if (!selectedWorkspace) return;

    try {
      await workflowAPI.create({
        workspaceId: selectedWorkspace.id,
        ...data,
      });
      setIsCreateModalOpen(false);
      // Reload workflows from server to ensure consistency
      await loadWorkflows();
    } catch (err: any) {
      console.error('Failed to create workflow:', err);
      alert(err.message || 'Failed to create workflow');
    }
  };

  const handleToggleWorkflow = async (workflowId: string, currentStatus: boolean) => {
    if (!selectedWorkspace) return;

    try {
      await workflowAPI.toggle(workflowId, selectedWorkspace.id, !currentStatus);
      setWorkflows(workflows.map(w => w.id === workflowId ? { ...w, isActive: !currentStatus } : w));
      setMenuOpenId(null);
    } catch (err: any) {
      console.error('Failed to toggle workflow:', err);
      alert(err.message || 'Failed to toggle workflow status');
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm('Weet je zeker dat je deze workflow wilt verwijderen?')) return;
    if (!selectedWorkspace) return;

    try {
      await workflowAPI.delete(workflowId, selectedWorkspace.id);
      setWorkflows(workflows.filter(w => w.id !== workflowId));
      setMenuOpenId(null);
    } catch (err: any) {
      console.error('Failed to delete workflow:', err);
      alert(err.message || 'Failed to delete workflow');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Workflows laden...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Fout bij laden</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={loadWorkflows}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Probeer opnieuw
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show workspace selection if no workspace
  if (!selectedWorkspace) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RiFlowChart size={64} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Selecteer een workspace</h3>
            <p className="text-muted-foreground">Gebruik de team selector bovenaan om een workspace te selecteren</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-8 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Workflows</h1>
            <p className="text-muted-foreground text-lg">
              Automatiseer complexe conversatie flows met visuele workflows
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <RiAddLine size={20} />
            Nieuwe Workflow
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">{workflows.length}</div>
            <div className="text-sm text-muted-foreground">Totaal Workflows</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {workflows.filter(w => w.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">Actieve Workflows</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {workflows.reduce((acc, w) => acc + (w._count?.nodes || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Totaal Nodes</div>
          </div>
        </div>
      </div>

      {/* Scrollable Workflows Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {workflows.map((workflow) => (
            <motion.div
              key={workflow.id}
              variants={itemVariants}
              onClick={() => router.push(`/dashboard/workflows/${workflow.id}`)}
              className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${workflow.isActive ? 'bg-primary/10' : 'bg-muted'
                    }`}>
                    <RiFlowChart size={24} className={workflow.isActive ? 'text-primary' : 'text-muted-foreground'} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {workflow.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${workflow.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                        }`}>
                        {workflow.isActive ? 'Actief' : 'Inactief'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === workflow.id ? null : workflow.id);
                    }}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <RiMoreLine size={20} className="text-muted-foreground" />
                  </button>

                  {menuOpenId === workflow.id && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/workflows/${workflow.id}`);
                          setMenuOpenId(null);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                      >
                        <RiEditLine size={18} />
                        <span>Bewerken</span>
                      </button>
                      <button
                        onClick={() => handleToggleWorkflow(workflow.id, workflow.isActive)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                      >
                        {workflow.isActive ? <RiStopLine size={18} /> : <RiPlayLine size={18} />}
                        <span>{workflow.isActive ? 'Deactiveren' : 'Activeren'}</span>
                      </button>
                      <div className="border-t border-border my-1" />
                      <button
                        onClick={() => handleDeleteWorkflow(workflow.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-destructive/10 text-destructive transition-colors text-left"
                      >
                        <RiDeleteBinLine size={18} />
                        <span>Verwijderen</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-4 line-clamp-2">
                {workflow.description || 'Geen beschrijving'}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Nodes</div>
                  <div className="text-lg font-semibold text-foreground">
                    {workflow._count?.nodes || 0}
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="text-xs text-muted-foreground mb-1">Edges</div>
                  <div className="text-lg font-semibold text-foreground">
                    {workflow._count?.edges || 0}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  v{workflow.version}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(workflow.updatedAt).toLocaleDateString('nl-NL')}
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {workflows.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
              <RiFlowChart size={48} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Nog geen workflows</h3>
            <p className="text-muted-foreground mb-6">
              Maak je eerste workflow aan om conversaties te automatiseren
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Maak je eerste workflow
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedWorkspace && (
        <CreateWorkflowModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateWorkflow}
        />
      )}
    </div>
  );
}
