'use client';

import { useState } from 'react';
import { RemixiconPicker } from './RemixiconPicker';
import { PositionPicker } from './PositionPicker';
import { TypographyTab } from './TypographyTab';
import {
  RiLayoutLine,
  RiPaletteLine,
  RiSettings3Line,
  RiCodeLine,
  RiCheckboxCircleLine,
  RiFontSize,
  RiHammerLine
} from '@remixicon/react';

// Block based launcher structure
export interface LauncherBlock {
  id: string;
  type: 'container' | 'row' | 'column' | 'icon' | 'text' | 'image';
  content?: string; // Text content, image url, or icon name
  style?: React.CSSProperties;
  className?: string; // Tailwind classes
  children?: LauncherBlock[];
  // Interaction
  onClick?: 'open-chat' | 'toggle-chat' | 'open-link' | 'email' | 'phone';
  linkUrl?: string; // For open-link, email (mailto:), phone (tel:)

  // Advanced Styles
  hoverStyle?: React.CSSProperties; // Styles to apply on hover

  // Responsiveness
  mobileHidden?: boolean; // Hide on mobile screens
}

export interface WidgetConfig {
  // Basic
  name: string;
  theme?: 'light' | 'dark' | 'system';
  widgetType: 'bubble' | 'searchbar' | 'custom-box';

  // Launcher Builder (Advanced)
  launcherMode?: 'simple' | 'advanced';
  launcherStructure?: LauncherBlock[];

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
  primaryColor?: string;
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

  // Header Avatar
  showAgentAvatar?: boolean;
  showOnlineStatus?: boolean;
  headerAvatarUrl?: string; // Custom avatar image URL
  headerAvatarEmoji?: string; // Custom emoji for avatar
  headerTitle?: string;
  headerSubtitle?: string;

  // Chat Area Styling
  chatBackgroundColor?: string; // Messages area background

  // Input Styling
  inputBorderColor?: string;
  inputFocusBorderColor?: string;
  inputBackgroundColor?: string;
  inputTextColor?: string;
  inputPlaceholderColor?: string;
  inputAreaBackgroundColor?: string; // Entire input area background
  inputAreaBorderColor?: string; // Border above input area
  typingIndicatorColor?: string; // "AI is typing..." text color

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

  // Sources Display
  showSources?: boolean;
  maxVisibleSources?: number;

  workingHours?: {
    [day: string]: { enabled: boolean; start: string; end: string };
  };
  holidays?: Array<{ date: string; name: string; recurring?: boolean }>;

  // Typography System
  fontFamily?: string; // Google Fonts name: "Inter", "Roboto", "Outfit", etc.
  fontSize?: {
    header?: number;
    message?: number;
    input?: number;
  };
  fontWeight?: {
    header?: number;
    message?: number;
    input?: number;
  };
  lineHeight?: {
    header?: number;
    message?: number;
    input?: number;
  };
  letterSpacing?: {
    header?: number; // in em
    message?: number;
    input?: number;
  };

  // Avatar Gradient (modern look like screenshot)
  avatarGradient?: { from: string; to: string; direction: string };
  avatarBorderColor?: string;
  avatarBorderWidth?: number;
  avatarSize?: number;

  // File Attachment Styling
  attachmentStyle?: {
    backgroundColor?: string;
    borderRadius?: number;
    iconColor?: string;
  };
  showAttachmentPreviews?: boolean;
  attachmentIconStyle?: 'modern' | 'minimal' | 'colorful';

  // GSAP Animation Options
  gsapEnabled?: boolean;
  gsapBubbleEntry?: 'bounceIn' | 'fadeInUp' | 'scaleIn' | 'rotateIn' | 'none';
  gsapChatEntry?: 'slideInRight' | 'fadeIn' | 'zoomIn' | 'slideInUp' | 'none';
  gsapMessageEntry?: 'fadeInUp' | 'slideInLeft' | 'fadeIn' | 'none';
  gsapDuration?: number; // in seconds
  gsapEase?: string; // GSAP easing function

  // Message Bubble Enhancements
  messageShadow?: string;
  messageSpacing?: number;
  messageMaxWidth?: number; // percentage

  // Header Enhancements
  headerGradient?: { from: string; to: string; direction: string };
  headerShadow?: string;
  headerPadding?: number;

