'use client';

import {
  RiUserLine,
  RiTeamLine,
  RiRobotLine,
  RiMessage2Line,
} from '@remixicon/react';

interface StatsOverviewProps {
  stats: {
    users: { total: number; active: number };
    workspaces: number;
    agents: number;
    conversations: number;
    knowledgeBases: number;
    workflows: number;
    widgets: number;
  };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statItems = [
    {
      label: 'Total Users',
      value: stats.users.total,
      subtitle: `${stats.users.active} active`,
      icon: RiUserLine,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Workspaces',
      value: stats.workspaces,
      icon: RiTeamLine,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Agents',
      value: stats.agents,
      icon: RiRobotLine,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Conversations',
      value: stats.conversations,
      icon: RiMessage2Line,
      color: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Platform Overview
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon size={16} className={item.color} />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {item.value.toLocaleString()}
              </div>
              {item.subtitle && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {item.subtitle}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}