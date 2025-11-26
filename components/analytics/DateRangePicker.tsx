'use client';

import { RiCalendarLine } from '@remixicon/react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (range: { startDate: string; endDate: string }) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-2">
      <RiCalendarLine size={18} className="text-muted-foreground ml-1" />
      <input
        type="date"
        value={startDate}
        onChange={(e) => onChange({ startDate: e.target.value, endDate })}
        className="px-2 py-1 text-sm bg-transparent border-none focus:outline-none text-foreground"
      />
      <span className="text-muted-foreground">-</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onChange({ startDate, endDate: e.target.value })}
        className="px-2 py-1 text-sm bg-transparent border-none focus:outline-none text-foreground"
      />
    </div>
  );
}
