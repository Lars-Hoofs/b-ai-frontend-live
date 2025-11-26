'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RiAddLine,
  RiRobotLine,
  RiMoreLine,
  RiDeleteBinLine,
  RiEditLine,
  RiToggleLine,
  RiFlowChart,
  RiCpuLine,
  RiBookOpenLine,
} from '@remixicon/react';
import { CreateAgentModal } from '@/components/agents/CreateAgentModal';
import { EditAgentModal } from '@/components/agents/EditAgentModal';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { agentAPI } from '@/lib/api';

interface Agent {
  id: string;
  name: string;
  description: string | null;
  aiModel: string;
  isActive: boolean;
  workflowId: string | null;
  knowledgeBaseId?: string | null;
  workflow?: {
    id: string;
    name: string;
  };
  knowledgeBase?: {
    id: string;
    name: string;
  };
  _count?: {
    conversations: number;
    widgets: number;
  };
  createdAt: string;
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

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const { selectedWorkspace } = useWorkspace();

  // Load agents when workspace changes
  useEffect(() => {
    if (selectedWorkspace) {
      loadAgents();
    } else {
      setAgents([]);
      setIsLoading(false);
    }
  }, [selectedWorkspace]);

  const loadAgents = async () => {
    if (!selectedWorkspace) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await agentAPI.getWorkspaceAgents(selectedWorkspace.id);
      setAgents(data);
    } catch (err: any) {
      console.error('Failed to load agents:', err);
      setError(err.message || 'Failed to load agents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAgent = async (data: any) => {
    try {
      await agentAPI.create(data);
      setIsCreateModalOpen(false);
      // Reload agents from server to ensure consistency
      await loadAgents();
    } catch (err: any) {
      console.error('Failed to create agent:', err);
      alert(err.message || 'Failed to create agent');
    }
  };

  const handleEditAgent = async (data: any) => {
    if (!editingAgent || !selectedWorkspace) return;
    
    try {
      await agentAPI.update(editingAgent.id, {
        ...data,
        workspaceId: selectedWorkspace.id,
      });
      setIsEditModalOpen(false);
      setEditingAgent(null);
      // Reload agents from server to ensure consistency
      await loadAgents();
    } catch (err: any) {
      console.error('Failed to update agent:', err);
      alert(err.message || 'Failed to update agent');
    }
  };

  const handleToggleAgent = async (agentId: string, currentStatus: boolean) => {
    if (!selectedWorkspace) return;
    
    try {
      await agentAPI.toggle(agentId, selectedWorkspace.id, !currentStatus);
      setAgents(agents.map(a => a.id === agentId ? { ...a, isActive: !currentStatus } : a));
      setMenuOpenId(null);
    } catch (err: any) {
      console.error('Failed to toggle agent:', err);
      alert(err.message || 'Failed to toggle agent status');
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Weet je zeker dat je deze agent wilt verwijderen?')) return;
    if (!selectedWorkspace) return;
    
    try {
      await agentAPI.delete(agentId, selectedWorkspace.id);
      setAgents(agents.filter(a => a.id !== agentId));
      setMenuOpenId(null);
    } catch (err: any) {
      console.error('Failed to delete agent:', err);
      alert(err.message || 'Failed to delete agent');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Agents laden...</p>
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
              onClick={loadAgents}
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
            <RiRobotLine size={64} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Selecteer een workspace</h3>
            <p className="text-muted-foreground">Gebruik de team selector bovenaan om een workspace te selecteren</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Agents</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Configureer intelligente AI assistenten met custom gedrag en workflows
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:shadow-lg font-medium text-sm"
          >
            <RiAddLine size={18} />
            Create New
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
            <div className="text-2xl font-bold text-foreground">{agents.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Agents</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 hover:border-green-500/50 transition-colors">
            <div className="text-2xl font-bold text-green-600">
              {agents.filter(a => a.isActive).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Active</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 hover:border-blue-500/50 transition-colors">
            <div className="text-2xl font-bold text-blue-600">
              {agents.filter(a => a.knowledgeBaseId).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">With KB</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 hover:border-purple-500/50 transition-colors">
            <div className="text-2xl font-bold text-purple-600">
              {agents.filter(a => a.workflowId).length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">With Workflow</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 hover:border-orange-500/50 transition-colors">
            <div className="text-2xl font-bold text-orange-600">
              {agents.reduce((acc, a) => acc + (a._count?.widgets || 0), 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Total Widgets</div>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
      >
        {agents.map((agent) => (
          <motion.div
            key={agent.id}
            variants={itemVariants}
            className="group relative bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all duration-200 hover:shadow-md cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  agent.isActive ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  <RiRobotLine size={20} className={agent.isActive ? 'text-primary' : 'text-muted-foreground'} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground truncate">
                    {agent.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium ${
                      agent.isActive 
                        ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${agent.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {agent.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === agent.id ? null : agent.id);
                  }}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <RiMoreLine size={20} className="text-muted-foreground" />
                </button>

                {menuOpenId === agent.id && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        setEditingAgent(agent);
                        setIsEditModalOpen(true);
                        setMenuOpenId(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                    >
                      <RiEditLine size={18} />
                      <span>Bewerken</span>
                    </button>
                    <button
                      onClick={() => handleToggleAgent(agent.id, agent.isActive)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                    >
                      <RiToggleLine size={18} />
                      <span>{agent.isActive ? 'Deactiveren' : 'Activeren'}</span>
                    </button>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => handleDeleteAgent(agent.id)}
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
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
              {agent.description || 'No description provided'}
            </p>

            {/* Meta info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RiCpuLine size={14} />
                <span className="font-medium">{agent.aiModel}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {agent.knowledgeBase && (
                  <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 font-medium">
                    <RiBookOpenLine size={12} />
                    {agent.knowledgeBase.name}
                  </span>
                )}
                {agent.workflow && (
                  <span className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 font-medium">
                    <RiFlowChart size={12} />
                    {agent.workflow.name}
                  </span>
                )}
              </div>
            </div>

            {/* Footer stats */}
            <div className="flex items-center gap-4 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground">{agent._count?.widgets || 0}</span>
                <span className="text-xs text-muted-foreground">widgets</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground">{agent._count?.conversations || 0}</span>
                <span className="text-xs text-muted-foreground">chats</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {agents.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
            <RiRobotLine size={48} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Nog geen agents</h3>
          <p className="text-muted-foreground mb-6">
            Maak je eerste AI agent aan om te beginnen met geautomatiseerde gesprekken
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Maak je eerste agent
          </button>
        </div>
      )}

      {/* Modals */}
      {selectedWorkspace && (
        <>
          <CreateAgentModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateAgent}
            workspaceId={selectedWorkspace.id}
          />
          <EditAgentModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingAgent(null);
            }}
            onSubmit={handleEditAgent}
            workspaceId={selectedWorkspace.id}
            agent={editingAgent}
          />
        </>
      )}
    </div>
  );
}
