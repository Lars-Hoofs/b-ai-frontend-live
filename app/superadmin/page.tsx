'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';
import { superadminAPI } from '@/lib/superadmin-api';
import { UserManagement } from '@/components/superadmin/UserManagement';
import { ResourceViewer } from '@/components/superadmin/ResourceViewer';
import { StatsOverview } from '@/components/superadmin/StatsOverview';
import {
  RiDashboardLine,
  RiUserLine,
  RiTeamLine,
  RiRobotLine,
  RiBookLine,
  RiNodeTree,
  RiApps2Line,
  RiMessage2Line,
} from '@remixicon/react';

type ResourceType = 'users' | 'workspaces' | 'agents' | 'knowledge-bases' | 'workflows' | 'widgets' | 'conversations';

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

export default function SuperadminDashboard() {
  const router = useRouter();
  const [selectedResource, setSelectedResource] = useState<ResourceType>('users');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        setAuthError('Not authenticated');
        router.push('/auth/signin');
        return;
      }
      
      if (user.role !== 'admin') {
        setAuthError('Superadmin access required');
        return;
      }
      
      setIsAuthenticated(true);
      loadStats();
    } catch (error: any) {
      setAuthError(error.message || 'Authentication failed');
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await superadminAPI.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigationItems = [
    { id: 'users', label: 'Users', icon: RiUserLine },
    { id: 'workspaces', label: 'Workspaces', icon: RiTeamLine },
    { id: 'agents', label: 'Agents', icon: RiRobotLine },
    { id: 'knowledge-bases', label: 'Knowledge Bases', icon: RiBookLine },
    { id: 'workflows', label: 'Workflows', icon: RiNodeTree },
    { id: 'widgets', label: 'Widgets', icon: RiApps2Line },
    { id: 'conversations', label: 'Conversations', icon: RiMessage2Line },
  ] as const;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          {authError ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
                Access Denied
              </h2>
              <p className="text-red-600 dark:text-red-400 mb-4">{authError}</p>
              <button
                onClick={() => router.push('/auth/signin')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Sign In
              </button>
            </div>
          ) : (
            <div>
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Checking authentication...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading Superadmin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RiDashboardLine size={32} className="text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Superadmin Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage all platform resources and users
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-80px)]">
          <div className="p-4">
            {/* Stats Overview */}
            {stats && <StatsOverview stats={stats} />}
            
            {/* Navigation */}
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Resources
              </h3>
              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = selectedResource === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedResource(item.id as ResourceType);
                        setSelectedUser(null);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {selectedUser ? (
            <UserManagement
              user={selectedUser}
              onBack={() => setSelectedUser(null)}
              onUserUpdated={loadStats}
            />
          ) : (
            <ResourceViewer
              resourceType={selectedResource}
              onUserSelect={(user) => setSelectedUser(user)}
            />
          )}
        </div>
      </div>
    </div>
  );
}