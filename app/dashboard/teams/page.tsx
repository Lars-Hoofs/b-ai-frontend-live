'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  RiAddLine,
  RiTeamLine,
  RiUserLine,
  RiSettings3Line,
  RiMoreLine,
  RiDeleteBinLine,
  RiEditLine,
  RiUserAddLine,
} from '@remixicon/react';
import { CreateTeamModal } from '@/components/teams/CreateTeamModal';
import { EditTeamModal } from '@/components/teams/EditTeamModal';
import { ManageMembersModal } from '@/components/teams/ManageMembersModal';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import * as workspaceAPI from '@/lib/api/workspaces';
import type { Workspace } from '@/lib/api/workspaces';

// Helper to convert API workspace to display format
function workspaceToTeam(workspace: Workspace, userId: string) {
  // Find user's role in this workspace
  const userMember = workspace.members?.find(m => m.userId === userId);
  const role = userMember?.role.toLowerCase() as 'owner' | 'admin' | 'member';

  return {
    id: workspace.id,
    name: workspace.name,
    slug: workspace.slug,
    description: workspace.description || '',
    memberCount: workspace._count?.members || workspace.members?.length || 0,
    createdAt: workspace.createdAt,
    role: role || 'member',
  };
}

interface Team {
  id: string;
  name: string;
  slug: string;
  description: string;
  memberCount: number;
  createdAt: string;
  role: 'owner' | 'admin' | 'member';
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

export default function TeamsPage() {
  const { user } = useAuth();
  const { refreshWorkspaces } = useWorkspace();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [managingTeam, setManagingTeam] = useState<Team | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Load workspaces from API
  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const workspaces = await workspaceAPI.getWorkspaces();
      const teamsData = workspaces.map(ws => workspaceToTeam(ws, user?.id || ''));
      setTeams(teamsData);
    } catch (err: any) {
      console.error('Failed to load workspaces:', err);
      setError(err.message || 'Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuOpenId && menuRefs.current[menuOpenId]) {
        const menuElement = menuRefs.current[menuOpenId];
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setMenuOpenId(null);
        }
      }
    };

    if (menuOpenId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpenId]);

  const handleCreateTeam = async (data: { name: string; description: string; slug: string }) => {
    try {
      await workspaceAPI.createWorkspace({
        name: data.name,
        slug: data.slug,
        description: data.description,
      });
      
      setIsCreateModalOpen(false);
      
      // Refresh workspace context so it appears in topbar
      await refreshWorkspaces();
      
      // Reload teams from server to ensure consistency
      await loadWorkspaces();
    } catch (err: any) {
      console.error('Failed to create team:', err);
      alert(err.message || 'Failed to create team');
    }
  };

  const handleUpdateTeam = async (data: { name: string; description: string; slug?: string }) => {
    if (!editingTeam) return;
    
    try {
      const workspace = await workspaceAPI.updateWorkspace(editingTeam.id, {
        name: data.name,
        description: data.description,
        slug: data.slug,
      });
      
      const updatedTeam = workspaceToTeam(workspace, user?.id || '');
      setTeams(teams.map(t => t.id === editingTeam.id ? updatedTeam : t));
      setEditingTeam(null);
    } catch (err: any) {
      console.error('Failed to update team:', err);
      alert(err.message || 'Failed to update team');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Weet je zeker dat je dit team wilt verwijderen?')) return;
    
    try {
      await workspaceAPI.deleteWorkspace(teamId);
      setTeams(teams.filter(t => t.id !== teamId));
      setMenuOpenId(null);
      
      // Refresh workspace context so it's removed from topbar
      await refreshWorkspaces();
    } catch (err: any) {
      console.error('Failed to delete team:', err);
      alert(err.message || 'Failed to delete team');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Teams laden...</p>
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
              onClick={loadWorkspaces}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Probeer opnieuw
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Teams</h1>
            <p className="text-muted-foreground text-lg">
              Organiseer je werkruimte in teams en beheer toegang tot agents en workflows
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <RiAddLine size={20} />
            Nieuw Team
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">{teams.length}</div>
            <div className="text-sm text-muted-foreground">Totaal Teams</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {teams.reduce((acc, t) => acc + t.memberCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Totaal Members</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {teams.filter(t => t.role === 'owner').length}
            </div>
            <div className="text-sm text-muted-foreground">Teams als Owner</div>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {teams.map((team) => (
          <motion.div
            key={team.id}
            variants={itemVariants}
            className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
          >
            {/* Header met menu */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <RiTeamLine size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {team.name}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    team.role === 'owner' 
                      ? 'bg-primary/20 text-primary' 
                      : team.role === 'admin'
                      ? 'bg-accent/20 text-accent'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {team.role}
                  </span>
                </div>
              </div>

              {/* Menu */}
              <div className="relative" ref={(el) => menuRefs.current[team.id] = el}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === team.id ? null : team.id);
                  }}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <RiMoreLine size={20} className="text-muted-foreground" />
                </button>

                {menuOpenId === team.id && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-10"
                  >
                    <button
                      onClick={() => {
                        console.log('Edit button clicked, team:', team);
                        setEditingTeam(team);
                        setMenuOpenId(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                    >
                      <RiEditLine size={18} />
                      <span>Bewerken</span>
                    </button>
                    <button
                      onClick={() => {
                        setManagingTeam(team);
                        setMenuOpenId(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                    >
                      <RiUserAddLine size={18} />
                      <span>Members Beheren</span>
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpenId(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                    >
                      <RiSettings3Line size={18} />
                      <span>Instellingen</span>
                    </button>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => {
                        handleDeleteTeam(team.id);
                      }}
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
            <p className="text-muted-foreground mb-6 line-clamp-3">
              {team.description}
            </p>

            {/* Footer stats */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <RiUserLine size={18} />
                <span className="text-sm">{team.memberCount} members</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Aangemaakt {new Date(team.createdAt).toLocaleDateString('nl-NL')}
              </div>
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {teams.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
            <RiTeamLine size={48} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Nog geen teams</h3>
          <p className="text-muted-foreground mb-6">
            Maak je eerste team aan om te beginnen met samenwerken
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Maak je eerste team
          </button>
        </div>
      )}

      {/* Modals */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTeam}
      />

      {editingTeam && (
        <EditTeamModal
          isOpen={!!editingTeam}
          onClose={() => {
            console.log('Closing edit modal');
            setEditingTeam(null);
          }}
          onSubmit={handleUpdateTeam}
          team={editingTeam}
        />
      )}

      {/* Debug */}
      {editingTeam && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs z-[999]">
          Editing: {editingTeam.name}
        </div>
      )}

      {managingTeam && (
        <ManageMembersModal
          isOpen={!!managingTeam}
          onClose={() => setManagingTeam(null)}
          team={managingTeam}
        />
      )}
    </div>
  );
}
