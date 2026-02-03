'use client';

import React, { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { LAUNCHER_TEMPLATES } from './launcherTemplates';
import { DEFAULT_CHAT_STRUCTURE, CHAT_TEMPLATES } from './chatTemplates';
import { InteractiveChatPreview } from './InteractiveChatPreview';
import { motion, AnimatePresence } from 'framer-motion';
import * as RemixIcons from 'react-icons/ri';

// DND Kit Imports
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Helpers ---
const ensureHex = (color: string) => {
  if (!color) return undefined;
  if (color.length === 4 && color.startsWith('#')) {
    return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }
  return color;
};

// --- Interfaces ---

export interface LauncherBlock {
  id: string;
  type: 'container' | 'row' | 'column' | 'icon' | 'text' | 'image';
  content?: string; // Text content, icon name, or image URL
  style?: React.CSSProperties; // Individual styles
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

export interface ChatBlock {
  id: string;
  type: 'header' | 'messages' | 'input' | 'container' | 'text' | 'button' | 'divider' | 'branding';
  content?: string; // Text content, button icon, etc.
  style?: React.CSSProperties;
  className?: string;
  children?: ChatBlock[];

  // Specific properties
  position?: 'top' | 'bottom' | 'left' | 'right';
  placeholder?: string; // for input blocks
  icon?: string; // for buttons
  onClick?: 'send-message' | 'close-chat' | 'custom' | 'open-url';
  url?: string;

  // Advanced Styles
  hoverStyle?: React.CSSProperties;

  // Responsiveness
  mobileHidden?: boolean;
}

export interface WidgetConfig {
  id?: string;
  workspaceId?: string;
  name: string;
  agentId?: string;
  widgetType?: 'bubble' | 'full-page' | 'embed' | 'searchbar' | 'custom-box';

  // Layout
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'middle-right' | 'middle-left' | 'top-center' | 'bottom-center' | 'middle-center';
  offsetX?: number;
  offsetY?: number;
  layoutMode?: 'fixed' | 'percentage' | 'full-height' | 'full-width' | 'custom';
  widthPercentage?: number;
  heightPercentage?: number;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
  zIndex?: number;

  // Simple Launcher (Legacy/Standard)
  bubbleIcon?: string;
  bubbleText?: string;
  bubbleShape?: 'circle' | 'square' | 'rounded-square';
  bubbleSize?: 'small' | 'medium' | 'large' | 'custom';
  bubbleWidth?: number;
  bubbleHeight?: number;
  bubbleImageUrl?: string;
  bubbleImageFit?: 'cover' | 'contain' | 'fill';
  bubbleShadow?: string;

  // Animation System
  enableAnimation?: boolean;
  animationType?: 'fade' | 'slide' | 'scale' | 'bounce' | 'flip';
  animationDirection?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  animationDuration?: number;
  animationDelay?: number;
  hoverAnimation?: 'scale' | 'lift' | 'pulse' | 'none' | 'grow' | 'rotate';

  // Icon/Image Relationship
  imageIconRelation?: 'icon-only' | 'image-only' | 'image-bg-icon-overlay' | 'split' | 'cover' | 'overlay' | 'side-by-side';
  imagePosition?: 'left' | 'right' | 'top' | 'bottom' | 'background';
  imageFullHeight?: boolean;

  // Colors
  primaryColor?: string; // Sometimes used as fallback
  bubbleBackgroundColor?: string;
  bubbleTextColor?: string;
  bubbleIconColor?: string;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  userMessageColor?: string;
  userMessageTextColor?: string;
  botMessageColor?: string;
  botMessageTextColor?: string;
  borderColor?: string;

  // Bubble Hover
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
  headerAvatarUrl?: string;
  headerAvatarEmoji?: string;
  headerTitle?: string;
  headerSubtitle?: string;

  // Chat Area
  chatBackgroundColor?: string;

  // Input Styling
  inputBorderColor?: string;
  inputFocusBorderColor?: string;
  inputBackgroundColor?: string;
  inputTextColor?: string;
  inputPlaceholderColor?: string;
  inputAreaBackgroundColor?: string;
  inputAreaBorderColor?: string;
  typingIndicatorColor?: string;

  // Send Button
  sendButtonIcon?: string;
  sendButtonBackgroundColor?: string;
  sendButtonIconColor?: string;
  sendButtonHoverBackgroundColor?: string;
  sendButtonHoverIconColor?: string;

  // Advanced Styling
  backgroundGradient?: {
    from: string;
    to: string;
    direction?: string;
  };
  backdropBlur?: number;
  borderWidth?: number;
  shadowIntensity?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  glassEffect?: boolean;

  // Chat Window Customization
  greeting?: string;
  placeholder?: string;
  chatWidth?: number;
  chatHeight?: number;
  chatBorderRadius?: number;
  messageBorderRadius?: number;
  chatAnimation?: string;
  chatOffsetX?: number;
  chatOffsetY?: number;

  // Behavior
  autoOpen?: boolean;
  autoOpenDelay?: number;

  // AI-Only Mode & Availability
  aiOnlyMode?: boolean;
  aiOnlyMessage?: string;

  // Avatar Gradient & Styling
  avatarGradient?: {
    from: string;
    to: string;
    direction: string;
  };
  avatarSize?: number;
  avatarBorderColor?: string;
  avatarBorderWidth?: number;

  // Typography
  fontFamily?: string;
  fontSize?: { header?: number; message?: number; input?: number; };
  fontWeight?: { header?: number; message?: number; input?: number; };
  lineHeight?: { header?: number; message?: number; input?: number; };
  letterSpacing?: { header?: number; message?: number; input?: number; };
  workingHours?: any; // Complex object
  holidays?: any; // Complex object

  // Branding
  showBranding?: boolean;
  brandingText?: string;
  brandingUrl?: string;

  // Advanced Launcher Builder
  launcherMode?: 'simple' | 'advanced';
  launcherStructure?: LauncherBlock[];

  // Advanced Chat Builder
  chatMode?: 'simple' | 'advanced';
  chatStructure?: ChatBlock[];

  // Custom CSS
  customCss?: string;
}

// --- Helper Components ---

// 1. Structure Item (Sortable)
function StructureItem({
  block,
  isSelected,
  onSelect,
  onDeleteBlock,
  selectedBlockId,
  onSelectBlock
}: {
  block: LauncherBlock,
  isSelected: boolean,
  onSelect: () => void,
  onDeleteBlock: (id: string) => void,
  selectedBlockId: string | null,
  onSelectBlock: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = (RemixIcons as any)[block.type === 'icon' ? (block.content || 'RiShapeLine') : 'RiShapeLine'] || RemixIcons.RiShapeLine;

  return (
    <div ref={setNodeRef} style={style} className={`mb-1`}>
      <div
        className={`flex items-center gap-2 p-2 rounded-md text-sm border cursor-pointer select-none transition-colors ${isSelected ? 'bg-primary/10 border-primary text-primary font-medium' : 'bg-background border-border hover:bg-muted'}`}
        onClick={(e) => { e.stopPropagation(); onSelectBlock(block.id); }}
        {...attributes}
        {...listeners}
      >
        {/* Drag Handle */}
        <span className="text-muted-foreground/50"><RemixIcons.RiDraggable /></span>

        {/* Type Icon */}
        <span className="text-muted-foreground">{block.type === 'icon' ? <RemixIcons.RiStarLine size={14} /> :
          block.type === 'text' ? <RemixIcons.RiText size={14} /> :
            block.type === 'image' ? <RemixIcons.RiImageLine size={14} /> :
              block.type === 'row' ? <RemixIcons.RiLayoutRowLine size={14} /> :
                block.type === 'column' ? <RemixIcons.RiLayoutColumnLine size={14} /> :
                  <RemixIcons.RiLayoutLine size={14} />
        }</span>

        <span className="flex-1 truncate text-xs">
          {block.type.toUpperCase()}
          {block.content && <span className="text-muted-foreground ml-1 font-normal">({block.content.substring(0, 10)})</span>}
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }}
          className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10"
        >
          <RemixIcons.RiDeleteBinLine size={14} />
        </button>
      </div>
      {block.children && (
        <div className="ml-4 pl-2 border-l border-border/50 mt-1">
          <SortableContext items={block.children.map(b => b.id)} strategy={verticalListSortingStrategy}>
            {block.children.map(child => (
              <StructureItem
                key={child.id}
                block={child}
                isSelected={selectedBlockId === child.id}
                onSelect={() => onSelectBlock(child.id)}
                onDeleteBlock={onDeleteBlock}
                selectedBlockId={selectedBlockId}
                onSelectBlock={onSelectBlock}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
}


// 2. Style Editor Component (Reused)
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
    let finalValue = value;
    // Auto-fix colors
    if ((key.toLowerCase().includes('color') || key.toLowerCase().includes('background')) && typeof value === 'string' && value.startsWith('#')) {
      finalValue = ensureHex(value);
    }
    const newStyle = { ...currentStyle, [key]: finalValue };
    if (finalValue === '' || finalValue === null || finalValue === undefined) delete (newStyle as any)[key];
    updateFn(newStyle);
  };

  return (
    <div className="space-y-4">
      <div className="flex bg-muted/40 p-1 rounded-lg">
        <button
          onClick={() => setMode('normal')}
          className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${mode === 'normal' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Normal
        </button>
        <button
          onClick={() => setMode('hover')}
          className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all ${mode === 'hover' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Hover State
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-muted-foreground">Dimensions</label>
          <div className="flex gap-2">
            <input type="text" value={currentStyle.width || ''} onChange={(e) => handleChange('width', e.target.value)} placeholder="W: auto" className="w-full text-xs p-1.5 rounded border bg-background" />
            <input type="text" value={currentStyle.height || ''} onChange={(e) => handleChange('height', e.target.value)} placeholder="H: auto" className="w-full text-xs p-1.5 rounded border bg-background" />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-muted-foreground">Spacing</label>
          <div className="flex gap-2">
            <input type="text" value={currentStyle.padding || ''} onChange={(e) => handleChange('padding', e.target.value)} placeholder="P: 0" className="w-full text-xs p-1.5 rounded border bg-background" />
            <input type="text" value={currentStyle.margin || ''} onChange={(e) => handleChange('margin', e.target.value)} placeholder="M: 0" className="w-full text-xs p-1.5 rounded border bg-background" />
          </div>
        </div>
      </div>

      <div className="space-y-1.5 pt-2 border-t border-border/40">
        <label className="text-[10px] uppercase font-bold text-muted-foreground">Appearance</label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground">Background</span>
            <div className="flex gap-1">
              <input type="color" value={(currentStyle.backgroundColor as string) || '#ffffff'} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="w-6 h-6 rounded border p-0 cursor-pointer" />
              <input type="text" value={currentStyle.backgroundColor || ''} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="flex-1 text-xs p-1.5 rounded border bg-background" placeholder="#fff" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground">Text Color</span>
            <div className="flex gap-1">
              <input type="color" value={(currentStyle.color as string) || '#000000'} onChange={(e) => handleChange('color', e.target.value)} className="w-6 h-6 rounded border p-0 cursor-pointer" />
              <input type="text" value={currentStyle.color || ''} onChange={(e) => handleChange('color', e.target.value)} className="flex-1 text-xs p-1.5 rounded border bg-background" placeholder="#000" />
            </div>
          </div>
        </div>
        <div className="mt-2">
          <span className="text-[10px] text-muted-foreground block mb-1">Border Radius</span>
          <input type="text" value={currentStyle.borderRadius || ''} onChange={(e) => handleChange('borderRadius', e.target.value)} placeholder="e.g. 50%, 8px" className="w-full text-xs p-1.5 rounded border bg-background" />
        </div>
      </div>

      <div className="space-y-1.5 pt-2 border-t border-border/40">
        <label className="text-[10px] uppercase font-bold text-muted-foreground">Flex Layout</label>
        <div className="grid grid-cols-2 gap-2">
          <select value={currentStyle.display || 'block'} onChange={(e) => handleChange('display', e.target.value)} className="text-xs p-1.5 rounded border bg-background">
            <option value="block">Block</option>
            <option value="flex">Flex</option>
            <option value="none">None</option>
          </select>
          <select value={currentStyle.flexDirection || 'row'} onChange={(e) => handleChange('flexDirection', e.target.value)} className="text-xs p-1.5 rounded border bg-background" disabled={currentStyle.display !== 'flex'}>
            <option value="row">Row</option>
            <option value="column">Col</option>
          </select>
          <select value={currentStyle.alignItems || 'stretch'} onChange={(e) => handleChange('alignItems', e.target.value)} className="text-xs p-1.5 rounded border bg-background" disabled={currentStyle.display !== 'flex'}>
            <option value="stretch">Align: Stretch</option>
            <option value="center">Align: Center</option>
            <option value="flex-start">Align: Start</option>
          </select>
          <select value={currentStyle.justifyContent || 'flex-start'} onChange={(e) => handleChange('justifyContent', e.target.value)} className="text-xs p-1.5 rounded border bg-background" disabled={currentStyle.display !== 'flex'}>
            <option value="flex-start">Justify: Start</option>
            <option value="center">Justify: Center</option>
            <option value="space-between">Justify: Space-Btwn</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// 3. Properties Panel (Right Column)
function PropertiesPanel({ blockId, config, onUpdateBlock }: { blockId: string | null, config: WidgetConfig, onUpdateBlock: (id: string, updates: Partial<LauncherBlock>) => void }) {
  // Find the block recursively
  const findBlock = (blocks: LauncherBlock[]): LauncherBlock | undefined => {
    for (const b of blocks) {
      if (b.id === blockId) return b;
      if (b.children) {
        const found = findBlock(b.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  const block = blockId ? findBlock(config.launcherStructure || []) : null;

  if (!block) {
    return (
      <div className="p-6 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
        <div className="mb-4 bg-muted/20 w-16 h-16 rounded-full flex items-center justify-center text-muted-foreground/50">
          <RemixIcons.RiCursorLine size={32} />
        </div>
        <h3 className="font-medium text-foreground mb-1">No Selection</h3>
        <p className="text-xs max-w-[200px]">Select a block from the structure tree to edit its properties.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-border sticky top-0 bg-background z-10">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <span className="uppercase text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">{block.type}</span>
          Properties
        </h2>
      </div>

      <div className="p-4 space-y-6">
        {/* Content Section */}
        <div className="space-y-3">
          <label className="text-[10px] uppercase font-bold text-muted-foreground">Content</label>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <span className="text-[10px] text-muted-foreground block mb-1">Type</span>
              <select
                value={block.type}
                onChange={(e) => onUpdateBlock(block.id, { type: e.target.value as any })}
                className="w-full text-xs p-2 rounded border border-input bg-background"
              >
                <option value="container">Container (Box)</option>
                <option value="row">Row (Horizontal)</option>
                <option value="column">Column (Vertical)</option>
                <option value="text">Text / Label</option>
                <option value="icon">Icon From Library</option>
                <option value="image">Image URL</option>
              </select>
            </div>

            {(block.type === 'text' || block.type === 'icon' || block.type === 'image') && (
              <div>
                <span className="text-[10px] text-muted-foreground block mb-1">
                  {block.type === 'icon' ? 'Icon Name (Remix)' : block.type === 'image' ? 'Image Source URL' : 'Text Content'}
                </span>
                <input
                  type="text"
                  value={block.content || ''}
                  onChange={(e) => onUpdateBlock(block.id, { content: e.target.value })}
                  placeholder={block.type === 'text' ? 'Enter text...' : '...'}
                  className="w-full text-xs p-2 rounded border border-input bg-background"
                />
              </div>
            )}
          </div>
        </div>

        {/* Interaction Section */}
        <div className="space-y-3 pt-4 border-t border-border/50">
          <label className="text-[10px] uppercase font-bold text-muted-foreground">Interaction</label>
          <div className="space-y-2">
            <select
              value={block.onClick || 'toggle-chat'}
              onChange={(e) => onUpdateBlock(block.id, { onClick: e.target.value as any })}
              className="w-full text-xs p-2 rounded border border-input bg-background"
            >
              <option value="toggle-chat">Toggle Chat (Open/Close)</option>
              <option value="open-chat">Open Chat</option>
              <option value="open-link">Open External Link</option>
              <option value="email">Send Email (mailto)</option>
              <option value="phone">Call Phone (tel)</option>
            </select>
            {(['open-link', 'email', 'phone'].includes(block.onClick || '')) && (
              <input
                type="text"
                value={block.linkUrl || ''}
                onChange={(e) => onUpdateBlock(block.id, { linkUrl: e.target.value })}
                placeholder="URL / Email / Phone"
                className="w-full text-xs p-2 rounded border border-input bg-background"
              />
            )}
            <label className="flex items-center gap-2 text-xs pt-2">
              <input
                type="checkbox"
                checked={block.mobileHidden || false}
                onChange={(e) => onUpdateBlock(block.id, { mobileHidden: e.target.checked })}
                className="rounded border-input"
              />
              Hide on Mobile
            </label>
          </div>
        </div>

        {/* Styling Section */}
        <div className="space-y-3 pt-4 border-t border-border/50">
          <StyleEditor
            style={block.style || {}}
            hoverStyle={block.hoverStyle}
            onChange={(s) => onUpdateBlock(block.id, { style: s })}
            onHoverChange={(s) => onUpdateBlock(block.id, { hoverStyle: s })}
          />
        </div>
      </div>
    </div>
  );
}

// --- Main Editor Component ---

export default function AdvancedWidgetEditor({ config, onChange }: { config: WidgetConfig, onChange: (c: WidgetConfig) => void }) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'launcher' | 'chat-builder' | 'chat-settings'>('launcher');
  const [selectedChatBlockId, setSelectedChatBlockId] = useState<string | null>(null);

  // Auto-select first block on load if present
  useEffect(() => {
    if (config.launcherStructure && config.launcherStructure.length > 0 && !selectedBlockId) {
      setSelectedBlockId(config.launcherStructure[0].id);
    }
  }, [config.launcherStructure]);

  const updateStructure = (newStructure: LauncherBlock[]) => {
    onChange({ ...config, launcherStructure: newStructure });
  };

  // Recursive finder
  const findContainer = (id: string, items: LauncherBlock[]): LauncherBlock[] | undefined => {
    if (items.some(i => i.id === id)) return items;
    for (const item of items) {
      if (item.children) {
        const found = findContainer(id, item.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeContainer = findContainer(active.id as string, config.launcherStructure || []);
    const overContainer = findContainer(over.id as string, config.launcherStructure || []);

    if (activeContainer && overContainer && activeContainer === overContainer) {
      const oldIndex = activeContainer.findIndex(b => b.id === active.id);
      const newIndex = overContainer.findIndex(b => b.id === over.id);

      // Create new structure by deep cloning/updating
      const newStructure = JSON.parse(JSON.stringify(config.launcherStructure)); // Deep clone necessary for safety

      // We need to apply the move to the CLONED structure.
      // Re-find containers in the clone
      const activeContainerClone = findContainer(active.id as string, newStructure)!;

      // Perform move
      const [movedItem] = activeContainerClone.splice(oldIndex, 1);
      activeContainerClone.splice(newIndex, 0, movedItem);

      updateStructure(newStructure);
    }
  };

  const updateBlock = (id: string, updates: Partial<LauncherBlock>) => {
    // Recursive update
    const updateRecursive = (blocks: LauncherBlock[]): LauncherBlock[] => {
      return blocks.map(b => {
        if (b.id === id) return { ...b, ...updates };
        if (b.children) return { ...b, children: updateRecursive(b.children) };
        return b;
      });
    };
    updateStructure(updateRecursive(config.launcherStructure || []));
  };

  const deleteBlock = (id: string) => {
    const deleteRecursive = (blocks: LauncherBlock[]): LauncherBlock[] => {
      // First filter out the block to delete
      const filtered = blocks.filter(b => b.id !== id);

      // Then recursively process children of remaining blocks
      return filtered.map(b => {
        if (!b.children || b.children.length === 0) return b;
        const newChildren = deleteRecursive(b.children);
        return {
          ...b,
          children: newChildren.length > 0 ? newChildren : undefined
        };
      });
    };
    updateStructure(deleteRecursive(config.launcherStructure || []));
    if (selectedBlockId === id) setSelectedBlockId(null);
  };

  const addBlock = (parentId: string | null) => {
    const newBlock: LauncherBlock = {
      id: nanoid(),
      type: 'container',
      style: { padding: '10px', backgroundColor: '#eee', borderRadius: '8px', minHeight: '40px' },
      content: 'New Block'
    };

    if (!parentId) {
      updateStructure([...(config.launcherStructure || []), newBlock]);
    } else {
      const addRecursive = (blocks: LauncherBlock[]): LauncherBlock[] => {
        return blocks.map(b => {
          if (b.id === parentId) return { ...b, children: [...(b.children || []), newBlock] };
          if (b.children) return { ...b, children: addRecursive(b.children) };
          return b;
        });
      };
      updateStructure(addRecursive(config.launcherStructure || []));
    }
    setSelectedBlockId(newBlock.id);
  };

  // === CHAT BUILDER FUNCTIONS ===
  const updateChatStructure = (newStructure: ChatBlock[]) => {
    onChange({ ...config, chatStructure: newStructure, chatMode: 'advanced' });
  };

  const updateChatBlock = (id: string, updates: Partial<ChatBlock>) => {
    const updateRecursive = (blocks: ChatBlock[]): ChatBlock[] => {
      return blocks.map(b => {
        if (b.id === id) return { ...b, ...updates };
        if (b.children) return { ...b, children: updateRecursive(b.children) };
        return b;
      });
    };
    updateChatStructure(updateRecursive(config.chatStructure || []));
  };

  const deleteChatBlock = (id: string) => {
    const deleteRecursive = (blocks: ChatBlock[]): ChatBlock[] => {
      const filtered = blocks.filter(b => b.id !== id);
      return filtered.map(b => {
        if (!b.children || b.children.length === 0) return b;
        const newChildren = deleteRecursive(b.children);
        return { ...b, children: newChildren.length > 0 ? newChildren : undefined };
      });
    };
    updateChatStructure(deleteRecursive(config.chatStructure || []));
    if (selectedChatBlockId === id) setSelectedChatBlockId(null);
  };

  const addChatBlock = (parentId: string | null, type: ChatBlock['type']) => {
    const newBlock: ChatBlock = {
      id: nanoid(),
      type,
      content: type === 'text' ? 'New Text' : type === 'button' ? 'Click Me' : type === 'branding' ? 'Powered by AI' : undefined,
      placeholder: type === 'input' ? 'Type a message...' : undefined,
      style: type === 'container' ? { padding: '10px', backgroundColor: '#f9fafb' } : undefined,
    };

    if (!parentId) {
      updateChatStructure([...(config.chatStructure || []), newBlock]);
    } else {
      const addRecursive = (blocks: ChatBlock[]): ChatBlock[] => {
        return blocks.map(b => {
          if (b.id === parentId) return { ...b, children: [...(b.children || []), newBlock] };
          if (b.children) return { ...b, children: addRecursive(b.children) };
          return b;
        });
      };
      updateChatStructure(addRecursive(config.chatStructure || []));
    }
    setSelectedChatBlockId(newBlock.id);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden border rounded-xl shadow-sm">
      {/* Toolbar / Header with Tabs */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-muted/20 shrink-0">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-1">
          <button
            onClick={() => setActiveTab('launcher')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'launcher' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Launcher
          </button>
          <button
            onClick={() => setActiveTab('chat-builder')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'chat-builder' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Chat Builder
          </button>
          <button
            onClick={() => setActiveTab('chat-settings')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'chat-settings' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Chat Settings
          </button>
        </div>

        {/* Template Loader (only for launcher tab) */}
        {activeTab === 'launcher' && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase font-bold mr-1">Load Template:</span>
            <div className="flex bg-background border border-border rounded-md p-1">
              {LAUNCHER_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  className="px-3 py-1 text-xs hover:bg-muted rounded transition-colors"
                  onClick={() => {
                    if (confirm('Are you sure? This will replace your current launcher structure.')) {
                      updateStructure(t.structure);
                    }
                  }}
                  title={t.description}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>


      {/* Content - Conditional based on active tab */}
      {activeTab === 'launcher' ? (
        // LAUNCHER BUILDER - 3 Column Layout
        <div className="flex-1 grid grid-cols-[280px_1fr_320px] overflow-hidden">
          {/* LEFT: Structure Tree */}
          <div className="border-r border-border bg-muted/5 flex flex-col min-h-0">
            <div className="p-3 border-b border-border/50 flex justify-between items-center shrink-0">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Layers</h3>
              <button onClick={() => addBlock(null)} className="text-xs bg-primary text-primary-foreground p-1.5 rounded hover:bg-primary/90 flex items-center gap-1">
                <RemixIcons.RiAddLine /> <span className="text-[10px]">Root</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {config.launcherStructure && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={config.launcherStructure.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    {config.launcherStructure.map(block => (
                      <StructureItem
                        key={block.id}
                        block={block}
                        isSelected={selectedBlockId === block.id}
                        onSelect={() => setSelectedBlockId(block.id)}
                        onDeleteBlock={deleteBlock}
                        selectedBlockId={selectedBlockId}
                        onSelectBlock={setSelectedBlockId}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
              {(!config.launcherStructure || config.launcherStructure.length === 0) && (
                <div className="text-center text-xs text-muted-foreground py-10 opacity-50">
                  No blocks. Add one or load a template.
                </div>
              )}
            </div>
          </div>

          {/* CENTER: Canvas */}
          <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-black relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#999 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 pointer-events-auto">
                <InteractiveChatPreview
                  config={config}
                  isOpen={false}
                  setIsOpen={() => { }}
                  isPreview={true}
                />
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur border border-border px-3 py-1.5 rounded-full shadow-sm text-xs text-muted-foreground flex items-center gap-2">
              <RemixIcons.RiEyeLine size={12} /> Live Preview
            </div>
          </div>

          {/* RIGHT: Properties */}
          <div className="border-l border-border bg-background flex flex-col min-h-0">
            <PropertiesPanel
              blockId={selectedBlockId}
              config={config}
              onUpdateBlock={updateBlock}
            />
          </div>
        </div>
      ) : activeTab === 'chat-builder' ? (
        // CHAT BUILDER - Full 3 Column Layout (like Launcher)
        <div className="flex-1 grid grid-cols-[280px_1fr_320px] overflow-hidden">
          {/* LEFT: Chat Structure Tree */}
          <div className="border-r border-border bg-muted/5 flex flex-col min-h-0">
            <div className="p-3 border-b border-border/50 flex justify-between items-center shrink-0">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">Chat Blocks</h3>
              <button
                onClick={() => {
                  const newStructure = config.chatStructure && config.chatStructure.length > 0
                    ? config.chatStructure
                    : DEFAULT_CHAT_STRUCTURE;
                  onChange({ ...config, chatStructure: newStructure, chatMode: 'advanced' });
                }}
                className="text-xs bg-primary text-primary-foreground p-1.5 rounded hover:bg-primary/90 flex items-center gap-1"
              >
                <RemixIcons.RiAddLine /> <span className="text-[10px]">Init</span>
              </button>
            </div>

            {/* Template Loader */}
            <div className="p-2 border-b border-border/50 shrink-0">
              <label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block">Templates:</label>
              <div className="grid grid-cols-2 gap-1">
                {CHAT_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    className="px-2 py-1 text-[10px] bg-background border border-border hover:bg-muted rounded transition-colors"
                    onClick={() => {
                      if (confirm(`Load "${t.name}" template?`)) {
                        onChange({ ...config, chatStructure: t.structure, chatMode: 'advanced' });
                        if (t.structure.length > 0) setSelectedChatBlockId(t.structure[0].id);
                      }
                    }}
                    title={t.description}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Structure List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {config.chatStructure && config.chatStructure.length > 0 ? (
                <>
                  <div className="space-y-1">
                    {config.chatStructure.map(block => (
                      <div
                        key={block.id}
                        className={`p-2 rounded text-xs border cursor-pointer transition-colors group ${selectedChatBlockId === block.id
                          ? 'bg-primary/10 border-primary text-primary font-medium'
                          : 'bg-background border-border hover:bg-muted'
                          }`}
                        onClick={() => setSelectedChatBlockId(block.id)}
                      >
                        <div className="flex items-center gap-2">
                          {block.type === 'header' && <RemixIcons.RiLayoutTopLine size={14} />}
                          {block.type === 'messages' && <RemixIcons.RiMessage3Line size={14} />}
                          {block.type === 'input' && <RemixIcons.RiInputMethodLine size={14} />}
                          {block.type === 'container' && <RemixIcons.RiLayoutLine size={14} />}
                          {block.type === 'text' && <RemixIcons.RiText size={14} />}
                          {block.type === 'button' && <RemixIcons.RiCheckboxCircleLine size={14} />}
                          {block.type === 'divider' && <RemixIcons.RiSeparator size={14} />}
                          {block.type === 'branding' && <RemixIcons.RiSparklingLine size={14} />}
                          <span className="flex-1 font-medium uppercase">{block.type}</span>
                          {block.children && block.children.length > 0 && (
                            <span className="text-[10px] text-muted-foreground">({block.children.length})</span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete ${block.type} block?`)) deleteChatBlock(block.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                          >
                            <RemixIcons.RiDeleteBinLine size={12} className="text-destructive" />
                          </button>
                        </div>
                        {block.content && (
                          <div className="text-[10px] text-muted-foreground mt-1 truncate">{block.content}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Block Dropdown */}
                  <div className="pt-2 mt-2 border-t border-border/50">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block">Add Block:</label>
                    <div className="grid grid-cols-2 gap-1">
                      {(['header', 'messages', 'input', 'container', 'text', 'button', 'divider', 'branding'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => addChatBlock(null, type)}
                          className="px-2 py-1 text-[10px] bg-background border border-border hover:bg-primary/10 hover:border-primary rounded transition-colors capitalize"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted-foreground text-xs py-8">
                  <RemixIcons.RiLayoutMasonryLine size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No chat structure</p>
                  <p className="text-[10px] mt-1">Click "Init" or load a template</p>
                </div>
              )}
            </div>
          </div>

          {/* CENTER: Live Preview */}
          <div className="bg-gradient-to-br from-muted/20 to-background flex items-center justify-center p-6 overflow-auto">
            <div className="w-full max-w-md">
              <InteractiveChatPreview config={config} isOpen={true} setIsOpen={() => { }} isPreview={true} />
            </div>
          </div>

          {/* RIGHT: Properties Panel */}
          <div className="border-l border-border bg-background flex flex-col min-h-0 overflow-y-auto p-4 space-y-4">
            <h3 className="text-sm font-semibold">Chat Block Properties</h3>
            {selectedChatBlockId && config.chatStructure ? (
              (() => {
                const findBlock = (blocks: ChatBlock[]): ChatBlock | null => {
                  for (const b of blocks) {
                    if (b.id === selectedChatBlockId) return b;
                    if (b.children) {
                      const found = findBlock(b.children);
                      if (found) return found;
                    }
                  }
                  return null;
                };
                const block = findBlock(config.chatStructure);

                if (!block) return <p className="text-xs text-muted-foreground">Block not found</p>;

                return (
                  <div className="space-y-4">
                    {/* Block Type */}
                    <div>
                      <label className="text-xs font-medium block mb-1">Block Type</label>
                      <div className="px-3 py-2 bg-muted rounded text-xs font-mono uppercase">{block.type}</div>
                    </div>

                    {/* Content (for text, button, branding) */}
                    {(block.type === 'text' || block.type === 'button' || block.type === 'branding') && (
                      <div>
                        <label className="text-xs font-medium block mb-1">Content</label>
                        <input
                          type="text"
                          value={block.content || ''}
                          onChange={(e) => updateChatBlock(block.id, { content: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background"
                          placeholder="Enter text..."
                        />
                      </div>
                    )}

                    {/* Placeholder (for input) */}
                    {block.type === 'input' && (
                      <div>
                        <label className="text-xs font-medium block mb-1">Placeholder</label>
                        <input
                          type="text"
                          value={block.placeholder || ''}
                          onChange={(e) => updateChatBlock(block.id, { placeholder: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background"
                          placeholder="Type a message..."
                        />
                      </div>
                    )}

                    {/* Icon (for buttons) */}
                    {block.type === 'button' && (
                      <div>
                        <label className="text-xs font-medium block mb-1">Icon (Remix Icon name)</label>
                        <input
                          type="text"
                          value={block.icon || ''}
                          onChange={(e) => updateChatBlock(block.id, { icon: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background"
                          placeholder="RiSendPlaneFill"
                        />
                      </div>
                    )}

                    {/* onClick Action (for buttons) */}
                    {block.type === 'button' && (
                      <div>
                        <label className="text-xs font-medium block mb-1">onClick Action</label>
                        <select
                          value={block.onClick || 'send-message'}
                          onChange={(e) => updateChatBlock(block.id, { onClick: e.target.value as any })}
                          className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background"
                        >
                          <option value="send-message">Send Message</option>
                          <option value="close-chat">Close Chat</option>
                          <option value="open-url">Open URL</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    )}

                    {/* URL (if onClick is open-url) */}
                    {block.type === 'button' && block.onClick === 'open-url' && (
                      <div>
                        <label className="text-xs font-medium block mb-1">URL</label>
                        <input
                          type="text"
                          value={block.url || ''}
                          onChange={(e) => updateChatBlock(block.id, { url: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background"
                          placeholder="https://example.com"
                        />
                      </div>
                    )}

                    {/* Position (for header/branding) */}
                    {(block.type === 'header' || block.type === 'branding') && (
                      <div>
                        <label className="text-xs font-medium block mb-1">Position</label>
                        <select
                          value={block.position || 'top'}
                          onChange={(e) => updateChatBlock(block.id, { position: e.target.value as any })}
                          className="w-full px-2 py-1.5 text-xs border border-border rounded bg-background"
                        >
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    )}

                    {/* Mobile Hidden */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="mobileHidden"
                        checked={block.mobileHidden || false}
                        onChange={(e) => updateChatBlock(block.id, { mobileHidden: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <label htmlFor="mobileHidden" className="text-xs font-medium">Hide on Mobile</label>
                    </div>

                    {/* Style Editor */}
                    <div className="pt-3 border-t">
                      <label className="text-xs font-medium block mb-2">Styles</label>
                      <StyleEditor
                        style={block.style || {}}
                        onChange={(s) => updateChatBlock(block.id, { style: s })}
                        onHoverChange={(s) => updateChatBlock(block.id, { hoverStyle: s })}
                      />
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-xs text-muted-foreground">Select a block to edit its properties</p>
            )}
          </div>
        </div>
      ) : (
        // CHAT SETTINGS - Full width form
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Header Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Header Title</label>
                  <input
                    type="text"
                    value={config.headerTitle || ''}
                    onChange={(e) => onChange({ ...config, headerTitle: e.target.value })}
                    placeholder="Chat Support"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Header Subtitle</label>
                  <input
                    type="text"
                    value={config.headerSubtitle || ''}
                    onChange={(e) => onChange({ ...config, headerSubtitle: e.target.value })}
                    placeholder="We're online"
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Header Background</label>
                    <input
                      type="color"
                      value={ensureHex(config.headerBackgroundColor || '#ffffff')}
                      onChange={(e) => onChange({ ...config, headerBackgroundColor: e.target.value })}
                      className="w-full h-10 border border-input rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Header Text Color</label>
                    <input
                      type="color"
                      value={ensureHex(config.headerTextColor || '#000000')}
                      onChange={(e) => onChange({ ...config, headerTextColor: e.target.value })}
                      className="w-full h-10 border border-input rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Message Settings */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Messages</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Greeting Message</label>
                  <textarea
                    value={config.greeting || ''}
                    onChange={(e) => onChange({ ...config, greeting: e.target.value })}
                    placeholder="Hello! How can I help you today?"
                    rows={3}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Input Placeholder</label>
                  <input
                    type="text"
                    value={config.placeholder || ''}
                    onChange={(e) => onChange({ ...config, placeholder: e.target.value })}
                    placeholder="Type your message..."
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                  />
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Chat Window Size</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Width (px)</label>
                  <input
                    type="number"
                    value={config.chatWidth || 380}
                    onChange={(e) => onChange({ ...config, chatWidth: parseInt(e.target.value) || 380 })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Height (px)</label>
                  <input
                    type="number"
                    value={config.chatHeight || 650}
                    onChange={(e) => onChange({ ...config, chatHeight: parseInt(e.target.value) || 650 })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