  // Advanced
  customCss?: string;
  zIndex?: number;
  showBranding?: boolean;
  brandingText?: string;
  brandingUrl?: string;
}

interface AdvancedWidgetEditorProps {
  config: WidgetConfig;
  onChange: (config: WidgetConfig) => void;
}

type TabType = 'layout' | 'styling' | 'typography' | 'launcher' | 'animations' | 'behavior' | 'advanced';

export function AdvancedWidgetEditor({ config, onChange }: AdvancedWidgetEditorProps) {
  const [activeTab, setActiveTab] = useState<TabType>('layout');

  const updateConfig = (updates: Partial<WidgetConfig>) => {
    onChange({ ...config, ...updates });
  };

  const tabs = [
    { id: 'layout' as TabType, label: 'Layout', icon: RiLayoutLine },
    { id: 'styling' as TabType, label: 'Styling', icon: RiPaletteLine },
    { id: 'launcher' as TabType, label: 'Launcher', icon: RiHammerLine },
    { id: 'typography' as TabType, label: 'Typografie', icon: RiFontSize },
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
        {activeTab === 'launcher' && (
          <LauncherTab config={config} updateConfig={updateConfig} />
        )}
        {activeTab === 'typography' && (
          <TypographyTab config={config} updateConfig={updateConfig} />
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

// Launcher Build Tab
function LauncherTab({ config, updateConfig }: { config: WidgetConfig; updateConfig: (u: Partial<WidgetConfig>) => void }) {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const addBlock = (parentId: string | null = null) => {
    const newBlock: LauncherBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'icon',
      content: 'RiChat1Line',
      style: {
        padding: '10px',
        backgroundColor: config.primaryColor || '#000000',
        color: '#ffffff',
        borderRadius: '50%',
      }
    };

    if (!parentId) {
      updateConfig({
        launcherStructure: [...(config.launcherStructure || []), newBlock]
      });
    } else {
      // Recursive add logic would go here - simplified for root level for now in this iteration
      // For recursive, we need a deep clone and find function.
      const addDeep = (blocks: LauncherBlock[]): LauncherBlock[] => {
        return blocks.map(b => {
          if (b.id === parentId) {
            return { ...b, children: [...(b.children || []), newBlock] };
          }
          if (b.children) {
            return { ...b, children: addDeep(b.children) };
          }
          return b;
        });
      };
      updateConfig({
        launcherStructure: addDeep(config.launcherStructure || [])
      });
    }
  };

  const updateBlock = (blockId: string, updates: Partial<LauncherBlock>) => {
    const updateDeep = (blocks: LauncherBlock[]): LauncherBlock[] => {
      return blocks.map(b => {
        if (b.id === blockId) {
          return { ...b, ...updates };
        }
        if (b.children) {
          return { ...b, children: updateDeep(b.children) };
        }
        return b;
      });
    };
    updateConfig({
      launcherStructure: updateDeep(config.launcherStructure || [])
    });
  };

  const deleteBlock = (blockId: string) => {
    const deleteDeep = (blocks: LauncherBlock[]): LauncherBlock[] => {
      return blocks.filter(b => b.id !== blockId).map(b => {
        if (b.children) {
          return { ...b, children: deleteDeep(b.children) };
        }
        return b;
      });
    };
    updateConfig({
      launcherStructure: deleteDeep(config.launcherStructure || [])
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex bg-muted/20 p-1 rounded-lg">
        <button
          onClick={() => updateConfig({ launcherMode: 'simple' })}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${config.launcherMode !== 'advanced' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
        >
          Simple Mode
        </button>
        <button
          onClick={() => updateConfig({ launcherMode: 'advanced' })}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${config.launcherMode === 'advanced' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
            }`}
        >
          Advanced Builder
        </button>
      </div>

      {config.launcherMode !== 'advanced' ? (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
          Gebruik de <strong>Styling</strong> tab om de standaard bubble aan te passen.
          Schakel over naar <strong>Advanced Builder</strong> hierboven om een volledig custom launcher te bouwen met blokken.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-muted/10 p-2 rounded-lg border border-border/50">
            <div className="flex gap-2">
              <h3 className="text-sm font-medium self-center">Structure</h3>
              <div className="relative group">
                <button className="text-xs bg-white border border-border hover:bg-muted text-foreground px-2 py-1 rounded shadow-sm flex items-center gap-1">
                  ✨ Templates
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-border shadow-lg rounded-md overflow-hidden z-10 hidden group-hover:block">
                  {LAUNCHER_TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => updateConfig({ launcherStructure: t.structure })}
                      className="block w-full text-left px-3 py-2 text-xs hover:bg-muted border-b border-border/50 last:border-0"
                    >
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{t.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => addBlock(null)}
              className="text-xs flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded hover:bg-primary/90"
            >
              + Add Root
            </button>
          </div>

          <div className="space-y-2">
            {(config.launcherStructure || []).map(block => (
              <BlockEditor
                key={block.id}
                block={block}
                onUpdate={updateBlock}
                onDelete={deleteBlock}
                onAddChild={addBlock}
              />
            ))}
            {(!config.launcherStructure || config.launcherStructure.length === 0) && (
              <div className="text-center py-8 border-2 border-dashed border-border rounded-lg text-muted-foreground text-sm">
                Start met bouwen of kies een <span className="font-semibold text-primary">Template ✨</span> hierboven.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BlockEditor({ block, onUpdate, onDelete, onAddChild }: {
  block: LauncherBlock;
  onUpdate: (id: string, u: Partial<LauncherBlock>) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg bg-background overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-center gap-2 p-3 bg-muted/10 border-b border-border/50">
        <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-muted rounded">
          {expanded ? '▼' : '▶'}
        </button>
        <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
          {block.type}
        </span>
        <span className="text-sm font-medium flex-1 truncate">
          {block.id.substring(0, 4)}...
        </span>
        <button onClick={() => onDelete(block.id)} className="text-red-500 hover:text-red-700 p-1">
          ✕
        </button>
      </div>

      {expanded && (
        <div className="p-3 space-y-3 bg-muted/5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase text-muted-foreground font-semibold">Type</label>
              <select
                value={block.type}
                onChange={(e) => onUpdate(block.id, { type: e.target.value as any })}
                className="w-full text-xs p-1.5 rounded border border-input mt-1"
              >
                <option value="container">Container</option>
                <option value="row">Row (Flex-Row)</option>
                <option value="column">Column (Flex-Col)</option>
                <option value="icon">Icon</option>
                <option value="text">Text</option>
                <option value="image">Image</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase text-muted-foreground font-semibold">
                {block.type === 'icon' ? 'Icon Name' : block.type === 'image' ? 'Image URL' : 'Content'}
              </label>
              <input
                type="text"
                value={block.content || ''}
                onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                className="w-full text-xs p-1.5 rounded border border-input mt-1"
                placeholder={block.type === 'icon' ? 'RiChat1Line' : '...'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/50">
            <div>
              <label className="text-[10px] uppercase text-muted-foreground font-semibold">Action</label>
              <select
                value={block.onClick || 'toggle-chat'}
                onChange={(e) => onUpdate(block.id, { onClick: e.target.value as any })}
                className="w-full text-xs p-1.5 rounded border border-input mt-1"
              >
                <option value="toggle-chat">Open/Close Chat</option>
                <option value="open-chat">Open Chat Only</option>
                <option value="open-link">Open URL</option>
                <option value="email">Send Email</option>
                <option value="phone">Call Phone</option>
              </select>
            </div>
            <div>
              {block.onClick === 'open-link' || block.onClick === 'email' || block.onClick === 'phone' ? (
                <>
                  <label className="text-[10px] uppercase text-muted-foreground font-semibold">
                    {block.onClick === 'email' ? 'Email Address' : block.onClick === 'phone' ? 'Phone Number' : 'URL'}
                  </label>
                  <input
                    type="text"
                    value={block.linkUrl || ''}
                    onChange={(e) => onUpdate(block.id, { linkUrl: e.target.value })}
                    className="w-full text-xs p-1.5 rounded border border-input mt-1"
                    placeholder={block.onClick === 'email' ? 'support@example.com' : 'https://...'}
                  />
                </>
              ) : (
                <div className="flex items-center gap-2 h-full pt-4">
                  <label className="flex items-center gap-1.5 text-xs">
                    <input
                      type="checkbox"
                      checked={block.mobileHidden || false}
                      onChange={(e) => onUpdate(block.id, { mobileHidden: e.target.checked })}
                      className="rounded border-input"
                    />
                    Hide on Mobile
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 border border-border rounded-md p-3 bg-background/50">
            <h4 className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Styling & Effects</h4>
            <StyleEditor
              style={block.style || {}}
              hoverStyle={block.hoverStyle}
              onChange={(newStyle) => onUpdate(block.id, { style: newStyle })}
              onHoverChange={(newHoverStyle) => onUpdate(block.id, { hoverStyle: newHoverStyle })}
            />
          </div>

          {(block.type === 'container' || block.type === 'row' || block.type === 'column') && (
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold">Children</span>
                <button onClick={() => onAddChild(block.id)} className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded">
                  + Add Child
                </button>
              </div>
              <div className="pl-2 border-l-2 border-border/50 space-y-2">
                {(block.children || []).map(child => (
                  <BlockEditor
                    key={child.id}
                    block={child}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onAddChild={onAddChild}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Layout Tab (Previous, unmodified)
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
          className="w-16 h-10 rounded-lg cursor-pointer border border-input shadow-sm"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2 bg-background border border-input rounded-lg font-mono text-sm shadow-sm"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20 border-l-4 border-indigo-500 p-4 rounded-r-lg mb-6">
        <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
          <RiPaletteLine size={20} />
          Modern Styling
        </h3>
        <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
          Make your widget stand out with gradients, glassmorphism, and custom brand colors.
        </p>
      </div>

      {/* Basic Appearance */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-foreground border-b pb-2">Appearance</h3>

        {/* Widget Icon */}
        {config.widgetType === 'bubble' && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Widget Icon
            </label>
            <RemixiconPicker
              value={config.bubbleIcon || 'RiChat1Line'}
              onChange={(bubbleIcon) => updateConfig({ bubbleIcon })}
            />
          </div>
        )}

        {/* Text & Image Upload */}
        {(config.widgetType === 'bubble' || config.widgetType === 'custom-box') && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Widget Text <span className="text-xs text-muted-foreground">(Optional)</span>
              </label>
              <input
                type="text"
                value={config.bubbleText || ''}
                onChange={(e) => updateConfig({ bubbleText: e.target.value })}
                placeholder="e.g. 'Need help?'"
                maxLength={25}
                className="w-full px-4 py-2 bg-background border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Custom Image URL <span className="text-xs text-muted-foreground">(Optional)</span>
              </label>
              <input
                type="url"
                value={config.bubbleImageUrl || ''}
                onChange={(e) => updateConfig({ bubbleImageUrl: e.target.value })}
                placeholder="https://example.com/avatar.png"
                className="w-full px-4 py-2 bg-background border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        )}

        {/* Image Customization */}
        {config.bubbleImageUrl && (
          <div className="p-4 bg-muted/30 rounded-lg space-y-3 border border-border/50">
            <h4 className="text-sm font-semibold mb-2">Image Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Fit Mode</label>
                <select
                  value={config.bubbleImageFit || 'cover'}
                  onChange={(e) => updateConfig({ bubbleImageFit: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg"
                >
                  <option value="cover">Cover (Fill)</option>
                  <option value="contain">Contain (Fit)</option>
                  <option value="fill">Stretch</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Position relative to Text</label>
                <select
                  value={config.imageIconRelation || 'cover'}
                  onChange={(e) => updateConfig({ imageIconRelation: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg"
                >
                  <option value="cover">Replace Icon</option>
                  <option value="side-by-side">Side by Side (Left)</option>
                  <option value="overlay">Background Overlay</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Colors & Gradient */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-foreground border-b pb-2">Colors & Effects</h3>

        {/* Gradient Control */}
        <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <label className="font-medium text-foreground">Background Style</label>
            <div className="flex bg-muted p-1 rounded-lg">
              <button
                onClick={() => updateConfig({ backgroundGradient: undefined })}
                className={`px-3 py-1 rounded-md text-sm transition-all ${!config.backgroundGradient ? 'bg-white shadow text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              >Solid</button>
              <button
                onClick={() => updateConfig({
                  backgroundGradient: {
                    from: config.bubbleBackgroundColor,
                    to: '#818cf8',
                    direction: 'to-br'
                  }
                })}
                className={`px-3 py-1 rounded-md text-sm transition-all ${config.backgroundGradient ? 'bg-white shadow text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}`}
              >Gradient</button>
            </div>
          </div>

          {config.backgroundGradient ? (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-4">
                <ColorInput label="Start Color" value={config.backgroundGradient.from} onChange={(v) => updateConfig({ backgroundGradient: { ...config.backgroundGradient!, from: v } })} />
                <ColorInput label="End Color" value={config.backgroundGradient.to} onChange={(v) => updateConfig({ backgroundGradient: { ...config.backgroundGradient!, to: v } })} />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-2">Direction</label>
                <div className="grid grid-cols-4 gap-2">
                  {['to-t', 'to-tr', 'to-r', 'to-br', 'to-b', 'to-bl', 'to-l', 'to-tl'].map(dir => (
                    <button
                      key={dir}
                      onClick={() => updateConfig({ backgroundGradient: { ...config.backgroundGradient!, direction: dir } })}
                      className={`h-8 rounded border transition-all ${config.backgroundGradient?.direction === dir ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-input hover:bg-muted'}`}
                      title={dir}
                    >
                      <div className={`w-full h-full bg-gradient-${dir.replace('to-', 'to ')} from-gray-400 to-gray-600 opacity-20`} style={{ background: `linear-gradient(${dir.replace('-', ' ')}, currentColor, transparent)` }}></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <ColorInput label="Solid Color" value={config.bubbleBackgroundColor} onChange={(v) => updateConfig({ bubbleBackgroundColor: v })} />
          )}
        </div>

        {/* Text & Icon Colors */}
        <div className="grid grid-cols-2 gap-4">
          <ColorInput label="Text Color" value={config.bubbleTextColor} onChange={(v) => updateConfig({ bubbleTextColor: v })} />
          <ColorInput label="Icon Color" value={config.bubbleIconColor || config.bubbleTextColor} onChange={(v) => updateConfig({ bubbleIconColor: v })} />
        </div>

        {/* Glass Effect Toggle */}
        <div className="flex items-center gap-4 p-4 border rounded-xl bg-white/50 dark:bg-black/20">
          <input
            type="checkbox"
            id="glassEffect"
            checked={config.glassEffect || false}
            onChange={(e) => updateConfig({ glassEffect: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <div className="flex-1">
            <label htmlFor="glassEffect" className="font-medium text-foreground cursor-pointer">Enable Glassmorphism</label>
            <p className="text-xs text-muted-foreground">Adds a premium frosted glass blur effect to the widget and chat window.</p>
          </div>
          {config.glassEffect && (
            <div className="w-32">
              <label className="text-xs text-muted-foreground block mb-1">Blur Amount</label>
              <input
                type="range" min="0" max="20"
                value={config.backdropBlur || 8}
                onChange={(e) => updateConfig({ backdropBlur: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Hover Effects */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-foreground border-b pb-2">Hover Aesthetics</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-medium">Hover Scale</label>
            <div className="flex items-center gap-4">
              <input
                type="range" min="1.0" max="1.3" step="0.01"
                value={config.bubbleHoverScale || 1.05}
                onChange={(e) => updateConfig({ bubbleHoverScale: parseFloat(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm w-12 text-right">{(config.bubbleHoverScale || 1.05).toFixed(2)}x</span>
            </div>
            <p className="text-xs text-muted-foreground">Zoom effect when user hovers the widget.</p>
          </div>

          <div className="space-y-3">
            <ColorInput label="Hover Background" value={config.bubbleHoverBackgroundColor || ''} onChange={(v) => updateConfig({ bubbleHoverBackgroundColor: v })} />
          </div>
        </div>
      </div>

      {/* Advanced Border & Shadow */}
      <div className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Border Radius</label>
            <input
              type="range" min="0" max="50"
              value={config.chatBorderRadius || 16}
              onChange={(e) => updateConfig({ chatBorderRadius: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-right text-xs mt-1 text-muted-foreground">{config.chatBorderRadius}px</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Shadow Intensity</label>
            <select
              value={config.shadowIntensity || 'md'}
              onChange={(e) => updateConfig({ shadowIntensity: e.target.value as any })}
              className="w-full px-3 py-2 bg-background border border-input rounded-lg"
            >
              <option value="none">None (Flat)</option>
              <option value="sm">Small (Subtle)</option>
              <option value="md">Medium (Standard)</option>
              <option value="lg">Large (Floating)</option>
              <option value="xl">Extra Large (Elevated)</option>
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
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-l-4 border-purple-500 p-4 rounded-r-lg">
        <h3 className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
          <RiCheckboxCircleLine size={20} />
          Physics-Based Animations
        </h3>
        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
          Configure smooth, modern entrance and interaction animations.
        </p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <input
          type="checkbox"
          id="enableAnimation"
          checked={config.enableAnimation ?? true}
          onChange={(e) => updateConfig({ enableAnimation: e.target.checked })}
          className="w-5 h-5 rounded border-gray-300 text-primary"
        />
        <label htmlFor="enableAnimation" className="font-medium text-lg cursor-pointer">Enable Animations</label>
      </div>

      {config.enableAnimation !== false && (
        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">

          {/* Entrance Animation */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">Entrance Animation</h4>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {[
                { id: 'scale', label: 'Pop In', icon: '✨' },
                { id: 'slide', label: 'Slide Up', icon: '↑' },
                { id: 'fade', label: 'Fade In', icon: '▒' },
                { id: 'bounce', label: 'Bounce', icon: '🏀' },
                { id: 'flip', label: 'Flip', icon: '↺' }
              ].map((anim) => (
                <button
                  key={anim.id}
                  onClick={() => updateConfig({ animationType: anim.id as any })}
                  className={`
                      flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
                      ${config.animationType === anim.id
                      ? 'border-primary bg-primary/5 shadow-sm text-primary'
                      : 'border-transparent bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground'
                    }
                    `}
                >
                  <span className="text-2xl mb-1">{anim.icon}</span>
                  <span className="text-xs font-medium">{anim.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Interaction/Hover */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">Hover Interaction</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'lift', label: 'Lift Up', icon: '↟' },
                { id: 'grow', label: 'Scale Up', icon: '↗' },
                { id: 'pulse', label: 'Pulse', icon: '◎' },
                { id: 'rotate', label: 'Wiggle', icon: '≈' },
                { id: 'none', label: 'None', icon: '×' }
              ].map((anim) => (
                <button
                  key={anim.id}
                  onClick={() => updateConfig({ hoverAnimation: anim.id as any })}
                  className={`
                      flex items-center gap-3 p-3 rounded-xl border transition-all text-left
                      ${config.hoverAnimation === anim.id
                      ? 'border-primary ring-1 ring-primary/20 bg-primary/5 text-primary'
                      : 'border-border hover:border-primary/30'
                    }
                    `}
                >
                  <span className="text-lg">{anim.icon}</span>
                  <span className="text-sm font-medium">{anim.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Chat Window Open */}
          <section className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">Window Open Transition</h4>
            <div className="grid grid-cols-2 gap-4">
              <div onClick={() => updateConfig({ chatAnimation: 'slide-up' })} className={`cursor-pointer p-4 rounded-xl border transition-all ${config.chatAnimation === 'slide-up' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                <div className="font-medium mb-1">Slide Up</div>
                <div className="text-xs text-muted-foreground">Window slides up from the bottom (Modern iOS style)</div>
              </div>
              <div onClick={() => updateConfig({ chatAnimation: 'scale' })} className={`cursor-pointer p-4 rounded-xl border transition-all ${config.chatAnimation === 'scale' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                <div className="font-medium mb-1">Scale / Zoom</div>
                <div className="text-xs text-muted-foreground">Window zooms out from the bubble (Material Design)</div>
              </div>
            </div>
          </section>

          {/* Timing Sliders */}
          <section className="bg-card p-5 rounded-xl border space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Entrance Delay</label>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{config.animationDelay || 0}ms</span>
              </div>
              <input
                type="range" min="0" max="3000" step="100"
                value={config.animationDelay || 0}
                onChange={(e) => updateConfig({ animationDelay: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">Wait before showing the widget after page load</p>
            </div>
          </section>

        </div>
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
                className={`py-2 text-xs rounded-lg font-medium transition-all ${selectedDay === day
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

      {/* Branding */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Branding</h3>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showBranding"
              checked={config.showBranding !== false}
              onChange={(e) => updateConfig({ showBranding: e.target.checked })}
              className="rounded border-gray-300 dark:border-gray-700"
            />
            <label htmlFor="showBranding" className="text-sm font-medium cursor-pointer">
              Toon Branding
            </label>
          </div>
        </div>

        {config.showBranding !== false && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Branding Tekst
              </label>
              <input
                type="text"
                value={config.brandingText || 'Powered by BonsaiMedia.nl'}
                onChange={(e) => updateConfig({ brandingText: e.target.value })}
                placeholder="Powered by..."
                className="w-full px-4 py-2 bg-background border border-input rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Link URL
              </label>
              <input
                type="url"
                value={config.brandingUrl || 'https://bonsaimedia.nl'}
                onChange={(e) => updateConfig({ brandingUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2 bg-background border border-input rounded-lg"
              />
            </div>
          </div>
        )}
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


function StyleEditor({ style, hoverStyle, onChange, onHoverChange }: {
  style: React.CSSProperties,
  hoverStyle?: React.CSSProperties,
  onChange: (s: React.CSSProperties) => void,
  onHoverChange?: (s: React.CSSProperties) => void
}) {
  const [mode, setMode] = useState<'normal' | 'hover'>('normal');

  const currentStyle = mode === 'normal' ? style : (hoverStyle || {});
  const updateFn = mode === 'normal' ? onChange : (onHoverChange || (() => { }));

  const handleChange = (key: keyof React.CSSProperties, value: any) => {
    const newStyle = { ...currentStyle, [key]: value };
    // Clean up empty values
    if (value === '' || value === null || value === undefined) {
      delete (newStyle as any)[key];
    }
    updateFn(newStyle);
  };

  return (
    <div className="space-y-3">
      {/* State Tabs */}
      <div className="flex bg-muted/30 p-0.5 rounded-lg mb-2">
        <button
          onClick={() => setMode('normal')}
          className={`flex-1 text-[10px] py-1 rounded-md font-medium transition-colors ${mode === 'normal' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
        >
          Normal
        </button>
        <button
          onClick={() => setMode('hover')}
          className={`flex-1 text-[10px] py-1 rounded-md font-medium transition-colors ${mode === 'hover' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
        >
          Hover State
        </button>
      </div>

      {/* Layout / Dimensions */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">Width</label>
          <input
            type="text"
            value={style.width || ''}
            onChange={(e) => handleChange('width', e.target.value)}
            placeholder="e.g. 100%, 50px"
            className="w-full text-xs p-1 rounded border border-input bg-background"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">Height</label>
          <input
            type="text"
            value={style.height || ''}
            onChange={(e) => handleChange('height', e.target.value)}
            placeholder="e.g. 100%, 50px"
            className="w-full text-xs p-1 rounded border border-input bg-background"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">Padding</label>
          <input
            type="text"
            value={style.padding || ''}
            onChange={(e) => handleChange('padding', e.target.value)}
            placeholder="e.g. 10px"
            className="w-full text-xs p-1 rounded border border-input bg-background"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">Margin</label>
          <input
            type="text"
            value={style.margin || ''}
            onChange={(e) => handleChange('margin', e.target.value)}
            placeholder="e.g. 10px"
            className="w-full text-xs p-1 rounded border border-input bg-background"
          />
        </div>
      </div>

      {/* Background Section */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <label className="text-[10px] uppercase font-semibold text-muted-foreground">Background</label>

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground block mb-1">Color</label>
            <div className="flex gap-1">
              <input
                type="color"
                value={(style.backgroundColor as string) || '#ffffff'}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                className="h-6 w-8 p-0 border border-input rounded cursor-pointer"
              />
              <input
                type="text"
                value={style.backgroundColor || ''}
                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                placeholder="#fff"
                className="flex-1 text-xs p-1 rounded border border-input bg-background"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-muted-foreground block">Image URL</label>
          <input
            type="text"
            value={(style.backgroundImage as string)?.replace('url(', '').replace(')', '') || ''}
            onChange={(e) => handleChange('backgroundImage', e.target.value ? `url(${e.target.value})` : '')}
            placeholder="https://..."
            className="w-full text-xs p-1 rounded border border-input bg-background"
          />

          {style.backgroundImage && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Size (Fit)</label>
                <select
                  value={style.backgroundSize as string || 'cover'}
                  onChange={(e) => handleChange('backgroundSize', e.target.value)}
                  className="w-full text-xs p-1 rounded border border-input bg-background"
                >
                  <option value="cover">Cover (Fill)</option>
                  <option value="contain">Contain (Fit)</option>
                  <option value="100% 100%">Stretch</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block mb-1">Position</label>
                <select
                  value={style.backgroundPosition as string || 'center'}
                  onChange={(e) => handleChange('backgroundPosition', e.target.value)}
                  className="w-full text-xs p-1 rounded border border-input bg-background"
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Border Section */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">Radius</label>
          <input
            type="text"
            value={style.borderRadius || ''}
            onChange={(e) => handleChange('borderRadius', e.target.value)}
            placeholder="e.g. 50%, 8px"
            className="w-full text-xs p-1 rounded border border-input bg-background"
          />
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground block mb-1">Border</label>
          <input
            type="text"
            value={style.border || ''}
            onChange={(e) => handleChange('border', e.target.value)}
            placeholder="e.g. 1px solid red"
            className="w-full text-xs p-1 rounded border border-input bg-background"
          />
        </div>
      </div>

      {/* Typography Section */}
      <div className="space-y-2 pt-2 border-t border-border/50">
        <label className="text-[10px] uppercase font-semibold text-muted-foreground">Typography</label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Color</label>
            <div className="flex gap-1">
              <input
                type="color"
                value={(style.color as string) || '#000000'}
                onChange={(e) => handleChange('color', e.target.value)}
                className="h-6 w-6 p-0 border border-input rounded cursor-pointer"
              />
              <input
                type="text"
                value={style.color || ''}
                onChange={(e) => handleChange('color', e.target.value)}
                placeholder="#000"
                className="flex-1 text-xs p-1 rounded border border-input bg-background"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Font Size</label>
            <input
              type="text"
              value={style.fontSize || ''}
              onChange={(e) => handleChange('fontSize', e.target.value)}
              placeholder="e.g. 16px"
              className="w-full text-xs p-1 rounded border border-input bg-background"
            />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Weight</label>
            <select
              value={style.fontWeight || 'normal'}
              onChange={(e) => handleChange('fontWeight', e.target.value)}
              className="w-full text-xs p-1 rounded border border-input bg-background"
            >
              <option value="normal">Normal</option>
              <option value="bold">Bold</option>
              <option value="500">Medium</option>
              <option value="600">Semi-Bold</option>
              <option value="300">Light</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground block mb-1">Align</label>
            <select
              value={style.textAlign || 'left'}
              onChange={(e) => handleChange('textAlign', e.target.value)}
              className="w-full text-xs p-1 rounded border border-input bg-background"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flex Controls (Conditional) */}
      {(style.display === 'flex') && (
        <div className="space-y-2 pt-2 border-t border-border/50">
          <label className="text-[10px] uppercase font-semibold text-muted-foreground">Flex Layout</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Direction</label>
              <select
                value={style.flexDirection || 'row'}
                onChange={(e) => handleChange('flexDirection', e.target.value)}
                className="w-full text-xs p-1 rounded border border-input bg-background"
              >
                <option value="row">Row (Horizontal)</option>
                <option value="column">Column (Vertical)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Align Items</label>
              <select
                value={style.alignItems || 'stretch'}
                onChange={(e) => handleChange('alignItems', e.target.value)}
                className="w-full text-xs p-1 rounded border border-input bg-background"
              >
                <option value="stretch">Stretch</option>
                <option value="center">Center</option>
                <option value="flex-start">Start</option>
                <option value="flex-end">End</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Justify Content</label>
              <select
                value={style.justifyContent || 'flex-start'}
                onChange={(e) => handleChange('justifyContent', e.target.value)}
                className="w-full text-xs p-1 rounded border border-input bg-background"
              >
                <option value="flex-start">Start</option>
                <option value="center">Center</option>
                <option value="flex-end">End</option>
                <option value="space-between">Space Between</option>
                <option value="space-around">Space Around</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block mb-1">Gap</label>
              <input
                type="text"
                value={style.gap || ''}
                onChange={(e) => handleChange('gap', e.target.value)}
                placeholder="e.g. 5px"
                className="w-full text-xs p-1 rounded border border-input bg-background"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
