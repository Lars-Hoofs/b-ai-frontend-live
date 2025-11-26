'use client';

import { useState, useEffect } from 'react';
import * as workspaceAPI from '@/lib/api/workspaces';
import type { WorkspaceMember } from '@/lib/api/workspaces';
import { userAPI } from '@/lib/api';
import { 
  RiCloseLine, 
  RiUserLine, 
  RiShieldUserLine,
  RiVipCrownLine,
  RiCheckLine,
  RiStarLine,
} from '@remixicon/react';

interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  currentUserId: string | null;
  onAssign: (userId: string) => Promise<void>;
}

interface TeamMember {
  userId: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  isCurrentUser: boolean;
}

export function AssignModal({ 
  isOpen, 
  onClose, 
  workspaceId, 
  currentUserId,
  onAssign 
}: AssignModalProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMembers();
    }
  }, [isOpen, workspaceId]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const apiMembers = await workspaceAPI.getWorkspaceMembers(workspaceId);
      
      // Transform and sort: current user first, then by role
      const transformed = apiMembers.map((m: WorkspaceMember) => ({
        userId: m.userId,
        name: m.user.name || m.user.email.split('@')[0],
        email: m.user.email,
        role: m.role,
        isCurrentUser: m.userId === currentUserId,
      }));

      // Sort: current user first, then owners, admins, members
      transformed.sort((a, b) => {
        if (a.isCurrentUser) return -1;
        if (b.isCurrentUser) return 1;
        
        const roleOrder = { OWNER: 0, ADMIN: 1, MEMBER: 2 };
        return roleOrder[a.role] - roleOrder[b.role];
      });

      setMembers(transformed);
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async (userId: string) => {
    try {
      setIsAssigning(true);
      await onAssign(userId);
      onClose();
    } catch (err) {
      console.error('Failed to assign conversation:', err);
    } finally {
      setIsAssigning(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toUpperCase()) {
      case 'OWNER':
        return <RiVipCrownLine size={18} className="text-yellow-500" />;
      case 'ADMIN':
        return <RiShieldUserLine size={18} className="text-blue-500" />;
      default:
        return <RiUserLine size={18} className="text-muted-foreground" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role.toUpperCase()) {
      case 'OWNER':
        return 'Owner';
      case 'ADMIN':
        return 'Admin';
      default:
        return 'Member';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-xl font-bold text-foreground">
            Wijs conversatie toe
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            disabled={isAssigning}
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <RiUserLine size={48} className="text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">Geen teammembers gevonden</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <button
                  key={member.userId}
                  onClick={() => handleAssign(member.userId)}
                  disabled={isAssigning}
                  className="w-full flex items-center gap-4 p-4 bg-background hover:bg-muted border border-border rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <RiUserLine size={24} className="text-primary" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground truncate">
                        {member.name}
                      </h4>
                      {member.isCurrentUser && (
                        <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded-full font-medium flex items-center gap-1">
                          <RiStarLine size={12} />
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg flex-shrink-0">
                    {getRoleIcon(member.role)}
                    <span className="text-xs font-medium text-foreground">
                      {getRoleLabel(member.role)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            disabled={isAssigning}
            className="w-full px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
