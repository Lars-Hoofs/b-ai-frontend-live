'use client';

import { useState } from 'react';
import { superadminAPI } from '@/lib/superadmin-api';
import {
  RiArrowLeftLine,
  RiUserLine,
  RiShieldCheckLine,
  RiShieldLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSaveLine,
  RiCloseLine,
  RiTeamLine,
  RiMessage2Line,
  RiCalendarLine,
  RiAlertLine,
} from '@remixicon/react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  banReason?: string;
  createdAt: string;
  lastSeenAt: string;
  ownedWorkspaces: any[];
  workspaceMemberships: any[];
  _count: {
    assignedConversations: number;
    messages: number;
  };
}

interface UserManagementProps {
  user: User;
  onBack: () => void;
  onUserUpdated: () => void;
}

export function UserManagement({ user, onBack, onUserUpdated }: UserManagementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'user',
    banned: user.banned || false,
    banReason: user.banReason || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await superadminAPI.updateUser(user.id, editForm);
      setIsEditing(false);
      onUserUpdated();
    } catch (error: any) {
      alert('Failed to update user: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await superadminAPI.deleteUser(user.id);
      onBack();
      onUserUpdated();
    } catch (error: any) {
      alert('Failed to delete user: ' + error.message);
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <RiArrowLeftLine size={20} />
          Back to Users
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* User Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <RiUserLine size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.name || 'Unknown User'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    {user.role === 'admin' ? (
                      <RiShieldCheckLine size={16} className="text-purple-600 dark:text-purple-400" />
                    ) : (
                      <RiShieldLine size={16} className="text-gray-600 dark:text-gray-400" />
                    )}
                    <span className={`text-sm font-medium ${
                      user.role === 'admin' 
                        ? 'text-purple-600 dark:text-purple-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                  {user.banned && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      <RiCloseLine size={12} />
                      Banned
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <RiEditLine size={16} />
                    Edit User
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <RiDeleteBinLine size={16} />
                    Delete User
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    <RiSaveLine size={16} />
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        name: user.name || '',
                        email: user.email || '',
                        role: user.role || 'user',
                        banned: user.banned || false,
                        banReason: user.banReason || '',
                      });
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <RiCloseLine size={16} />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.banned}
                      onChange={(e) => setEditForm({ ...editForm, banned: e.target.checked })}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ban User
                    </span>
                  </label>
                </div>
              </div>

              {editForm.banned && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ban Reason
                  </label>
                  <textarea
                    value={editForm.banReason}
                    onChange={(e) => setEditForm({ ...editForm, banReason: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Reason for banning this user..."
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Account Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Account Information
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      User ID
                    </label>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">
                      {user.id}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Created
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <RiCalendarLine size={14} />
                      {formatDate(user.createdAt)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Last Seen
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <RiCalendarLine size={14} />
                      {formatDate(user.lastSeenAt)}
                    </p>
                  </div>

                  {user.banned && user.banReason && (
                    <div>
                      <label className="text-sm font-medium text-red-500">
                        Ban Reason
                      </label>
                      <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        {user.banReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Workspace Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <RiTeamLine size={20} />
                  Workspaces
                </h3>

                <div className="space-y-3">
                  {user.ownedWorkspaces?.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                        Owned Workspaces ({user.ownedWorkspaces.length})
                      </label>
                      <div className="space-y-1">
                        {user.ownedWorkspaces.slice(0, 3).map((workspace: any) => (
                          <div key={workspace.id} className="text-sm text-gray-900 dark:text-white bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                            {workspace.name}
                          </div>
                        ))}
                        {user.ownedWorkspaces.length > 3 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            +{user.ownedWorkspaces.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {user.workspaceMemberships?.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
                        Member of ({user.workspaceMemberships.length})
                      </label>
                      <div className="space-y-1">
                        {user.workspaceMemberships.slice(0, 3).map((membership: any) => (
                          <div key={membership.workspace.id} className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded">
                            {membership.workspace.name}
                          </div>
                        ))}
                        {user.workspaceMemberships.length > 3 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            +{user.workspaceMemberships.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {(!user.ownedWorkspaces || user.ownedWorkspaces.length === 0) &&
                   (!user.workspaceMemberships || user.workspaceMemberships.length === 0) && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No workspace associations
                    </p>
                  )}
                </div>
              </div>

              {/* Activity Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <RiMessage2Line size={20} />
                  Activity
                </h3>

                <div className="space-y-3">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user._count?.assignedConversations || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Assigned Conversations
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {user._count?.messages || 0}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Messages Sent
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <RiAlertLine size={24} className="text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete User Account
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>{user.name || user.email}</strong>? 
              This action cannot be undone. The user will be soft-deleted and banned.
            </p>

            {user.ownedWorkspaces && user.ownedWorkspaces.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  <strong>Warning:</strong> This user owns {user.ownedWorkspaces.length} workspace(s). 
                  Transfer ownership before deletion.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading || (user.ownedWorkspaces && user.ownedWorkspaces.length > 0)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}