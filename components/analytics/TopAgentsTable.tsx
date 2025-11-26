'use client';

import { RiTrophyLine, RiMedalLine, RiAwardLine } from '@remixicon/react';

interface Agent {
  id: string;
  name: string;
  conversationsHandled: number;
  avgResponseTime: string;
  satisfactionRate: number;
}

interface TopAgentsTableProps {
  agents?: Agent[] | null;
}

export function TopAgentsTable({ agents }: TopAgentsTableProps) {
  if (!agents || agents.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Top Performing Agents</h3>
        <div className="h-64 flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  const getMedalIcon = (index: number) => {
    if (index === 0) return <RiTrophyLine size={20} className="text-yellow-500" />;
    if (index === 1) return <RiMedalLine size={20} className="text-gray-400" />;
    if (index === 2) return <RiAwardLine size={20} className="text-orange-500" />;
    return <span className="text-sm font-medium text-muted-foreground w-5 text-center">{index + 1}</span>;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Top Performing Agents</h3>
      <div className="space-y-3">
        {agents.slice(0, 5).map((agent, index) => (
          <div
            key={agent.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-center w-8">
              {getMedalIcon(index)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{agent.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">
                  {agent.conversationsHandled} conversations
                </span>
                <span className="text-xs text-muted-foreground">
                  {agent.avgResponseTime} avg response
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{agent.satisfactionRate}%</p>
                <p className="text-xs text-muted-foreground">satisfaction</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
