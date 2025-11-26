'use client';

import { useState, useEffect } from 'react';
import { superadminAPI } from '@/lib/superadmin-api';
import {
  RiUserLine,
  RiTeamLine,
  RiRobotLine,
  RiBookLine,
  RiFlowChart,
  RiApps2Line,
  RiMessage2Line,
  RiEyeLine,
  RiMoreLine,
  RiCheckLine,
  RiCloseLine,
  RiAlertLine,
} from '@remixicon/react';

type ResourceType = 'users' | 'workspaces' | 'agents' | 'knowledge-bases' | 'workflows' | 'widgets' | 'conversations';

interface ResourceViewerProps {
  resourceType: ResourceType;
  onUserSelect: (user: any) => void;
}

export function ResourceViewer({ resourceType, onUserSelect }: ResourceViewerProps) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [resourceType]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let result;
      switch (resourceType) {
        case 'users':
          result = await superadminAPI.getUsers();
          break;
        case 'workspaces':
          result = await superadminAPI.getWorkspaces();
          break;
        case 'agents':
          result = await superadminAPI.getAgents();
          break;
        case 'knowledge-bases':
          result = await superadminAPI.getKnowledgeBases();
          break;
        case 'workflows':
          result = await superadminAPI.getWorkflows();
          break;
        case 'widgets':
          result = await superadminAPI.getWidgets();
          break;
        case 'conversations':
          result = await superadminAPI.getConversations();
          break;
        default:
          result = [];
      }
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getResourceIcon = () => {
    const icons = {
      users: RiUserLine,
      workspaces: RiTeamLine,
      agents: RiRobotLine,
      'knowledge-bases': RiBookLine,
      workflows: RiFlowChart,
      widgets: RiApps2Line,
      conversations: RiMessage2Line,
    };
    return icons[resourceType];
  };

  const getResourceTitle = () => {
    const titles = {
      users: 'Platform Users',
      workspaces: 'Workspaces',
      agents: 'AI Agents',
      'knowledge-bases': 'Knowledge Bases',
      workflows: 'Workflows',
      widgets: 'Chat Widgets',
      conversations: 'Conversations',
    };
    return titles[resourceType];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const Icon = getResourceIcon();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading {getResourceTitle()}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RiAlertLine size={48} className="text-red-500 mx-auto mb-4" />
            <p className="text-red-600 dark:text-red-400 mb-2">Error loading {getResourceTitle()}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
            <button
              onClick={loadData}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Icon size={24} className="text-gray-700 dark:text-gray-300" />
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {getResourceTitle()}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {data.length} {resourceType} found
          </p>
        </div>
      </div>

      {/* Content */}
      {data.length === 0 ? (
        <div className="text-center py-12">
          <Icon size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No {resourceType} found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {resourceType === 'users' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Workspaces
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </>
                  )}

                  {resourceType === 'workspaces' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Workspace
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Resources
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Members
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                    </>
                  )}

                  {resourceType === 'agents' && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Workspace
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Model
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Usage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </>
                  )}

                  {(resourceType === 'knowledge-bases' || resourceType === 'workflows' || resourceType === 'widgets' || resourceType === 'conversations') && (
                    <>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Workspace
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Created
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {resourceType === 'users' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.name || 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {item.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.banned ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              <RiCloseLine size={14} />
                              Banned
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <RiCheckLine size={14} />
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {item.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.ownedWorkspaces?.length || 0} owned, {item.workspaceMemberships?.length || 0} member
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item._count?.assignedConversations || 0} conversations
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => onUserSelect(item)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <RiEyeLine size={14} />
                            Manage
                          </button>
                        </td>
                      </>
                    )}

                    {resourceType === 'workspaces' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              /{item.slug}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {item.owner?.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.owner?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item._count?.agents} agents, {item._count?.widgets} widgets
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.members?.length || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(item.createdAt)}
                        </td>
                      </>
                    )}

                    {resourceType === 'agents' && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {item.description || 'No description'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {item.workspace?.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.workspace?.owner?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.aiModel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item._count?.widgets} widgets, {item._count?.conversations} conversations
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {item.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <RiCheckLine size={14} />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                              <RiCloseLine size={14} />
                              Inactive
                            </span>
                          )}
                        </td>
                      </>
                    )}

                    {(resourceType === 'knowledge-bases' || resourceType === 'workflows' || resourceType === 'widgets' || resourceType === 'conversations') && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.name || item.id?.slice(0, 8) || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {item.workspace?.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.workspace?.owner?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {resourceType === 'knowledge-bases' && `${item._count?.documents || 0} docs`}
                          {resourceType === 'workflows' && `${item._count?.nodes || 0} nodes`}
                          {resourceType === 'widgets' && `${item._count?.conversations || 0} conversations`}
                          {resourceType === 'conversations' && `${item._count?.messages || 0} messages`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(item.createdAt)}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}