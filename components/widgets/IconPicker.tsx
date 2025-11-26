'use client';

import { useState } from 'react';
import * as RemixIcons from '@remixicon/react';

// Popular icons for chat widgets
const POPULAR_ICONS = [
  'RiChat1Line',
  'RiChat3Line',
  'RiMessage2Line',
  'RiQuestionLine',
  'RiCustomerService2Line',
  'RiRobotLine',
  'RiSparklingLine',
  'RiLightbulbLine',
  'RiHeartLine',
  'RiThumbUpLine',
  'RiMailLine',
  'RiPhoneLine',
  'RiInformationLine',
  'RiWechatLine',
  'RiWhatsappLine',
];

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const allIcons = Object.keys(RemixIcons).filter(name => 
    name.startsWith('Ri') && !name.includes('Provider')
  );

  const filteredIcons = search 
    ? allIcons.filter(name => name.toLowerCase().includes(search.toLowerCase()))
    : POPULAR_ICONS;

  const IconComponent = value && (RemixIcons as any)[value];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground flex items-center justify-between hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-2">
          {IconComponent && <IconComponent size={20} />}
          <span className="text-sm">{value || 'Selecteer icon'}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 mt-2 w-full bg-popover border border-border rounded-lg shadow-lg max-h-96 overflow-hidden">
            <div className="p-3 border-b border-border">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Zoek icon..."
                className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
              />
            </div>
            <div className="p-2 overflow-y-auto max-h-80 grid grid-cols-4 gap-2">
              {filteredIcons.slice(0, 48).map(iconName => {
                const Icon = (RemixIcons as any)[iconName];
                if (!Icon) return null;
                
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      onChange(iconName);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`p-3 rounded-lg hover:bg-muted transition-colors flex items-center justify-center ${
                      value === iconName ? 'bg-primary/10 ring-2 ring-primary' : ''
                    }`}
                    title={iconName}
                  >
                    <Icon size={24} />
                  </button>
                );
              })}
            </div>
            {filteredIcons.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                Geen icons gevonden
              </div>
            )}
            {!search && (
              <div className="p-3 border-t border-border text-xs text-muted-foreground text-center">
                Populaire icons - typ om meer te zoeken
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
