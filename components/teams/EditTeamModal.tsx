'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { 
  RiEditLine, 
  RiUserAddLine,
  RiUserLine,
  RiShieldUserLine,
  RiVipCrownLine,
  RiDeleteBinLine,
} from '@remixicon/react';
import * as workspaceAPI from '@/lib/api/workspaces';
import type { WorkspaceMember } from '@/lib/api/workspaces';

interface Team {
  id: string;
  name: string;
  description: string;
  slug?: string;
}

interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
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
  };
}

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description: string }) => void;
  team: Team;
}

export function EditTeamModal({ isOpen, onClose, onSubmit, team }: EditTeamModalProps) {
  const [name, setName] = useState(team.name);
  const [slug, setSlug] = useState(team.slug || '');
  const [description, setDescription] = useState(team.description);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Members state
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Update form when team changes
  useEffect(() => {
    setName(team.name);
    setSlug(team.slug || '');
    setDescription(team.description);
  }, [team]);

  // Load members when modal opens
  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen, team.id]);

  const loadMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const apiMembers = await workspaceAPI.getWorkspaceMembers(team.id);
      setMembers(apiMembers.map(apiMemberToMember));
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      onSubmit({ 
        name: name.trim(), 
        description: description.trim(),
      });
    } finally {
      setIsSubmitting(false);
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
        return <RiVipCrownLine size={16} className="text-primary" />;
      case 'ADMIN':
        return <RiShieldUserLine size={16} className="text-accent" />;
      default:
        return <RiUserLine size={16} className="text-muted-foreground" />;
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
    <Modal isOpen={isOpen} onClose={onClose} title={`${team.name} Bewerken`} size="xl">
      <div className="grid grid-cols-3 gap-6">
        {/* Column 1: Edit Form */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <RiEditLine size={24} className="text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Team Details</h3>
              <p className="text-sm text-muted-foreground">Bewerk team informatie</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Team Name */}
            <div>
              <label htmlFor="edit-team-name" className="block text-sm font-medium text-foreground mb-2">
                Team Naam <span className="text-destructive">*</span>
              </label>
              <input
                id="edit-team-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Team naam"
                required
                maxLength={50}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm"
              />
              <div className="text-xs text-muted-foreground mt-1 text-right">
                {name.length}/50
              </div>
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="edit-team-slug" className="block text-sm font-medium text-foreground mb-2">
                URL Slug
              </label>
              <input
                id="edit-team-slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="team-slug"
                maxLength={50}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground font-mono text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim() || isSubmitting}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? 'Opslaan...' : 'Opslaan'}
            </button>
          </form>
        </div>

        {/* Column 2: Description */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <RiEditLine size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Beschrijving</h3>
              <p className="text-sm text-muted-foreground">Team doel & taken</p>
            </div>
          </div>

          <div>
            <label htmlFor="edit-team-description" className="block text-sm font-medium text-foreground mb-2">
              Beschrijving
            </label>
            <textarea
              id="edit-team-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Geef een beschrijving van het team..."
              rows={16}
              maxLength={500}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none text-sm"
            />
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {description.length}/500
            </div>
          </div>
        </div>

        {/* Column 3: Members Management */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <RiUserAddLine size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Team Members</h3>
              <p className="text-sm text-muted-foreground">{members.length} leden</p>
            </div>
          </div>

          {/* Invite Form */}
          <div className="bg-muted/30 border border-border rounded-lg p-3">
            {!showInviteForm ? (
              <button
                onClick={() => setShowInviteForm(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
              >
                <RiUserAddLine size={18} />
                Lid Uitnodigen
              </button>
            ) : (
              <form onSubmit={handleInvite} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Uitnodiging</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowInviteForm(false);
                      setInviteEmail('');
                      setInviteRole('MEMBER');
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Annuleer
                  </button>
                </div>

                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground text-sm"
                />

                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'ADMIN' | 'MEMBER')}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground text-sm"
                >
                  <option value="MEMBER">Lid</option>
                  <option value="ADMIN">Admin</option>
                </select>

                <button
                  type="submit"
                  disabled={!inviteEmail.trim() || isInviting}
                  className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isInviting ? 'Versturen...' : 'Verstuur'}
                </button>
              </form>
            )}
          </div>

          {/* Members List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {isLoadingMembers ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-muted-foreground">Laden...</p>
              </div>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="bg-card border border-border rounded-lg p-3 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-foreground truncate">{member.name}</h4>
                        {member.role === 'OWNER' && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/20 text-primary flex-shrink-0">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {getRoleIcon(member.role)}
                        <span className="text-xs text-muted-foreground">
                          {getRoleName(member.role)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {member.role !== 'OWNER' && (
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <select
                          value={member.role}
                          onChange={(e) => handleChangeRole(member, e.target.value as 'ADMIN' | 'MEMBER')}
                          className="px-2 py-1 bg-background border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="MEMBER">Lid</option>
                        </select>
                        <button
                          onClick={() => handleRemoveMember(member)}
                          className="px-2 py-1 rounded text-xs hover:bg-destructive/10 text-destructive transition-colors"
                          title="Verwijder"
                        >
                          Verwijder
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm"
        >
          Sluiten
        </button>
      </div>
    </Modal>
  );
}
