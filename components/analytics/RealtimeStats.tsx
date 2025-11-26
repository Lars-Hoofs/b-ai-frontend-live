'use client';

import { RiMessage2Line, RiUserLine, RiTimeLine, RiFlashlightLine } from '@remixicon/react';

interface RealtimeStatsProps {
  stats: {
    activeConversations?: number;
    onlineAgents?: number;
    avgWaitTime?: string;
    activeUsers?: number;
  } | null;
}

export function RealtimeStats({ stats }: RealtimeStatsProps) {
  if (!stats) {
    return null;
  }

  const items = [
    {
      label: 'Active Conversations',
      value: stats.activeConversations || 0,
      icon: RiMessage2Line,
      color: 'bg-blue-500',
    },
    {
      label: 'Online Agents',
      value: stats.onlineAgents || 0,
      icon: RiUserLine,
      color: 'bg-green-500',
    },
    {
      label: 'Avg Wait Time',
      value: stats.avgWaitTime || '0s',
      icon: RiTimeLine,
      color: 'bg-orange-500',
    },
    {
      label: 'Active Users',
      value: stats.activeUsers || 0,
      icon: RiFlashlightLine,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Real-time Stats
        </h3>
        <span className="text-xs text-muted-foreground">Updates every 10s</span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`${item.color} p-3 rounded-lg`}>
                <Icon size={20} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
