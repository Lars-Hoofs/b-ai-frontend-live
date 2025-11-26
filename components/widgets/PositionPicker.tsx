'use client';

interface PositionPickerProps {
  value: string;
  onChange: (position: string) => void;
}

const POSITIONS = [
  { value: 'top-left', label: 'Linksboven', row: 0, col: 0 },
  { value: 'top-center', label: 'Middenboven', row: 0, col: 1 },
  { value: 'top-right', label: 'Rechtsboven', row: 0, col: 2 },
  { value: 'middle-left', label: 'Midden links', row: 1, col: 0 },
  { value: 'middle-center', label: 'Midden centrum', row: 1, col: 1 },
  { value: 'middle-right', label: 'Midden rechts', row: 1, col: 2 },
  { value: 'bottom-left', label: 'Linksonder', row: 2, col: 0 },
  { value: 'bottom-center', label: 'Middenonder', row: 2, col: 1 },
  { value: 'bottom-right', label: 'Rechtsonder', row: 2, col: 2 },
];

export function PositionPicker({ value, onChange }: PositionPickerProps) {
  const selectedPosition = POSITIONS.find(p => p.value === value) || POSITIONS[8]; // default bottom-right

  return (
    <div className="space-y-3">
      {/* Visual grid */}
      <div className="bg-muted/50 rounded-xl p-4 border border-border">
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {POSITIONS.map(pos => (
            <button
              key={pos.value}
              type="button"
              onClick={() => onChange(pos.value)}
              className={`
                aspect-square rounded-lg border-2 transition-all relative
                ${value === pos.value 
                  ? 'border-primary bg-primary/20 shadow-lg scale-105' 
                  : 'border-border bg-background hover:border-primary/50 hover:bg-muted'
                }
              `}
              title={pos.label}
            >
              <div className={`
                absolute w-3 h-3 rounded-full transition-all
                ${value === pos.value ? 'bg-primary' : 'bg-muted-foreground/30'}
                ${pos.row === 0 ? 'top-2' : pos.row === 1 ? 'top-1/2 -translate-y-1/2' : 'bottom-2'}
                ${pos.col === 0 ? 'left-2' : pos.col === 1 ? 'left-1/2 -translate-x-1/2' : 'right-2'}
              `} />
            </button>
          ))}
        </div>
      </div>

      {/* Selected label */}
      <div className="text-center">
        <span className="text-sm font-medium text-foreground">
          {selectedPosition.label}
        </span>
      </div>

      {/* Alternative: Dropdown for mobile/compact */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring lg:hidden"
      >
        {POSITIONS.map(pos => (
          <option key={pos.value} value={pos.value}>
            {pos.label}
          </option>
        ))}
      </select>
    </div>
  );
}
