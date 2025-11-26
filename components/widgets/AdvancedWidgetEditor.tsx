'use client';

import { useState } from 'react';
import { RemixiconPicker } from './RemixiconPicker';
import { PositionPicker } from './PositionPicker';
import { 
  RiLayoutLine, 
  RiPaletteLine, 
  RiSettings3Line, 
  RiCodeLine,
  RiCheckboxCircleLine
} from '@remixicon/react';

export interface WidgetConfig {
  // Basic
  name: string;
  widgetType: 'bubble' | 'searchbar' | 'custom-box';
  
  // Layout
  position: string;
  width?: number;
  height?: number;
  offsetX?: number;
  offsetY?: number;
  
  // Advanced Layout
  layoutMode?: 'fixed' | 'percentage' | 'full-height' | 'full-width' | 'custom';
  widthPercentage?: number;
  heightPercentage?: number;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  
  // Bubble/Icon
  bubbleIcon?: string;
  bubbleText?: string;
  bubbleShape: 'circle' | 'square' | 'rounded-square';
  bubbleSize: 'small' | 'medium' | 'large' | 'custom';
  bubbleWidth?: number;
  bubbleHeight?: number;
  bubbleImageUrl?: string;
  bubbleImageFit?: 'cover' | 'contain' | 'fill';
  bubbleShadow?: string;
  
  // Animation System
  enableAnimation?: boolean;
  animationType?: 'slide' | 'fade' | 'scale' | 'bounce' | 'flip';
  animationDirection?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  animationDuration?: number; // in ms
  animationDelay?: number; // in ms
  hoverAnimation?: 'lift' | 'grow' | 'pulse' | 'rotate' | 'none';
  
  // Icon/Image Relationship
  imageIconRelation?: 'cover' | 'overlay' | 'grow-from' | 'side-by-side';
  imagePosition?: 'top' | 'bottom' | 'left' | 'right' | 'background';
  imageFullHeight?: boolean;
  
  // Colors
  bubbleBackgroundColor: string;
  bubbleTextColor: string;
  bubbleIconColor?: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  userMessageColor: string;
  userMessageTextColor?: string;
  botMessageColor: string;
  botMessageTextColor?: string;
  borderColor?: string;
  
  // Bubble Hover States
  bubbleHoverBackgroundColor?: string;
  bubbleHoverTextColor?: string;
  bubbleHoverIconColor?: string;
  bubbleHoverScale?: number;
  
  // Header Close Button
  headerCloseIcon?: string;
  headerCloseIconColor?: string;
  headerCloseIconHoverColor?: string;
  headerCloseIconBackgroundColor?: string;
  headerCloseIconHoverBackgroundColor?: string;
  onlineStatusColor?: string;
  avatarBackgroundColor?: string;
  
  // Input Styling
  inputBorderColor?: string;
  inputFocusBorderColor?: string;
  inputBackgroundColor?: string;
  inputTextColor?: string;
  inputPlaceholderColor?: string;
  
  // Send Button
  sendButtonIcon?: string;
  sendButtonBackgroundColor?: string;
  sendButtonIconColor?: string;
  sendButtonHoverBackgroundColor?: string;
  sendButtonHoverIconColor?: string;
  
  // Advanced Styling
  backgroundGradient?: { from: string; to: string; direction: string };
  backdropBlur?: number;
  borderWidth?: number;
  shadowIntensity?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  glassEffect?: boolean;
  
  // Chat Window
  chatWidth: number;
  chatHeight: number;
  chatBorderRadius: number;
  messageBorderRadius: number;
  chatAnimation?: 'slide-up' | 'slide-down' | 'fade' | 'scale' | 'none';
  chatOffsetX?: number;
  chatOffsetY?: number;
  
  // Behavior
  greeting?: string;
  placeholder: string;
  autoOpen?: boolean;
  autoOpenDelay?: number;
  
  // AI-Only Mode & Availability
  aiOnlyMode?: boolean;
  aiOnlyMessage?: { [lang: string]: string };
  workingHours?: {
    [day: string]: { enabled: boolean; start: string; end: string };
  };
  holidays?: Array<{ date: string; name: string; recurring?: boolean }>;
  
  // Advanced
  customCss?: string;
  zIndex?: number;
  showBranding?: boolean;
}

interface AdvancedWidgetEditorProps {
  config: WidgetConfig;
  onChange: (config: WidgetConfig) => void;
}

type TabType = 'layout' | 'styling' | 'animations' | 'behavior' | 'advanced';

export function AdvancedWidgetEditor({ config, onChange }: AdvancedWidgetEditorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('layout');

  const updateConfig = (updates: Partial<WidgetConfig>) => {
    onChange({ ...config, ...updates });
  };

  const tabs = [
    { id: 'layout' as TabType, label: 'Layout', icon: RiLayoutLine },
    { id: 'styling' as TabType, label: 'Styling', icon: RiPaletteLine },
    { id: 'animations' as TabType, label: 'Animaties', icon: RiCheckboxCircleLine },
    { id: 'behavior' as TabType, label: 'Gedrag', icon: RiSettings3Line },
    { id: 'advanced' as TabType, label: 'Geavanceerd', icon: RiCodeLine },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'layout' && (
          <LayoutTab config={config} updateConfig={updateConfig} />
        )}
        {activeTab === 'styling' && (
          <StylingTab config={config} updateConfig={updateConfig} />
        )}
        {activeTab === 'animations' && (
          <AnimationsTab config={config} updateConfig={updateConfig} />
        )}
        {activeTab === 'behavior' && (
          <BehaviorTab config={config} updateConfig={updateConfig} />
        )}
        {activeTab === 'advanced' && (
          <AdvancedTab config={config} updateConfig={updateConfig} />
        )}
      </div>
    </div>
  );
}

