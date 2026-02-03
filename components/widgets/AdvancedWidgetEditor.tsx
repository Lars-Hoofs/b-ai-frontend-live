'use client';

import React, { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { LAUNCHER_TEMPLATES } from './launcherTemplates';
import { InteractiveChatPreview } from './InteractiveChatPreview';
import { motion, AnimatePresence } from 'framer-motion';
import * as RemixIcons from 'react-icons/ri';

// DND Kit Imports
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

export interface WidgetConfig {
  id?: string;
  workspaceId?: string;
  name: string;
  agentId?: string;
  widgetType?: 'bubble' | 'full-page' | 'embed';

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
  bubbleSize?: 'small' | 'medium' | 'large';
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
  imageIconRelation?: 'icon-only' | 'image-only' | 'image-bg-icon-overlay' | 'split';
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
  backgroundGradient?: string;
  backdropBlur?: number;
  borderWidth?: number;
  shadowIntensity?: number;
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
  workingHours?: any; // Complex object
  holidays?: any; // Complex object

  // Branding
  showBranding?: boolean;
  brandingText?: string;
  brandingUrl?: string;

  // Advanced Launcher Builder
  launcherMode?: 'simple' | 'advanced';
  launcherStructure?: LauncherBlock[];

  // Custom CSS
  customCss?: string;
}

// --- Helper Components ---

// 1. Structure Item (Sortable)
function StructureItem({ block, isSelected, onSelect, onDelete }: { block: LauncherBlock, isSelected: boolean, onSelect: () => void, onDelete: () => void }) {
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
        onClick={(e) => { e.stopPropagation(); onSelect(); }}
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
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-muted-foreground hover:text-destructive p-1 rounded hover:bg-destructive/10"
        >
          <RemixIcons.RiDeleteBinLine size={14} />
        </button>
      </div>
      {block.children && (
        <div className="ml-4 pl-2 border-l border-border/50 mt-1">
          {block.children.map(child => (
            <StructureItem
              key={child.id}
              block={child}
              isSelected={false} // Nested selection logic needs separate handling
              onSelect={() => onSelect()} // Simplified for MVP
              onDelete={() => onDelete()}
            />
          ))}
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
    const newStyle = { ...currentStyle, [key]: value };
    if (value === '' || value === null || value === undefined) delete (newStyle as any)[key];
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

  // Auto-select first block on load if present
  useEffect(() => {
    if (config.launcherStructure && config.launcherStructure.length > 0 && !selectedBlockId) {
      setSelectedBlockId(config.launcherStructure[0].id);
    }
  }, [config.launcherStructure]);

  const updateStructure = (newStructure: LauncherBlock[]) => {
    onChange({ ...config, launcherStructure: newStructure });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // Implementing ROOT LEVEL reorder.
      const oldIndex = (config.launcherStructure || []).findIndex(b => b.id === active.id);
      const newIndex = (config.launcherStructure || []).findIndex(b => b.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        updateStructure(arrayMove(config.launcherStructure!, oldIndex, newIndex));
      }
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
      return blocks.filter(b => b.id !== id).map(b => ({
        ...b,
        children: b.children ? deleteRecursive(b.children) : undefined
      }));
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <div className="h-full flex flex-col bg-background text-foreground overflow-hidden border rounded-xl shadow-sm">
      {/* Toolbar / Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-muted/20 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Launcher Builder</span>
          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20">Advanced</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground uppercase font-bold mr-1">Load Template:</span>
          <div className="flex bg-background border border-border rounded-md p-1">
            {LAUNCHER_TEMPLATES.map(t => (
              <button
                key={t.id}
                className="px-3 py-1 text-xs hover:bg-muted rounded transition-colors"
                onClick={() => updateStructure(t.structure)}
                title={t.description}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
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
                      onDelete={() => deleteBlock(block.id)}
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
        <div className="bg-[#f0f0f0] dark:bg-[#111] relative flex items-center justify-center overflow-hidden">
          {/* Pattern Background */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.1]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          {/* Preview Area */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-8 pointer-events-none">
            <div className="pointer-events-auto relative">
              {/* Simplified View for Editor Mode */}
              <div className="relative cursor-pointer" onClick={() => { /* Could implement click-to-select from preview */ }}>
                <InteractiveChatPreview
                  config={config}
                  isOpen={false}
                  setIsOpen={() => { }}
                />
              </div>
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
    </div>
  );
}
