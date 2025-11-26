'use client';

import { useState, useMemo } from 'react';
import * as RemixIcons from '@remixicon/react';
import { RiSearchLine, RiCloseLine } from '@remixicon/react';

interface RemixiconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  size?: number;
}

// Populaire categorieën voor snelle toegang
const POPULAR_ICONS = [
  'RiChat1Line', 'RiMessage2Line', 'RiQuestionLine', 'RiCustomerService2Line',
  'RiRobot2Line', 'RiSparklingLine', 'RiMagicLine', 'RiLightbulbLine',
  'RiMailLine', 'RiPhoneLine', 'RiWhatsappLine', 'RiTelegramLine',
  'RiSearchLine', 'RiSettings3Line', 'RiInformationLine', 'RiAlertLine'
];

const CATEGORIES = {
  'Communicatie': ['RiChat', 'RiMessage', 'RiMail', 'RiPhone', 'RiWhatsapp', 'RiTelegram', 'RiCustomerService'],
  'AI & Tech': ['RiRobot', 'RiSparkling', 'RiMagic', 'RiCpu', 'RiBrain', 'RiAiGenerate'],
  'Utilities': ['RiSearch', 'RiSettings', 'RiTool', 'RiMenu', 'RiFilter'],
  'Status': ['RiInformation', 'RiAlert', 'RiError', 'RiCheckbox', 'RiClose'],
  'Media': ['RiImage', 'RiVideo', 'RiMusic', 'RiFile', 'RiDownload'],
  'Business': ['RiStore', 'RiShoppingCart', 'RiMoneyDollar', 'RiPieChart', 'RiBriefcase'],
  'Arrows': ['RiArrowRight', 'RiArrowLeft', 'RiArrowUp', 'RiArrowDown', 'RiArrowDropDown'],
  'Social': ['RiFacebook', 'RiTwitter', 'RiInstagram', 'RiLinkedin', 'RiGithub', 'RiYoutube']
};

export function RemixiconPicker({ value, onChange, size = 24 }: RemixiconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Haal alle Remixicon namen op
  const allIconNames = useMemo(() => {
    return Object.keys(RemixIcons).filter(name => 
      name.startsWith('Ri') && (name.endsWith('Line') || name.endsWith('Fill'))
    );
  }, []);

  // Filter icons op basis van zoekterm en categorie
  const filteredIcons = useMemo(() => {
    let icons = allIconNames;

    if (selectedCategory) {
      const categoryPatterns = CATEGORIES[selectedCategory as keyof typeof CATEGORIES];
      icons = icons.filter(name => 
        categoryPatterns.some(pattern => name.includes(pattern))
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      icons = icons.filter(name => 
        name.toLowerCase().includes(searchLower)
      );
    }

    // Limiteer tot 100 voor performance
    return icons.slice(0, 100);
  }, [allIconNames, search, selectedCategory]);

  const SelectedIcon = value && (RemixIcons as any)[value] 
    ? (RemixIcons as any)[value] 
    : RemixIcons.RiChat1Line;

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-background border border-input rounded-lg hover:bg-muted transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <SelectedIcon size={size} className="text-primary" />
          </div>
          <span className="text-sm font-mono text-muted-foreground">
            {value || 'Selecteer icon'}
          </span>
        </div>
        <RiSearchLine size={20} className="text-muted-foreground" />
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full mt-2 bg-background border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Kies een icon</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-muted rounded-lg transition-colors"
                >
                  <RiCloseLine size={20} />
                </button>
              </div>
              
              {/* Zoekbalk */}
              <div className="relative">
                <RiSearchLine 
                  size={18} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Zoek icons... (bijv. chat, mail, robot)"
                  className="w-full pl-10 pr-4 py-2 bg-muted border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
              </div>
            </div>

            {/* Categorieën */}
            {!search && (
              <div className="px-4 py-3 border-b border-border overflow-x-auto">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === null
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    Alle
                  </button>
                  {Object.keys(CATEGORIES).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Populaire icons (alleen als geen search/filter) */}
            {!search && !selectedCategory && (
              <div className="px-4 py-3 border-b border-border">
                <h4 className="text-xs font-semibold text-muted-foreground mb-2">POPULAIR</h4>
                <div className="grid grid-cols-8 gap-2">
                  {POPULAR_ICONS.map(iconName => {
                    const Icon = (RemixIcons as any)[iconName];
                    if (!Icon) return null;
                    return (
                      <button
                        key={iconName}
                        onClick={() => {
                          onChange(iconName);
                          setIsOpen(false);
                        }}
                        className={`p-3 rounded-lg hover:bg-muted transition-colors ${
                          value === iconName ? 'bg-primary/10 ring-2 ring-primary' : ''
                        }`}
                        title={iconName}
                      >
                        <Icon size={24} className={value === iconName ? 'text-primary' : 'text-foreground'} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Icon grid */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {filteredIcons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Geen icons gevonden voor "{search}"
                </div>
              ) : (
                <div className="grid grid-cols-8 gap-2">
                  {filteredIcons.map(iconName => {
                    const Icon = (RemixIcons as any)[iconName];
                    if (!Icon) return null;
                    return (
                      <button
                        key={iconName}
                        onClick={() => {
                          onChange(iconName);
                          setIsOpen(false);
                        }}
                        className={`p-3 rounded-lg hover:bg-muted transition-colors ${
                          value === iconName ? 'bg-primary/10 ring-2 ring-primary' : ''
                        }`}
                        title={iconName}
                      >
                        <Icon size={24} className={value === iconName ? 'text-primary' : 'text-foreground'} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
