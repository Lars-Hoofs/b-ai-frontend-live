'use client';

import { 
  RiMessage2Line, 
  RiTimeLine, 
  RiStarLine, 
  RiCheckLine,
  RiArrowUpLine,
  RiArrowDownLine
} from '@remixicon/react';

interface Metric {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: any;
  color: string;
}

interface MetricsCardsProps {
  metrics?: {
    totalConversations?: number;
    avgResponseTime?: string;
    satisfactionRate?: number;
    resolutionRate?: number;
    conversationsChange?: number;
    responseTimeChange?: number;
    satisfactionChange?: number;
    resolutionChange?: number;
  } | null;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  if (!metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-4"></div>
            <div className="h-8 bg-muted rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards: Metric[] = [
    {
      label: 'Total Conversations',
      value: metrics.totalConversations || 0,
      change: metrics.conversationsChange,
      changeLabel: 'vs last period',
      icon: RiMessage2Line,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Avg Response Time',
      value: metrics.avgResponseTime || 'N/A',
      change: metrics.responseTimeChange,
      changeLabel: 'vs last period',
      icon: RiTimeLine,
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      label: 'Satisfaction Rate',
      value: `${metrics.satisfactionRate || 0}%`,
      change: metrics.satisfactionChange,
      changeLabel: 'vs last period',
      icon: RiStarLine,
      color: 'text-yellow-600 dark:text-yellow-400',
    },
    {
      label: 'Resolution Rate',
      value: `${metrics.resolutionRate || 0}%`,
      change: metrics.resolutionChange,
      changeLabel: 'vs last period',
      icon: RiCheckLine,
      color: 'text-green-600 dark:text-green-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const hasPositiveChange = card.change !== undefined && card.change > 0;
        const hasNegativeChange = card.change !== undefined && card.change < 0;

        return (
          <div
            key={card.label}
            className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <Icon size={24} className={card.color} />
              {card.change !== undefined && (
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    hasPositiveChange
                      ? 'text-green-600 dark:text-green-400'
                      : hasNegativeChange
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-muted-foreground'
                  }`}
                >
                  {hasPositiveChange && <RiArrowUpLine size={14} />}
                  {hasNegativeChange && <RiArrowDownLine size={14} />}
                  {Math.abs(card.change)}%
                </div>
              )}
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground mb-1">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              {card.changeLabel && (
                <p className="text-xs text-muted-foreground mt-1">{card.changeLabel}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
