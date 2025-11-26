'use client';

import { RiFilterLine } from '@remixicon/react';

interface ConversationFiltersProps {
  filters: {
    status: string;
    assigned: string;
    priority: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function ConversationFilters({ filters, onFiltersChange }: ConversationFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <RiFilterLine size={18} className="text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Filters</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        >
          <option value="open">Open (Active & Waiting)</option>
          <option value="all">Alle openstaande</option>
          <option value="active">Actief</option>
          <option value="waiting">Aan het wachten</option>
          <option value="resolved">Opgelost</option>
        </select>

        {/* Assignment Filter */}
        <select
          value={filters.assigned}
          onChange={(e) => handleFilterChange('assigned', e.target.value)}
          className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        >
          <option value="all">Alle</option>
          <option value="assigned">Assigned</option>
          <option value="unassigned">Unassigned</option>
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
          className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        >
          <option value="all">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
  );
}