// Layout Tab
function LayoutTab({ config, updateConfig }: { config: WidgetConfig; updateConfig: (u: Partial<WidgetConfig>) => void }) {
  return (
    <div className="space-y-6">
      {/* Widget Type */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Widget Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'bubble', label: 'Chat Bubble', desc: 'Classic floating chat button' },
            { value: 'searchbar', label: 'Zoekbalk', desc: 'Input bar with icon' },
            { value: 'custom-box', label: 'Custom Box', desc: 'Fully customizable' },
          ].map(type => (
            <button
              key={type.value}
              type="button"
              onClick={() => updateConfig({ widgetType: type.value as any })}
              className={`
                p-4 rounded-lg border-2 text-left transition-all
                ${config.widgetType === type.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              <div className="font-semibold text-sm mb-1">{type.label}</div>
              <div className="text-xs text-muted-foreground">{type.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Position Picker */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Positie op Scherm
        </label>
        <PositionPicker
          value={config.position}
          onChange={(position) => updateConfig({ position })}
        />
      </div>

      {/* Offset Controls */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Horizontale Offset (px)
          </label>
          <input
            type="number"
            value={config.offsetX || 0}
            onChange={(e) => updateConfig({ offsetX: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-background border border-input rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Verticale Offset (px)
          </label>
          <input
            type="number"
            value={config.offsetY || 0}
            onChange={(e) => updateConfig({ offsetY: parseInt(e.target.value) })}
            className="w-full px-4 py-2 bg-background border border-input rounded-lg"
          />
        </div>
      </div>

      {/* Layout Mode */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Layout Modus
        </label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {[
            { value: 'fixed', label: 'Vast', desc: 'Vaste pixels' },
            { value: 'percentage', label: 'Percentage', desc: 'Relatief' },
            { value: 'full-height', label: 'Volle Hoogte', desc: '100vh' },
            { value: 'full-width', label: 'Volle Breedte', desc: '100vw' },
            { value: 'custom', label: 'Custom', desc: 'Eigen CSS' },
          ].map(mode => (
            <button
              key={mode.value}
              type="button"
              onClick={() => updateConfig({ layoutMode: mode.value as any })}
              className={`
                p-3 rounded-lg border-2 text-left transition-all
                ${(config.layoutMode || 'fixed') === mode.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
                }
              `}
            >
              <div className="font-semibold text-xs mb-0.5">{mode.label}</div>
              <div className="text-[10px] text-muted-foreground">{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Conditional Size Controls based on Layout Mode */}
      {config.layoutMode === 'percentage' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Breedte (%)
            </label>
            <input
              type="number"
              value={config.widthPercentage || 80}
              onChange={(e) => updateConfig({ widthPercentage: parseInt(e.target.value) })}
              min={10}
              max={100}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Hoogte (%)
            </label>
            <input
              type="number"
              value={config.heightPercentage || 80}
              onChange={(e) => updateConfig({ heightPercentage: parseInt(e.target.value) })}
              min={10}
              max={100}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Min/Max Constraints */}
      {(config.layoutMode === 'percentage' || config.layoutMode === 'full-height' || config.layoutMode === 'full-width') && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Beperkingen (optioneel)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Min Breedte (px)</label>
              <input
                type="number"
                value={config.minWidth || ''}
                onChange={(e) => updateConfig({ minWidth: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Geen"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Max Breedte (px)</label>
              <input
                type="number"
                value={config.maxWidth || ''}
                onChange={(e) => updateConfig({ maxWidth: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Geen"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Min Hoogte (px)</label>
              <input
                type="number"
                value={config.minHeight || ''}
                onChange={(e) => updateConfig({ minHeight: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Geen"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Max Hoogte (px)</label>
              <input
                type="number"
                value={config.maxHeight || ''}
                onChange={(e) => updateConfig({ maxHeight: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Geen"
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bubble Shape & Size */}
      {config.widgetType === 'bubble' && (
        <>
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Vorm
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'circle', label: '● Cirkel' },
                { value: 'square', label: '■ Vierkant' },
                { value: 'rounded-square', label: '▢ Afgerond' },
              ].map(shape => (
                <button
                  key={shape.value}
                  type="button"
                  onClick={() => updateConfig({ bubbleShape: shape.value as any })}
                  className={`
                    py-3 rounded-lg border-2 font-medium text-sm transition-all
                    ${config.bubbleShape === shape.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  {shape.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Grootte
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: 'small', label: 'Klein', size: '48px' },
                { value: 'medium', label: 'Normaal', size: '64px' },
                { value: 'large', label: 'Groot', size: '80px' },
                { value: 'custom', label: 'Custom', size: '?' },
              ].map(size => (
                <button
                  key={size.value}
                  type="button"
                  onClick={() => updateConfig({ bubbleSize: size.value as any })}
                  className={`
                    py-3 rounded-lg border-2 text-sm transition-all
                    ${config.bubbleSize === size.value
                      ? 'border-primary bg-primary/5 font-semibold'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div>{size.label}</div>
                  <div className="text-xs text-muted-foreground">{size.size}</div>
                </button>
              ))}
            </div>
          </div>

          {config.bubbleSize === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Breedte (px)
                </label>
                <input
                  type="number"
                  value={config.bubbleWidth || 64}
                  onChange={(e) => updateConfig({ bubbleWidth: parseInt(e.target.value) })}
                  min={40}
                  max={200}
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Hoogte (px)
                </label>
                <input
                  type="number"
                  value={config.bubbleHeight || 64}
                  onChange={(e) => updateConfig({ bubbleHeight: parseInt(e.target.value) })}
                  min={40}
                  max={200}
                  className="w-full px-4 py-2 bg-background border border-input rounded-lg"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Chat Window Dimensions */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Chat Venster Afmetingen
        </label>
        
        {/* Show hint based on layout mode */}
        {config.layoutMode === 'full-height' && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              ℹ️ <strong>Volle Hoogte Mode:</strong> Alleen breedte wordt gebruikt, hoogte is automatisch 100%
            </p>
          </div>
        )}
        
        {config.layoutMode === 'full-width' && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              ℹ️ <strong>Volle Breedte Mode:</strong> Alleen hoogte wordt gebruikt, breedte is automatisch 100%
            </p>
          </div>
        )}
        
        {config.layoutMode === 'percentage' && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              ℹ️ <strong>Percentage Mode:</strong> Deze waardes worden gebruikt als max constraints
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className={config.layoutMode === 'full-width' ? 'opacity-50' : ''}>
            <label className="block text-xs text-muted-foreground mb-2">
              Breedte (px)
              {config.layoutMode === 'full-width' && <span className="ml-1 text-blue-500">• Niet gebruikt</span>}
            </label>
            <input
              type="number"
              value={config.chatWidth}
              onChange={(e) => updateConfig({ chatWidth: parseInt(e.target.value) })}
              min={300}
              max={800}
              disabled={config.layoutMode === 'full-width'}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div className={config.layoutMode === 'full-height' ? 'opacity-50' : ''}>
            <label className="block text-xs text-muted-foreground mb-2">
              Hoogte (px)
              {config.layoutMode === 'full-height' && <span className="ml-1 text-blue-500">• Niet gebruikt</span>}
            </label>
            <input
              type="number"
              value={config.chatHeight}
              onChange={(e) => updateConfig({ chatHeight: parseInt(e.target.value) })}
              min={400}
              max={900}
              disabled={config.layoutMode === 'full-height'}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Chat Window Offset */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Chat Venster Positie Offset
        </label>
        <p className="text-sm text-muted-foreground mb-3">
          Pas de positie van het chat venster aan met extra offset in pixels.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-2">
              Horizontale Offset (px)
            </label>
            <input
              type="number"
              value={config.chatOffsetX || 0}
              onChange={(e) => updateConfig({ chatOffsetX: parseInt(e.target.value) })}
              placeholder="0"
              min={-500}
              max={500}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Negatief = links, Positief = rechts
            </p>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-2">
              Verticale Offset (px)
            </label>
            <input
              type="number"
              value={config.chatOffsetY || 0}
              onChange={(e) => updateConfig({ chatOffsetY: parseInt(e.target.value) })}
              placeholder="0"
              min={-500}
              max={500}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Negatief = omhoog, Positief = omlaag
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Styling Tab
function StylingTab({ config, updateConfig }: { config: WidgetConfig; updateConfig: (u: Partial<WidgetConfig>) => void }) {
  const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>
      <div className="flex gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-16 h-10 rounded-lg cursor-pointer border border-input"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2 bg-background border border-input rounded-lg font-mono text-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Icon Picker */}
      {config.widgetType === 'bubble' && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Icon
          </label>
          <RemixiconPicker
            value={config.bubbleIcon || 'RiChat1Line'}
            onChange={(bubbleIcon) => updateConfig({ bubbleIcon })}
          />
        </div>
      )}

      {/* Bubble Text */}
      {(config.widgetType === 'bubble' || config.widgetType === 'custom-box') && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tekst op Widget <span className="text-xs text-muted-foreground">(optioneel)</span>
          </label>
          <input
            type="text"
            value={config.bubbleText || ''}
            onChange={(e) => updateConfig({ bubbleText: e.target.value })}
            placeholder="Bijv. 'Help nodig?' of 'Chat met ons'"
            maxLength={20}
            className="w-full px-4 py-2 bg-background border border-input rounded-lg"
          />
        </div>
      )}

      {/* Image Upload */}
      {(config.widgetType === 'bubble' || config.widgetType === 'custom-box') && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Afbeelding <span className="text-xs text-muted-foreground">(optioneel)</span>
          </label>
          <input
            type="url"
            value={config.bubbleImageUrl || ''}
            onChange={(e) => updateConfig({ bubbleImageUrl: e.target.value })}
            placeholder="https://voorbeeld.nl/afbeelding.jpg"
            className="w-full px-4 py-2 bg-background border border-input rounded-lg"
          />
          {config.bubbleImageUrl && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-2">Afbeelding Fit</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'cover', label: 'Cover' },
                    { value: 'contain', label: 'Contain' },
                    { value: 'fill', label: 'Fill' },
                  ].map(fit => (
                    <button
                      key={fit.value}
                      type="button"
                      onClick={() => updateConfig({ bubbleImageFit: fit.value as any })}
                      className={`
                        py-2 px-3 rounded-lg border-2 text-sm transition-all
                        ${(config.bubbleImageFit || 'cover') === fit.value
                          ? 'border-primary bg-primary/5 font-semibold'
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                    >
                      {fit.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-2">Relatie met Icon</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'cover', label: 'Bedek Icon', desc: 'Afbeelding vervangt icon' },
                    { value: 'overlay', label: 'Overlay', desc: 'Over icon heen' },
                    { value: 'grow-from', label: 'Groei vanuit', desc: 'Groeit vanuit icon' },
                    { value: 'side-by-side', label: 'Naast Elkaar', desc: 'Icon + afbeelding' },
                  ].map(relation => (
                    <button
                      key={relation.value}
                      type="button"
                      onClick={() => updateConfig({ imageIconRelation: relation.value as any })}
                      className={`
                        p-3 rounded-lg border-2 text-left transition-all
                        ${(config.imageIconRelation || 'cover') === relation.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                    >
                      <div className="font-semibold text-xs mb-0.5">{relation.label}</div>
                      <div className="text-[10px] text-muted-foreground">{relation.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-2">Afbeelding Positie</label>
                <div className="grid grid-cols-5 gap-2">
                  {['top', 'bottom', 'left', 'right', 'background'].map(pos => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => updateConfig({ imagePosition: pos as any })}
                      className={`
                        py-2 px-2 rounded-lg border-2 text-xs transition-all capitalize
                        ${(config.imagePosition || 'background') === pos
                          ? 'border-primary bg-primary/5 font-semibold'
                          : 'border-border hover:border-primary/50'
                        }
                      `}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <input
                  type="checkbox"
                  id="imageFullHeight"
                  checked={config.imageFullHeight || false}
                  onChange={(e) => updateConfig({ imageFullHeight: e.target.checked })}
                />
                <label htmlFor="imageFullHeight" className="text-sm font-medium cursor-pointer">
                  Volle Hoogte Afbeelding
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bubble Colors */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Widget Kleuren</h3>
        <ColorInput
          label="Achtergrondkleur"
          value={config.bubbleBackgroundColor}
          onChange={(bubbleBackgroundColor) => updateConfig({ bubbleBackgroundColor })}
        />
        <ColorInput
          label="Tekstkleur"
          value={config.bubbleTextColor}
          onChange={(bubbleTextColor) => updateConfig({ bubbleTextColor })}
        />
        <ColorInput
          label="Icon Kleur"
          value={config.bubbleIconColor || config.bubbleTextColor}
          onChange={(bubbleIconColor) => updateConfig({ bubbleIconColor })}
        />
      </div>
      
      {/* Bubble Hover States */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Widget Hover Effecten <span className="text-xs text-muted-foreground">(optioneel)</span></h3>
        <div className="grid grid-cols-2 gap-4">
          <ColorInput
            label="Hover Achtergrond"
            value={config.bubbleHoverBackgroundColor || ''}
            onChange={(bubbleHoverBackgroundColor) => updateConfig({ bubbleHoverBackgroundColor })}
          />
          <ColorInput
            label="Hover Tekst"
            value={config.bubbleHoverTextColor || ''}
            onChange={(bubbleHoverTextColor) => updateConfig({ bubbleHoverTextColor })}
          />
          <ColorInput
            label="Hover Icon"
            value={config.bubbleHoverIconColor || ''}
            onChange={(bubbleHoverIconColor) => updateConfig({ bubbleHoverIconColor })}
          />
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Hover Schaal</label>
            <input
              type="number"
              step="0.05"
              min="0.8"
              max="1.5"
              value={config.bubbleHoverScale || 1.05}
              onChange={(e) => updateConfig({ bubbleHoverScale: parseFloat(e.target.value) })}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Header Colors */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Header Kleuren</h3>
        <ColorInput
          label="Header Achtergrond"
          value={config.headerBackgroundColor}
          onChange={(headerBackgroundColor) => updateConfig({ headerBackgroundColor })}
        />
        <ColorInput
          label="Header Tekst"
          value={config.headerTextColor}
          onChange={(headerTextColor) => updateConfig({ headerTextColor })}
        />
        <div className="grid grid-cols-2 gap-4">
          <ColorInput
            label="Online Status"
            value={config.onlineStatusColor || '#22c55e'}
            onChange={(onlineStatusColor) => updateConfig({ onlineStatusColor })}
          />
          <ColorInput
            label="Avatar Achtergrond"
            value={config.avatarBackgroundColor || ''}
            onChange={(avatarBackgroundColor) => updateConfig({ avatarBackgroundColor })}
          />
        </div>
      </div>
      
      {/* Close Button Customization */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Sluitknop <span className="text-xs text-muted-foreground">(optioneel)</span></h3>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Sluitknop Icon</label>
          <RemixiconPicker
            value={config.headerCloseIcon || 'RiCloseLine'}
            onChange={(headerCloseIcon) => updateConfig({ headerCloseIcon })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ColorInput
            label="Icon Kleur"
            value={config.headerCloseIconColor || config.headerTextColor}
            onChange={(headerCloseIconColor) => updateConfig({ headerCloseIconColor })}
          />
          <ColorInput
            label="Hover Icon Kleur"
            value={config.headerCloseIconHoverColor || ''}
            onChange={(headerCloseIconHoverColor) => updateConfig({ headerCloseIconHoverColor })}
          />
          <ColorInput
            label="Achtergrond"
            value={config.headerCloseIconBackgroundColor || ''}
            onChange={(headerCloseIconBackgroundColor) => updateConfig({ headerCloseIconBackgroundColor })}
          />
          <ColorInput
            label="Hover Achtergrond"
            value={config.headerCloseIconHoverBackgroundColor || ''}
            onChange={(headerCloseIconHoverBackgroundColor) => updateConfig({ headerCloseIconHoverBackgroundColor })}
          />
        </div>
      </div>

      {/* Message Colors */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Bericht Kleuren</h3>
        <div className="grid grid-cols-2 gap-4">
          <ColorInput
            label="Gebruiker Achtergrond"
            value={config.userMessageColor}
            onChange={(userMessageColor) => updateConfig({ userMessageColor })}
          />
          <ColorInput
            label="Gebruiker Tekst"
            value={config.userMessageTextColor || '#ffffff'}
            onChange={(userMessageTextColor) => updateConfig({ userMessageTextColor })}
          />
          <ColorInput
            label="Bot Achtergrond"
            value={config.botMessageColor}
            onChange={(botMessageColor) => updateConfig({ botMessageColor })}
          />
          <ColorInput
            label="Bot Tekst"
            value={config.botMessageTextColor || config.messageTextColor}
            onChange={(botMessageTextColor) => updateConfig({ botMessageTextColor })}
          />
        </div>
      </div>
      
      {/* Input Field Styling */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Input Veld Styling</h3>
        <div className="grid grid-cols-2 gap-4">
          <ColorInput
            label="Border Kleur"
            value={config.inputBorderColor || '#e5e7eb'}
            onChange={(inputBorderColor) => updateConfig({ inputBorderColor })}
          />
          <ColorInput
            label="Focus Border"
            value={config.inputFocusBorderColor || config.headerBackgroundColor}
            onChange={(inputFocusBorderColor) => updateConfig({ inputFocusBorderColor })}
          />
          <ColorInput
            label="Achtergrond"
            value={config.inputBackgroundColor || '#ffffff'}
            onChange={(inputBackgroundColor) => updateConfig({ inputBackgroundColor })}
          />
          <ColorInput
            label="Tekst Kleur"
            value={config.inputTextColor || '#1f2937'}
            onChange={(inputTextColor) => updateConfig({ inputTextColor })}
          />
        </div>
        <ColorInput
          label="Placeholder Kleur"
          value={config.inputPlaceholderColor || ''}
          onChange={(inputPlaceholderColor) => updateConfig({ inputPlaceholderColor })}
        />
      </div>
      
      {/* Send Button Customization */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Verzendknop</h3>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Verzendknop Icon</label>
          <RemixiconPicker
            value={config.sendButtonIcon || 'RiSendPlaneLine'}
            onChange={(sendButtonIcon) => updateConfig({ sendButtonIcon })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <ColorInput
            label="Achtergrond"
            value={config.sendButtonBackgroundColor || config.headerBackgroundColor}
            onChange={(sendButtonBackgroundColor) => updateConfig({ sendButtonBackgroundColor })}
          />
          <ColorInput
            label="Icon Kleur"
            value={config.sendButtonIconColor || '#ffffff'}
            onChange={(sendButtonIconColor) => updateConfig({ sendButtonIconColor })}
          />
          <ColorInput
            label="Hover Achtergrond"
            value={config.sendButtonHoverBackgroundColor || ''}
            onChange={(sendButtonHoverBackgroundColor) => updateConfig({ sendButtonHoverBackgroundColor })}
          />
          <ColorInput
            label="Hover Icon"
            value={config.sendButtonHoverIconColor || ''}
            onChange={(sendButtonHoverIconColor) => updateConfig({ sendButtonHoverIconColor })}
          />
        </div>
      </div>

      {/* Border Radius */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Afronding</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-muted-foreground mb-2">Chat Venster (px)</label>
            <input
              type="range"
              min={0}
              max={50}
              value={config.chatBorderRadius}
              onChange={(e) => updateConfig({ chatBorderRadius: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-center text-sm font-medium mt-1">{config.chatBorderRadius}px</div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-2">Berichten (px)</label>
            <input
              type="range"
              min={0}
              max={50}
              value={config.messageBorderRadius}
              onChange={(e) => updateConfig({ messageBorderRadius: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-center text-sm font-medium mt-1">{config.messageBorderRadius}px</div>
          </div>
        </div>
      </div>

      {/* Advanced Styling */}
      <div className="space-y-4">
        <h3 className="font-semibold text-foreground">Geavanceerd</h3>
        
        {/* Shadow Intensity */}
        <div>
          <label className="block text-xs text-muted-foreground mb-2">Schaduw Intensiteit</label>
          <div className="grid grid-cols-5 gap-2">
            {[
              { value: 'none', label: 'Geen' },
              { value: 'sm', label: 'Klein' },
              { value: 'md', label: 'Normaal' },
              { value: 'lg', label: 'Groot' },
              { value: 'xl', label: 'Extra' },
            ].map(shadow => (
              <button
                key={shadow.value}
                type="button"
                onClick={() => updateConfig({ shadowIntensity: shadow.value as any })}
                className={`
                  py-2 rounded-lg border-2 text-xs transition-all
                  ${(config.shadowIntensity || 'md') === shadow.value
                    ? 'border-primary bg-primary/5 font-semibold'
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                {shadow.label}
              </button>
            ))}
          </div>
        </div>

        {/* Border Width */}
        <div>
          <label className="block text-xs text-muted-foreground mb-2">Rand Dikte (px)</label>
          <input
            type="range"
            min={0}
            max={10}
            value={config.borderWidth || 0}
            onChange={(e) => updateConfig({ borderWidth: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-center text-sm font-medium mt-1">{config.borderWidth || 0}px</div>
        </div>

        {/* Backdrop Blur */}
        <div>
          <label className="block text-xs text-muted-foreground mb-2">Achtergrond Blur (px)</label>
          <input
            type="range"
            min={0}
            max={40}
            value={config.backdropBlur || 0}
            onChange={(e) => updateConfig({ backdropBlur: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="text-center text-sm font-medium mt-1">{config.backdropBlur || 0}px</div>
        </div>

        {/* Glass Effect */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <input
            type="checkbox"
            id="glassEffect"
            checked={config.glassEffect || false}
            onChange={(e) => updateConfig({ glassEffect: e.target.checked })}
          />
          <div className="flex-1">
            <label htmlFor="glassEffect" className="block text-sm font-medium cursor-pointer">
              Glasmorfisme Effect
            </label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Frosted glass look met achtergrond blur
            </p>
          </div>
        </div>

        {/* Gradient Background */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Achtergrond Gradient <span className="text-xs text-muted-foreground">(optioneel)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <ColorInput
              label="Van"
              value={config.backgroundGradient?.from || config.bubbleBackgroundColor}
              onChange={(from) => updateConfig({ 
                backgroundGradient: { 
                  from, 
                  to: config.backgroundGradient?.to || config.bubbleBackgroundColor,
                  direction: config.backgroundGradient?.direction || 'to-br'
                } 
              })}
            />
            <ColorInput
              label="Naar"
              value={config.backgroundGradient?.to || config.bubbleBackgroundColor}
              onChange={(to) => updateConfig({ 
                backgroundGradient: { 
                  from: config.backgroundGradient?.from || config.bubbleBackgroundColor,
                  to,
                  direction: config.backgroundGradient?.direction || 'to-br'
                } 
              })}
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-2">Richting</label>
            <select
              value={config.backgroundGradient?.direction || 'to-br'}
              onChange={(e) => updateConfig({ 
                backgroundGradient: {
                  from: config.backgroundGradient?.from || config.bubbleBackgroundColor,
                  to: config.backgroundGradient?.to || config.bubbleBackgroundColor,
                  direction: e.target.value
                }
              })}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg text-sm"
            >
              <option value="to-t">Naar Boven</option>
              <option value="to-tr">Naar Rechtsboven</option>
              <option value="to-r">Naar Rechts</option>
              <option value="to-br">Naar Rechtsonder</option>
              <option value="to-b">Naar Onder</option>
              <option value="to-bl">Naar Linksonder</option>
              <option value="to-l">Naar Links</option>
              <option value="to-tl">Naar Linksboven</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// Animations Tab
function AnimationsTab({ config, updateConfig }: { config: WidgetConfig; updateConfig: (u: Partial<WidgetConfig>) => void }) {
  return (
    <div className="space-y-6">
      {/* Enable Animations */}
      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
        <input
          type="checkbox"
          id="enableAnimation"
          checked={config.enableAnimation ?? true}
          onChange={(e) => updateConfig({ enableAnimation: e.target.checked })}
          className="mt-1"
        />
        <div className="flex-1">
          <label htmlFor="enableAnimation" className="block font-medium text-foreground cursor-pointer">
            Animaties Inschakelen ✨
          </label>
          <p className="text-sm text-muted-foreground mt-1">
            Geef je widget leven met vloeiende animaties
          </p>
        </div>
      </div>

      {config.enableAnimation !== false && (
        <>
          {/* Animation Type */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Animatie Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { value: 'slide', label: 'Slide', icon: '→', desc: 'Schuift in' },
                { value: 'fade', label: 'Fade', icon: '◐', desc: 'Fade in/out' },
                { value: 'scale', label: 'Scale', icon: '⊕', desc: 'Groeit/krimpt' },
                { value: 'bounce', label: 'Bounce', icon: '⤒', desc: 'Springt op' },
                { value: 'flip', label: 'Flip', icon: '⟲', desc: 'Draait om' },
              ].map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => updateConfig({ animationType: type.value as any })}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${(config.animationType || 'slide') === type.value
                      ? 'border-primary bg-primary/10 scale-105'
                      : 'border-border hover:border-primary/50 hover:scale-105'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="font-semibold text-sm">{type.label}</div>
                  <div className="text-xs text-muted-foreground">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Animation Direction */}
          {(config.animationType === 'slide' || config.animationType === 'flip') && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Animatie Richting
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { value: 'top', label: 'Van Boven', icon: '↓' },
                  { value: 'bottom', label: 'Van Onder', icon: '↑' },
                  { value: 'left', label: 'Van Links', icon: '→' },
                  { value: 'right', label: 'Van Rechts', icon: '←' },
                  { value: 'center', label: 'Vanuit Centrum', icon: '⊕' },
                ].map(dir => (
                  <button
                    key={dir.value}
                    type="button"
                    onClick={() => updateConfig({ animationDirection: dir.value as any })}
                    className={`
                      p-3 rounded-lg border-2 text-center transition-all
                      ${(config.animationDirection || 'bottom') === dir.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <div className="text-xl mb-1">{dir.icon}</div>
                    <div className="font-medium text-xs">{dir.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Animation Timing */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Timing & Snelheid</h3>
            
            <div>
              <label className="block text-xs text-muted-foreground mb-2">
                Duur (ms)
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="range"
                  min={100}
                  max={2000}
                  step={50}
                  value={config.animationDuration || 500}
                  onChange={(e) => updateConfig({ animationDuration: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <div className="text-sm font-medium w-20 text-right">{config.animationDuration || 500}ms</div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Snel</span>
                <span>Langzaam</span>
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2">
                Vertraging (ms)
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="range"
                  min={0}
                  max={2000}
                  step={50}
                  value={config.animationDelay || 0}
                  onChange={(e) => updateConfig({ animationDelay: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <div className="text-sm font-medium w-20 text-right">{config.animationDelay || 0}ms</div>
              </div>
            </div>
          </div>

          {/* Hover Animation */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Hover Animatie
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { value: 'none', label: 'Geen', icon: '○' },
                { value: 'lift', label: 'Lift', icon: '↟' },
                { value: 'grow', label: 'Grow', icon: '⊕' },
                { value: 'pulse', label: 'Pulse', icon: '◉' },
                { value: 'rotate', label: 'Rotate', icon: '↻' },
              ].map(hover => (
                <button
                  key={hover.value}
                  type="button"
                  onClick={() => updateConfig({ hoverAnimation: hover.value as any })}
                  className={`
                    p-3 rounded-lg border-2 text-center transition-all
                    ${(config.hoverAnimation || 'lift') === hover.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className="text-xl mb-1">{hover.icon}</div>
                  <div className="font-medium text-xs">{hover.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window Animation */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Chat Venster Animatie
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { value: 'none', label: 'Geen', desc: 'Direct tonen' },
                { value: 'slide-up', label: 'Slide Up', desc: 'Van onder' },
                { value: 'slide-down', label: 'Slide Down', desc: 'Van boven' },
                { value: 'fade', label: 'Fade', desc: 'Fade in' },
                { value: 'scale', label: 'Scale', desc: 'Zoom in' },
              ].map(anim => (
                <button
                  key={anim.value}
                  type="button"
                  onClick={() => updateConfig({ chatAnimation: anim.value as any })}
                  className={`
                    p-3 rounded-lg border-2 text-left transition-all
                    ${(config.chatAnimation || 'slide-up') === anim.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                >
                  <div className="font-semibold text-xs mb-0.5">{anim.label}</div>
                  <div className="text-[10px] text-muted-foreground">{anim.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Note */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-foreground">
              💡 <strong>Tip:</strong> Test je animaties op de live preview om te zien hoe ze er uit zien!
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// Behavior Tab
function BehaviorTab({ config, updateConfig }: { config: WidgetConfig; updateConfig: (u: Partial<WidgetConfig>) => void }) {
  const [selectedDay, setSelectedDay] = useState<string>('monday');
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels: { [key: string]: string } = {
    monday: 'Maandag',
    tuesday: 'Dinsdag',
    wednesday: 'Woensdag',
    thursday: 'Donderdag',
    friday: 'Vrijdag',
    saturday: 'Zaterdag',
    sunday: 'Zondag',
  };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Begroeting
        </label>
        <textarea
          value={config.greeting || ''}
          onChange={(e) => updateConfig({ greeting: e.target.value })}
          placeholder="Hoi! Hoe kan ik je helpen?"
          rows={3}
          maxLength={500}
          className="w-full px-4 py-3 bg-background border border-input rounded-lg resize-none"
        />
      </div>

      {/* Placeholder */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Input Placeholder
        </label>
        <input
          type="text"
          value={config.placeholder}
          onChange={(e) => updateConfig({ placeholder: e.target.value })}
          placeholder="Type je bericht..."
          maxLength={100}
          className="w-full px-4 py-2 bg-background border border-input rounded-lg"
        />
      </div>

      {/* AI-Only Mode */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
          <input
            type="checkbox"
            id="aiOnlyMode"
            checked={config.aiOnlyMode || false}
            onChange={(e) => updateConfig({ aiOnlyMode: e.target.checked })}
            className="mt-1"
          />
          <div className="flex-1">
            <label htmlFor="aiOnlyMode" className="block font-medium text-foreground cursor-pointer">
              AI-Only Modus
            </label>
            <p className="text-sm text-muted-foreground mt-1">
              Bezoekers kunnen niet doorverbonden worden naar een medewerker
            </p>
          </div>
        </div>

        {config.aiOnlyMode && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Bericht bij verzoek om medewerker (Nederlands)
            </label>
            <textarea
              value={config.aiOnlyMessage?.nl || ''}
              onChange={(e) => updateConfig({ 
                aiOnlyMessage: { ...config.aiOnlyMessage, nl: e.target.value } 
              })}
              placeholder="Sorry, op het moment zijn er geen medewerkers beschikbaar."
              rows={2}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg resize-none"
            />
          </div>
        )}
      </div>

      {/* Working Hours */}
      <div className="space-y-3">
        <h3 className="font-semibold text-foreground">Werktijden</h3>
        <div className="grid grid-cols-7 gap-1">
          {daysOfWeek.map((day) => {
            const isEnabled = config.workingHours?.[day]?.enabled || false;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`py-2 text-xs rounded-lg font-medium transition-all ${
                  selectedDay === day
                    ? 'bg-primary text-white'
                    : isEnabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {dayLabels[day].slice(0, 2)}
              </button>
            );
          })}
        </div>

        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id={`enabled-${selectedDay}`}
              checked={config.workingHours?.[selectedDay]?.enabled || false}
              onChange={(e) => {
                const newWorkingHours = { ...config.workingHours };
                if (!newWorkingHours[selectedDay]) {
                  newWorkingHours[selectedDay] = { enabled: false, start: '09:00', end: '17:00' };
                }
                newWorkingHours[selectedDay].enabled = e.target.checked;
                updateConfig({ workingHours: newWorkingHours });
              }}
            />
            <label htmlFor={`enabled-${selectedDay}`} className="font-medium text-foreground cursor-pointer">
              {dayLabels[selectedDay]} beschikbaar
            </label>
          </div>

          {config.workingHours?.[selectedDay]?.enabled && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Start tijd</label>
                <input
                  type="time"
                  value={config.workingHours[selectedDay].start || '09:00'}
                  onChange={(e) => {
                    const newWorkingHours = { ...config.workingHours };
                    newWorkingHours[selectedDay].start = e.target.value;
                    updateConfig({ workingHours: newWorkingHours });
                  }}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Eind tijd</label>
                <input
                  type="time"
                  value={config.workingHours[selectedDay].end || '17:00'}
                  onChange={(e) => {
                    const newWorkingHours = { ...config.workingHours };
                    newWorkingHours[selectedDay].end = e.target.value;
                    updateConfig({ workingHours: newWorkingHours });
                  }}
                  className="w-full px-3 py-2 bg-background border border-input rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Holidays */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Feestdagen</h3>
          <button
            type="button"
            onClick={() => {
              const newHolidays = [...(config.holidays || [])];
              newHolidays.push({ date: new Date().toISOString().split('T')[0], name: '', recurring: false });
              updateConfig({ holidays: newHolidays });
            }}
            className="text-sm text-primary hover:underline"
          >
            + Feestdag toevoegen
          </button>
        </div>

        {config.holidays && config.holidays.length > 0 && (
          <div className="space-y-2">
            {config.holidays.map((holiday, index) => (
              <div key={index} className="flex gap-2 p-3 bg-muted/50 rounded-lg">
                <input
                  type="date"
                  value={holiday.date}
                  onChange={(e) => {
                    const newHolidays = [...(config.holidays || [])];
                    newHolidays[index].date = e.target.value;
                    updateConfig({ holidays: newHolidays });
                  }}
                  className="px-3 py-2 bg-background border border-input rounded-lg"
                />
                <input
                  type="text"
                  value={holiday.name}
                  onChange={(e) => {
                    const newHolidays = [...(config.holidays || [])];
                    newHolidays[index].name = e.target.value;
                    updateConfig({ holidays: newHolidays });
                  }}
                  placeholder="Naam feestdag"
                  className="flex-1 px-3 py-2 bg-background border border-input rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newHolidays = config.holidays?.filter((_, i) => i !== index);
                    updateConfig({ holidays: newHolidays });
                  }}
                  className="px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto Open */}
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
        <input
          type="checkbox"
          id="autoOpen"
          checked={config.autoOpen || false}
          onChange={(e) => updateConfig({ autoOpen: e.target.checked })}
          className="mt-1"
        />
        <div className="flex-1">
          <label htmlFor="autoOpen" className="block font-medium text-foreground cursor-pointer">
            Automatisch openen
          </label>
          <p className="text-sm text-muted-foreground mt-1">
            Widget opent automatisch na een bepaalde tijd
          </p>
        </div>
      </div>

      {config.autoOpen && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Vertraging voor openen (ms)
          </label>
          <input
            type="number"
            value={config.autoOpenDelay || 3000}
            onChange={(e) => updateConfig({ autoOpenDelay: parseInt(e.target.value) })}
            min={0}
            max={60000}
            step={1000}
            className="w-full px-4 py-2 bg-background border border-input rounded-lg"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {((config.autoOpenDelay || 3000) / 1000).toFixed(1)} seconden
          </p>
        </div>
      )}

      {/* Branding */}
      <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
        <input
          type="checkbox"
          id="showBranding"
          checked={config.showBranding ?? true}
          onChange={(e) => updateConfig({ showBranding: e.target.checked })}
          className="mt-1"
        />
        <div className="flex-1">
          <label htmlFor="showBranding" className="block font-medium text-foreground cursor-pointer">
            Toon Branding
          </label>
          <p className="text-sm text-muted-foreground mt-1">
            "Powered by [Jouw Naam]" onderaan de chat
          </p>
        </div>
      </div>
    </div>
  );
}

// Advanced Tab
function AdvancedTab({ config, updateConfig }: { config: WidgetConfig; updateConfig: (u: Partial<WidgetConfig>) => void }) {
  return (
    <div className="space-y-6">
      {/* Z-Index */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Z-Index
        </label>
        <input
          type="number"
          value={config.zIndex || 999999}
          onChange={(e) => updateConfig({ zIndex: parseInt(e.target.value) })}
          min={1}
          max={999999}
          className="w-full px-4 py-2 bg-background border border-input rounded-lg"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Bepaalt de laag waarop de widget verschijnt (hogere waarde = bovenaan)
        </p>
      </div>

      {/* Custom CSS */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Custom CSS
        </label>
        <textarea
          value={config.customCss || ''}
          onChange={(e) => updateConfig({ customCss: e.target.value })}
          placeholder={`/* Voorbeeld */\n#ai-chat-bubble {\n  box-shadow: 0 8px 24px rgba(0,0,0,0.2);\n}`}
          rows={10}
          maxLength={10000}
          className="w-full px-4 py-3 bg-background border border-input rounded-lg font-mono text-sm resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Voeg custom CSS toe om de widget verder aan te passen
        </p>
      </div>

      {/* Info */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex gap-3">
          <RiCheckboxCircleLine size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-foreground mb-1">Pro Tip</p>
            <p className="text-muted-foreground">
              Gebruik browser DevTools om CSS selectors te vinden. Alle widget elementen hebben ID's zoals 
              <code className="bg-muted px-1 py-0.5 rounded text-xs mx-1">#ai-chat-bubble</code> en 
              <code className="bg-muted px-1 py-0.5 rounded text-xs mx-1">#ai-chat-window</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
