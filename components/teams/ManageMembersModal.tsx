'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import * as workspaceAPI from '@/lib/api/workspaces';
import type { WorkspaceMember } from '@/lib/api/workspaces';
import { 
  RiUserAddLine, 
  RiUserLine, 
  RiShieldUserLine,
  RiVipCrownLine,
  RiDeleteBinLine,
  RiMailLine,
  RiCheckLine,
} from '@remixicon/react';

interface Team {
  id: string;
  name: string;
}

interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
  avatar?: string;
}

// Helper to convert API member to display format
function apiMemberToMember(apiMember: WorkspaceMember): Member {
  return {
    id: apiMember.id,
    userId: apiMember.userId,
    name: apiMember.user.name || apiMember.user.email.split('@')[0],
    email: apiMember.user.email,
    role: apiMember.role,
    joinedAt: apiMember.joinedAt,
    avatar: apiMember.user.image || undefined,
  };
}

interface ManageMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
}

export function ManageMembersModal({ isOpen, onClose, team }: ManageMembersModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Load members when modal opens
  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen, team.id]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const apiMembers = await workspaceAPI.getWorkspaceMembers(team.id);
      setMembers(apiMembers.map(apiMemberToMember));
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      await workspaceAPI.inviteMember(team.id, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
      
      alert(`Uitnodiging verstuurd naar ${inviteEmail}`);
      
      setInviteEmail('');
      setInviteRole('MEMBER');
      setShowInviteForm(false);
      
      // Refresh members list
      await loadMembers();
    } catch (err: any) {
      console.error('Failed to invite member:', err);
      alert(err.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleChangeRole = async (member: Member, newRole: 'ADMIN' | 'MEMBER') => {
    try {
      await workspaceAPI.updateMemberRole(team.id, member.userId, newRole);
      setMembers(members.map(m => 
        m.id === member.id ? { ...m, role: newRole } : m
      ));
    } catch (err: any) {
      console.error('Failed to update member role:', err);
      alert(err.message || 'Failed to update role');
    }
  };

  const handleRemoveMember = async (member: Member) => {
    if (!confirm('Weet je zeker dat je dit lid wilt verwijderen?')) return;
    
    try {
      await workspaceAPI.removeMember(team.id, member.userId);
      setMembers(members.filter(m => m.id !== member.id));
    } catch (err: any) {
      console.error('Failed to remove member:', err);
      alert(err.message || 'Failed to remove member');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toUpperCase()) {
      case 'OWNER':
        return <RiVipCrownLine size={18} className="text-primary" />;
      case 'ADMIN':
        return <RiShieldUserLine size={18} className="text-accent" />;
      default:
        return <RiUserLine size={18} className="text-muted-foreground" />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role.toUpperCase()) {
      case 'OWNER':
        return 'Eigenaar';
      case 'ADMIN':
        return 'Admin';
      default:
        return 'Lid';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Members beheren - ${team.name}`} size="lg">
      <div className="space-y-6">
        {/* Invite Section */}
        <div className="bg-muted/30 border border-border rounded-xl p-6">
          {!showInviteForm ? (
            <button
              onClick={() => setShowInviteForm(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <RiUserAddLine size={20} />
              Nodig iemand uit
            </button>
          ) : (
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Nieuwe uitnodiging</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteEmail('');
                    setInviteRole('member');
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Annuleren
                </button>
              </div>

              <div>
                <label htmlFor="invite-email" className="block text-sm font-medium text-foreground mb-2">
                  Email adres
                </label>
                <input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="naam@bedrijf.nl"
                  required
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label htmlFor="invite-role" className="block text-sm font-medium text-foreground mb-2">
                  Rol
                </label>
                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'ADMIN' | 'MEMBER')}
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                >
                  <option value="MEMBER">Lid - Kan agents en workflows gebruiken</option>
                  <option value="ADMIN">Admin - Kan leden beheren en instellingen wijzigen</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!inviteEmail.trim() || isInviting}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isInviting ? 'Uitnodiging versturen...' : 'Verstuur Uitnodiging'}
              </button>
            </form>
          )}
        </div>

        {/* Members List */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Team Members ({members.length})
          </h3>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Laden...</p>
            </div>
          ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-semibold text-primary">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{member.name}</h4>
                        {member.role === 'OWNER' && (
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getRoleIcon(member.role)}
                        <span className="text-xs text-muted-foreground">
                          {getRoleName(member.role)} • Lid sinds {new Date(member.joinedAt).toLocaleDateString('nl-NL')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {member.role !== 'OWNER' && (
                    <div className="flex items-center gap-2">
                      {/* Role Change */}
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeRole(member, e.target.value as 'ADMIN' | 'MEMBER')}
                        className="px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="MEMBER">Lid</option>
                      </select>

                      {/* Remove */}
                      <button
                        onClick={() => handleRemoveMember(member)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                        title="Verwijderen"
                      >
                        <RiDeleteBinLine size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-muted/30 border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Tip:</strong> Members kunnen agents en workflows binnen dit team gebruiken. 
            Admins kunnen ook nieuwe members uitnodigen en team instellingen wijzigen.
          </p>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Sluiten
          </button>
        </div>
      </div>
    </Modal>
  );
}
