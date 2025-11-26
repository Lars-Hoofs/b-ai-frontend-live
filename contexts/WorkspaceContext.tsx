'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as workspaceAPI from '@/lib/api/workspaces';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  selectWorkspace: (workspace: Workspace) => void;
  isLoading: boolean;
  error: string | null;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load workspaces on mount
  useEffect(() => {
    loadWorkspaces();
  }, []);

  // Load selected workspace from localStorage
  useEffect(() => {
    if (workspaces.length > 0) {
      const storedWorkspaceId = localStorage.getItem('selectedWorkspaceId');
      if (storedWorkspaceId) {
        const workspace = workspaces.find(w => w.id === storedWorkspaceId);
        if (workspace) {
          setSelectedWorkspace(workspace);
        } else {
          // If stored workspace not found, select first one
          setSelectedWorkspace(workspaces[0]);
          localStorage.setItem('selectedWorkspaceId', workspaces[0].id);
        }
      } else if (workspaces.length > 0) {
        // No stored workspace, select first one
        setSelectedWorkspace(workspaces[0]);
        localStorage.setItem('selectedWorkspaceId', workspaces[0].id);
      }
    }
  }, [workspaces]);

  const loadWorkspaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await workspaceAPI.getWorkspaces();
      setWorkspaces(data);
    } catch (err: any) {
      console.error('Failed to load workspaces:', err);
      setError(err.message || 'Failed to load workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  const selectWorkspace = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    localStorage.setItem('selectedWorkspaceId', workspace.id);
  };

  const refreshWorkspaces = async () => {
    await loadWorkspaces();
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        selectedWorkspace,
        selectWorkspace,
        isLoading,
        error,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
