'use client';

import React, { useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { LAUNCHER_TEMPLATES } from '../launcherTemplates';
import { DEFAULT_CHAT_STRUCTURE, CHAT_TEMPLATES } from '../chatTemplates';
import { InteractiveChatPreview } from '../InteractiveChatPreview';
import { motion, AnimatePresence } from 'framer-motion';
import * as RemixIcons from 'react-icons/ri';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ChatSettingsPanel from './ChatSettingsPanel';
import { WidgetConfig, LauncherBlock, ChatBlock, ensureHex } from './types';

export type { WidgetConfig, LauncherBlock, ChatBlock };

// ─── Sortable Structure Item ─────────────────────────────────────────
function StructureItem({ block, selectedBlockId, onSelectBlock, onDeleteBlock, onDuplicateBlock }: {
    block: LauncherBlock; selectedBlockId: string | null;
    onSelectBlock: (id: string) => void; onDeleteBlock: (id: string) => void; onDuplicateBlock: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
    const isSelected = selectedBlockId === block.id;
    const style = { transform: CSS.Transform.toString(transform), transition };
    const typeIcons: Record<string, React.ReactNode> = {
        icon: <RemixIcons.RiStarLine size={13} />, text: <RemixIcons.RiText size={13} />,
        image: <RemixIcons.RiImageLine size={13} />, row: <RemixIcons.RiLayoutRowLine size={13} />,
        column: <RemixIcons.RiLayoutColumnLine size={13} />, container: <RemixIcons.RiLayoutLine size={13} />,
        split: <RemixIcons.RiLayoutLeftLine size={13} />, status: <RemixIcons.RiRecordCircleFill size={13} className="text-green-500" />
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-0.5">
            <div className={`group flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs border cursor-pointer select-none transition-all duration-200
        ${isSelected
                    ? 'bg-gradient-to-r from-primary/15 to-primary/5 border-primary/40 text-primary font-medium shadow-[0_0_12px_rgba(99,102,241,0.1)]'
                    : 'bg-card/50 border-border/30 hover:bg-muted/50 hover:border-border/60'}`}
                onClick={(e) => { e.stopPropagation(); onSelectBlock(block.id); }}
                {...attributes} {...listeners}
            >
                <span className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab"><RemixIcons.RiDraggable size={14} /></span>
                <span className="text-muted-foreground/70">{typeIcons[block.type] || <RemixIcons.RiLayoutLine size={13} />}</span>
                <span className="flex-1 truncate text-[11px] tracking-wide">
                    {block.type.toUpperCase()}
                    {block.content && <span className="text-muted-foreground/50 ml-1 font-normal">• {block.content.substring(0, 12)}</span>}
                </span>
                <button onClick={(e) => { e.stopPropagation(); onDuplicateBlock(block.id); }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-primary p-0.5 rounded transition-all" title="Duplicate">
                    <RemixIcons.RiFileCopyLine size={12} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-red-400 p-0.5 rounded transition-all" title="Delete">
                    <RemixIcons.RiDeleteBinLine size={12} />
                </button>
            </div>
            {block.children && (
                <div className="ml-3 pl-2.5 border-l border-border/20 mt-0.5">
                    <SortableContext items={block.children.map(b => b.id)} strategy={verticalListSortingStrategy}>
                        {block.children.map(child => (
                            <StructureItem key={child.id} block={child} selectedBlockId={selectedBlockId}
                                onSelectBlock={onSelectBlock} onDeleteBlock={onDeleteBlock} onDuplicateBlock={onDuplicateBlock} />
                        ))}
                    </SortableContext>
                </div>
            )}
        </div>
    );
}

// ─── Sortable Chat Structure Item ─────────────────────────────────────────
function ChatStructureItem({ block, selectedChatBlockId, onSelectBlock, onDeleteBlock, onDuplicateBlock }: {
    block: ChatBlock; selectedChatBlockId: string | null;
    onSelectBlock: (id: string) => void; onDeleteBlock: (id: string) => void; onDuplicateBlock: (id: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
    const isSelected = selectedChatBlockId === block.id;
    const style = { transform: CSS.Transform.toString(transform), transition };

    const icons: Record<string, React.ReactNode> = {
        header: <RemixIcons.RiLayoutTopLine size={13} />, messages: <RemixIcons.RiMessage3Line size={13} />,
        input: <RemixIcons.RiInputMethodLine size={13} />, container: <RemixIcons.RiLayoutLine size={13} />,
        text: <RemixIcons.RiText size={13} />, button: <RemixIcons.RiCheckboxCircleLine size={13} />,
        divider: <RemixIcons.RiSeparator size={13} />, branding: <RemixIcons.RiSparklingLine size={13} />,
        icon: <RemixIcons.RiStarLine size={13} />, image: <RemixIcons.RiImageLine size={13} />,
        split: <RemixIcons.RiLayoutLeftLine size={13} />, status: <RemixIcons.RiRecordCircleFill size={13} className="text-green-500" />
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-0.5">
            <div className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs border cursor-pointer select-none transition-all duration-200 group
                ${isSelected
                    ? 'bg-gradient-to-r from-primary/15 to-primary/5 border-primary/40 text-primary font-medium shadow-[0_0_12px_rgba(99,102,241,0.1)]'
                    : 'bg-card/50 border-border/30 hover:bg-muted/50 hover:border-border/60'}`}
                onClick={(e) => { e.stopPropagation(); onSelectBlock(block.id); }}
                {...attributes} {...listeners}
            >
                <span className="text-muted-foreground/40 hover:text-muted-foreground cursor-grab"><RemixIcons.RiDraggable size={14} /></span>
                <span className="text-muted-foreground/70">{icons[block.type] || <RemixIcons.RiLayoutLine size={13} />}</span>
                <span className="flex-1 truncate text-[11px] font-semibold tracking-wide uppercase">
                    {block.type}
                    {block.content && <span className="text-muted-foreground/50 ml-1 font-normal capitalize tracking-normal">• {block.content.length > 15 ? block.content.substring(0, 15) + '...' : block.content}</span>}
                </span>
                <button onClick={(e) => { e.stopPropagation(); onDeleteBlock(block.id); }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-red-400 p-0.5 rounded transition-all">
                    <RemixIcons.RiDeleteBinLine size={12} />
                </button>
            </div>
            {block.children && (
                <div className="ml-3 pl-2.5 border-l border-border/20 mt-0.5">
                    <SortableContext items={block.children.map(b => b.id)} strategy={verticalListSortingStrategy}>
                        {block.children.map(child => (
                            <ChatStructureItem key={child.id} block={child} selectedChatBlockId={selectedChatBlockId}
                                onSelectBlock={onSelectBlock} onDeleteBlock={onDeleteBlock} onDuplicateBlock={onDuplicateBlock} />
                        ))}
                    </SortableContext>
                </div>
            )}
        </div>
    );
}

// ─── Background Editor ───────────────────────────────────────────────
type BgMode = 'solid' | 'linear' | 'radial' | 'image' | 'glass' | 'none';

function detectBgMode(style: React.CSSProperties): BgMode {
    const bg = style.background as string || '';
    const bgImage = style.backgroundImage as string || '';
    if (style.backdropFilter) return 'glass';
    if (bg.startsWith('linear-gradient') || bgImage.startsWith('linear-gradient')) return 'linear';
    if (bg.startsWith('radial-gradient') || bgImage.startsWith('radial-gradient')) return 'radial';
    if (bgImage.startsWith('url(') || bg.startsWith('url(')) return 'image';
    if (!style.backgroundColor && !bg && !bgImage && !style.backdropFilter) return 'none';
    return 'solid';
}

function BackgroundEditor({ style, onChange }: { style: React.CSSProperties; onChange: (patch: Partial<React.CSSProperties>) => void }) {
    const mode = detectBgMode(style);
    const [activeMode, setActiveMode] = useState<BgMode>(mode);

    // Parse existing gradient colors if present
    const existingBg = (style.background as string) || (style.backgroundImage as string) || '';
    const parseGradientColors = (s: string): [string, string, string] => {
        const m = s.match(/gradient\((.*?)\)$/);
        if (!m) return ['135deg', '#6366f1', '#8b5cf6'];
        const parts = m[1].split(',').map(p => p.trim());
        const angle = parts[0].includes('deg') ? parts[0] : '135deg';
        const c1 = parts.find(p => p.startsWith('#') || p.startsWith('rgb')) || '#6366f1';
        const c2 = parts.filter(p => p.startsWith('#') || p.startsWith('rgb'))[1] || '#8b5cf6';
        return [angle, c1, c2];
    };
    const [gAngle, gFrom, gTo] = parseGradientColors(existingBg);
    const [gradAngle, setGradAngle] = useState(parseInt(gAngle) || 135);
    const [gradFrom, setGradFrom] = useState(gFrom);
    const [gradTo, setGradTo] = useState(gTo);
    const [imgUrl, setImgUrl] = useState(() => { const m = existingBg.match(/url\(["']?(.*?)["']?\)/); return m ? m[1] : ''; });
    const [glassBlur, setGlassBlur] = useState(() => { const m = String(style.backdropFilter || '').match(/blur\((\d+)px/); return m ? parseInt(m[1]) : 8; });
    const [glassColor, setGlassColor] = useState((style.backgroundColor as string) || 'rgba(255,255,255,0.1)');
    const [solidColor, setSolidColor] = useState((style.backgroundColor as string) || '#ffffff');

    const applyMode = (m: BgMode) => {
        setActiveMode(m);
        if (m === 'none') onChange({ backgroundColor: undefined, background: undefined, backgroundImage: undefined, backdropFilter: undefined });
        else if (m === 'solid') onChange({ backgroundColor: solidColor, background: undefined, backgroundImage: undefined, backdropFilter: undefined });
        else if (m === 'linear') onChange({ background: `linear-gradient(${gradAngle}deg, ${gradFrom}, ${gradTo})`, backgroundColor: undefined, backgroundImage: undefined, backdropFilter: undefined });
        else if (m === 'radial') onChange({ background: `radial-gradient(circle at center, ${gradFrom}, ${gradTo})`, backgroundColor: undefined, backgroundImage: undefined, backdropFilter: undefined });
        else if (m === 'image') onChange({ backgroundImage: `url("${imgUrl}")`, backgroundSize: (style.backgroundSize as string) || 'cover', backgroundPosition: (style.backgroundPosition as string) || 'center', backgroundColor: undefined, background: undefined, backdropFilter: undefined });
        else if (m === 'glass') onChange({ backdropFilter: `blur(${glassBlur}px)`, WebkitBackdropFilter: `blur(${glassBlur}px)`, backgroundColor: glassColor, background: undefined, backgroundImage: undefined });
    };

    const updateGradient = (angle: number, from: string, to: string, type: 'linear' | 'radial') => {
        if (type === 'linear') onChange({ background: `linear-gradient(${angle}deg, ${from}, ${to})`, backgroundColor: undefined, backgroundImage: undefined });
        else onChange({ background: `radial-gradient(circle at center, ${from}, ${to})`, backgroundColor: undefined, backgroundImage: undefined });
    };

    const PRESETS = [
        { label: '↗', value: 45 }, { label: '→', value: 90 }, { label: '↘', value: 135 },
        { label: '↓', value: 180 }, { label: '↙', value: 225 }, { label: '←', value: 270 }
    ];

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Fill Type</label>
            <div className="grid grid-cols-3 gap-1">
                {(['solid', 'linear', 'radial', 'image', 'glass', 'none'] as BgMode[]).map(m => (
                    <button key={m} onClick={() => applyMode(m)}
                        className={`text-[9px] py-1.5 px-1 rounded-md font-semibold uppercase tracking-wider transition-all border ${activeMode === m ? 'bg-primary text-primary-foreground border-primary' : 'border-border/40 text-muted-foreground hover:border-primary/40'
                            }`}>
                        {m === 'linear' ? 'Linear ∇' : m === 'radial' ? 'Radial ◎' : m === 'glass' ? '⬜ Glass' : m === 'image' ? '🖼 Image' : m === 'none' ? '∅ None' : '■ Solid'}
                    </button>
                ))}
            </div>

            {activeMode === 'solid' && (
                <div className="flex gap-1 items-center">
                    <input type="color" value={solidColor.startsWith('#') ? solidColor : '#ffffff'} onChange={e => { setSolidColor(e.target.value); onChange({ backgroundColor: e.target.value, background: undefined }); }}
                        className="w-8 h-8 rounded-lg border border-border/40 p-0 cursor-pointer flex-shrink-0" />
                    <input type="text" value={solidColor} onChange={e => { setSolidColor(e.target.value); onChange({ backgroundColor: e.target.value, background: undefined }); }}
                        placeholder="#fff or rgba(...)" className="flex-1 text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 outline-none" />
                </div>
            )}

            {(activeMode === 'linear' || activeMode === 'radial') && (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[9px] text-muted-foreground/60 uppercase">From</label>
                            <div className="flex gap-1">
                                <input type="color" value={gradFrom.startsWith('#') ? gradFrom : '#6366f1'} onChange={e => { setGradFrom(e.target.value); updateGradient(gradAngle, e.target.value, gradTo, activeMode as any); }}
                                    className="w-7 h-7 rounded-md border border-border/40 p-0 cursor-pointer" />
                                <input type="text" value={gradFrom} onChange={e => { setGradFrom(e.target.value); updateGradient(gradAngle, e.target.value, gradTo, activeMode as any); }}
                                    className="flex-1 text-[10px] px-1.5 py-1 rounded-lg border border-border/40 bg-muted/20 outline-none" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] text-muted-foreground/60 uppercase">To</label>
                            <div className="flex gap-1">
                                <input type="color" value={gradTo.startsWith('#') ? gradTo : '#8b5cf6'} onChange={e => { setGradTo(e.target.value); updateGradient(gradAngle, gradFrom, e.target.value, activeMode as any); }}
                                    className="w-7 h-7 rounded-md border border-border/40 p-0 cursor-pointer" />
                                <input type="text" value={gradTo} onChange={e => { setGradTo(e.target.value); updateGradient(gradAngle, gradFrom, e.target.value, activeMode as any); }}
                                    className="flex-1 text-[10px] px-1.5 py-1 rounded-lg border border-border/40 bg-muted/20 outline-none" />
                            </div>
                        </div>
                    </div>
                    {activeMode === 'linear' && (
                        <div className="space-y-1">
                            <label className="text-[9px] text-muted-foreground/60 uppercase">Angle ({gradAngle}°)</label>
                            <input type="range" min="0" max="360" value={gradAngle} onChange={e => { const a = parseInt(e.target.value); setGradAngle(a); updateGradient(a, gradFrom, gradTo, 'linear'); }}
                                className="w-full" />
                            <div className="flex gap-1">
                                {PRESETS.map(p => (
                                    <button key={p.value} onClick={() => { setGradAngle(p.value); updateGradient(p.value, gradFrom, gradTo, 'linear'); }}
                                        className="flex-1 text-[10px] py-1 rounded border border-border/40 hover:border-primary/40 transition-all">{p.label}</button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="h-6 rounded-lg" style={{ background: activeMode === 'linear' ? `linear-gradient(${gradAngle}deg, ${gradFrom}, ${gradTo})` : `radial-gradient(circle at center, ${gradFrom}, ${gradTo})` }} />
                </div>
            )}

            {activeMode === 'image' && (
                <div className="space-y-2">
                    <input type="text" value={imgUrl} onChange={e => { setImgUrl(e.target.value); onChange({ backgroundImage: `url("${e.target.value}")`, background: undefined }); }}
                        placeholder="https://... or /path/to/image.jpg" className="w-full text-[11px] px-2.5 py-2 rounded-lg border border-border/40 bg-muted/20 outline-none" />
                    <div className="grid grid-cols-3 gap-1">
                        {(['cover', 'contain', 'auto', '100% 100%', '50%', 'repeat'] as const).map(s => (
                            <button key={s} onClick={() => onChange({ backgroundSize: s === 'repeat' ? undefined : s, backgroundRepeat: s === 'repeat' ? 'repeat' : 'no-repeat' })}
                                className={`text-[9px] py-1 rounded border transition-all ${(style.backgroundSize === s || (s === 'repeat' && style.backgroundRepeat === 'repeat'))
                                    ? 'bg-primary text-primary-foreground border-primary' : 'border-border/40 text-muted-foreground hover:border-primary/40'
                                    }`}>{s}</button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                        {(['center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left'].map(pos => (
                            <button key={pos} onClick={() => onChange({ backgroundPosition: pos })}
                                className={`text-[9px] py-1 rounded border transition-all ${style.backgroundPosition === pos ? 'bg-primary text-primary-foreground border-primary' : 'border-border/40 text-muted-foreground hover:border-primary/40'
                                    }`}>{pos}</button>
                        )))}
                    </div>
                </div>
            )}

            {activeMode === 'glass' && (
                <div className="space-y-2">
                    <div className="space-y-1">
                        <label className="text-[9px] text-muted-foreground/60 uppercase">Blur ({glassBlur}px)</label>
                        <input type="range" min="0" max="40" value={glassBlur} onChange={e => { const b = parseInt(e.target.value); setGlassBlur(b); onChange({ backdropFilter: `blur(${b}px)`, WebkitBackdropFilter: `blur(${b}px)` }); }}
                            className="w-full" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] text-muted-foreground/60 uppercase">Overlay Color</label>
                        <input type="text" value={glassColor} onChange={e => { setGlassColor(e.target.value); onChange({ backgroundColor: e.target.value }); }}
                            placeholder="rgba(255,255,255,0.1)" className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 outline-none" />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Style Editor ────────────────────────────────────────────────────
function StyleEditor({ style, hoverStyle, onChange, onHoverChange }: {
    style: React.CSSProperties; hoverStyle?: React.CSSProperties;
    onChange: (s: React.CSSProperties) => void; onHoverChange?: (s: React.CSSProperties) => void;
}) {
    const [mode, setMode] = useState<'normal' | 'hover'>('normal');
    const current = mode === 'normal' ? style : (hoverStyle || {});
    const update = mode === 'normal' ? onChange : (onHoverChange || (() => { }));

    const set = (key: keyof React.CSSProperties, value: any) => {
        let v = value;
        if ((key.toLowerCase().includes('color') || key.toLowerCase().includes('background')) && typeof value === 'string' && value.startsWith('#'))
            v = ensureHex(value);
        const newStyle = { ...current, [key]: v };
        if (v === '' || v === null || v === undefined) delete (newStyle as any)[key];
        update(newStyle);
    };

    return (
        <div className="space-y-3">
            <div className="flex bg-muted/30 p-0.5 rounded-lg">
                {(['normal', 'hover'] as const).map(m => (
                    <button key={m} onClick={() => setMode(m)}
                        className={`flex-1 text-[10px] py-1.5 rounded-md font-semibold uppercase tracking-wider transition-all
              ${mode === m ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                        {m}
                    </button>
                ))}
            </div>

            <div className="space-y-2.5">
                {/* Size */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Width</label>
                        <input type="text" value={current.width || ''} onChange={e => set('width', e.target.value)} placeholder="auto"
                            className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 focus:border-primary/40 outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Height</label>
                        <input type="text" value={current.height || ''} onChange={e => set('height', e.target.value)} placeholder="auto"
                            className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 focus:border-primary/40 outline-none" />
                    </div>
                </div>

                {/* Spacing */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Padding</label>
                        <input type="text" value={current.padding || ''} onChange={e => set('padding', e.target.value)} placeholder="0"
                            className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 focus:border-primary/40 outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Margin</label>
                        <input type="text" value={current.margin || ''} onChange={e => set('margin', e.target.value)} placeholder="0"
                            className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 focus:border-primary/40 outline-none" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Gap</label>
                        <input type="text" value={current.gap || ''} onChange={e => set('gap', e.target.value)} placeholder="0"
                            className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 focus:border-primary/40 outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Opacity</label>
                        <input type="number" min="0" max="1" step="0.05" value={current.opacity !== undefined ? (current.opacity as number) : ''} onChange={e => set('opacity', e.target.value ? parseFloat(e.target.value) : undefined as any)} placeholder="1"
                            className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 focus:border-primary/40 outline-none" />
                    </div>
                </div>

                {/* Colors */}
                <div className="pt-2 border-t border-border/20 space-y-2">
                    <BackgroundEditor style={current} onChange={patch => update({ ...current, ...patch })} />
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Text Color</label>
                        <div className="flex gap-1">
                            <input type="color" value={(current.color as string) || '#000000'} onChange={e => set('color', e.target.value)}
                                className="w-7 h-7 rounded-md border border-border/40 p-0 cursor-pointer" />
                            <input type="text" value={(current.color as string) || ''} onChange={e => set('color', e.target.value)}
                                className="flex-1 text-[11px] px-2 py-1 rounded-lg border border-border/40 bg-muted/20 outline-none" placeholder="#000 or rgba(...)" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Border Radius</label>
                        <input type="text" value={(current.borderRadius as string) || ''} onChange={e => set('borderRadius', e.target.value)} placeholder="8px"
                            className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 focus:border-primary/40 outline-none" />
                    </div>
                </div>

                {/* Typography */}
                <div className="pt-2 border-t border-border/20 space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Typography</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[10px] text-muted-foreground/60">Font Size</label>
                            <input type="text" value={(current.fontSize as string) || ''} onChange={e => set('fontSize', e.target.value)} placeholder="14px"
                                className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-muted-foreground/60">Font Weight</label>
                            <select value={(current.fontWeight as string) || ''} onChange={e => set('fontWeight', e.target.value)}
                                className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 outline-none">
                                <option value="">Default</option>
                                <option value="300">Light</option>
                                <option value="400">Normal</option>
                                <option value="500">Medium</option>
                                <option value="600">Semibold</option>
                                <option value="700">Bold</option>
                                <option value="800">ExtraBold</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[10px] text-muted-foreground/60">Line Height</label>
                            <input type="text" value={(current.lineHeight as string) || ''} onChange={e => set('lineHeight', e.target.value)} placeholder="1.5"
                                className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 outline-none" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-muted-foreground/60">Text Align</label>
                            <select value={(current.textAlign as string) || ''} onChange={e => set('textAlign', e.target.value)}
                                className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 outline-none">
                                <option value="">Default</option>
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground/60">Font Family</label>
                        <select value={(current.fontFamily as string) || ''} onChange={e => set('fontFamily', e.target.value)}
                            className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 outline-none">
                            <option value="">Inherit</option>
                            <option value="Inter, sans-serif">Inter</option>
                            <option value="Roboto, sans-serif">Roboto</option>
                            <option value="Poppins, sans-serif">Poppins</option>
                            <option value="-apple-system, sans-serif">SF Pro</option>
                            <option value="monospace">Monospace</option>
                        </select>
                    </div>
                </div>

                {/* Border & Shadow */}
                <div className="pt-2 border-t border-border/20 space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Border & Shadow</label>
                    <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground/60">Border</label>
                        <input type="text" value={(current.border as string) || ''} onChange={e => set('border', e.target.value)} placeholder="1px solid #ccc"
                            className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 outline-none" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-muted-foreground/60">Box Shadow</label>
                        <input type="text" value={(current.boxShadow as string) || ''} onChange={e => set('boxShadow', e.target.value)} placeholder="0 2px 8px rgba(0,0,0,0.1)"
                            className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 outline-none" />
                    </div>
                </div>

                {/* Flex Layout */}
                <div className="pt-2 border-t border-border/20 space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Flex Layout</label>
                    <div className="grid grid-cols-2 gap-2">
                        <select value={(current.display as string) || 'block'} onChange={e => set('display', e.target.value)}
                            className="text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 outline-none">
                            <option value="block">Block</option><option value="flex">Flex</option><option value="inline-flex">Inline Flex</option><option value="inline">Inline</option><option value="none">Hidden</option>
                        </select>
                        <select value={(current.flexDirection as string) || 'row'} onChange={e => set('flexDirection', e.target.value)}
                            className="text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 outline-none">
                            <option value="row">Row →</option><option value="column">Column ↓</option><option value="row-reverse">Row ←</option><option value="column-reverse">Column ↑</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <select value={(current.alignItems as string) || ''} onChange={e => set('alignItems', e.target.value)}
                            className="text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 outline-none">
                            <option value="">Align: Auto</option><option value="stretch">Stretch</option><option value="center">Center</option><option value="flex-start">Start</option><option value="flex-end">End</option>
                        </select>
                        <select value={(current.justifyContent as string) || ''} onChange={e => set('justifyContent', e.target.value)}
                            className="text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 outline-none">
                            <option value="">Justify: Auto</option><option value="flex-start">Start</option><option value="center">Center</option><option value="space-between">Between</option><option value="flex-end">End</option>
                        </select>
                    </div>
                </div>

                {/* Misc */}
                <div className="pt-2 border-t border-border/20 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Overflow</label>
                            <select value={(current.overflow as string) || ''} onChange={e => set('overflow', e.target.value)}
                                className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 outline-none">
                                <option value="">Default</option><option value="hidden">Hidden</option><option value="auto">Auto</option><option value="scroll">Scroll</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Cursor</label>
                            <select value={(current.cursor as string) || ''} onChange={e => set('cursor', e.target.value)}
                                className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 outline-none">
                                <option value="">Default</option><option value="pointer">Pointer</option><option value="text">Text</option><option value="not-allowed">Disabled</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



// ─── Properties Panel ────────────────────────────────────────────────
function PropertiesPanel({ blockId, config, onUpdateBlock }: {
    blockId: string | null; config: WidgetConfig; onUpdateBlock: (id: string, updates: Partial<LauncherBlock>) => void;
}) {
    const findBlock = (blocks: LauncherBlock[]): LauncherBlock | undefined => {
        for (const b of blocks) {
            if (b.id === blockId) return b;
            if (b.children) { const f = findBlock(b.children); if (f) return f; }
        }
        return undefined;
    };
    const block = blockId ? findBlock(config.launcherStructure || []) : null;

    if (!block) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center mb-3">
                    <RemixIcons.RiCursorLine size={24} className="text-primary/40" />
                </div>
                <h3 className="text-sm font-semibold text-foreground/70 mb-1">No Selection</h3>
                <p className="text-[11px] text-muted-foreground max-w-[180px]">Click a block in the layer tree to edit its properties</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-y-auto">
            <div className="p-3.5 border-b border-border/30 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <h2 className="text-xs font-semibold flex items-center gap-2">
                    <span className="uppercase text-[9px] bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary px-2 py-0.5 rounded-md font-bold tracking-wider">{block.type}</span>
                    Properties
                </h2>
            </div>

            <div className="p-3.5 space-y-5">
                {/* Content */}
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Type / Content</label>
                    <select value={block.type} onChange={e => onUpdateBlock(block.id, { type: e.target.value as any })}
                        className="w-full text-[11px] px-2.5 py-2 rounded-lg border border-border/40 bg-muted/20 outline-none">
                        <option value="container">Container (Box)</option><option value="row">Row</option><option value="column">Column</option>
                        <option value="text">Text</option><option value="icon">Icon</option><option value="image">Image</option>
                        <option value="split">Split Layout</option><option value="status">Status Dot</option>
                    </select>

                    {block.type === 'split' && (
                        <div className="pt-2">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Left Column Width ({block.splitRatio || 50}%)</label>
                            <input type="range" min="10" max="90" value={block.splitRatio || 50} onChange={e => onUpdateBlock(block.id, { splitRatio: parseInt(e.target.value) })}
                                className="w-full mt-1" />
                        </div>
                    )}

                    {block.type === 'status' && (
                        <div className="pt-2">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Status Indicator</label>
                            <select value={block.statusType || 'online'} onChange={e => onUpdateBlock(block.id, { statusType: e.target.value as any })}
                                className="w-full text-[11px] px-2.5 py-2 mt-1 rounded-lg border border-border/40 bg-muted/20 outline-none">
                                <option value="online">Online (Green)</option>
                                <option value="away">Away (Yellow)</option>
                                <option value="offline">Offline (Gray)</option>
                            </select>
                        </div>
                    )}

                    {(['text', 'icon', 'image'] as const).includes(block.type as any) && (
                        <div className="pt-2">
                            <input type="text" value={block.content || ''} onChange={e => onUpdateBlock(block.id, { content: e.target.value })}
                                placeholder={block.type === 'icon' ? 'RiChat3Line' : block.type === 'image' ? 'https://...' : 'Text...'}
                                className="w-full text-[11px] px-2.5 py-2 rounded-lg border border-border/40 bg-muted/20 focus:border-primary/40 outline-none" />
                        </div>
                    )}
                </div>

                {/* Interaction */}
                <div className="space-y-2 pt-3 border-t border-border/20">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Interaction</label>
                    <select value={block.onClick || 'toggle-chat'} onChange={e => onUpdateBlock(block.id, { onClick: e.target.value as any })}
                        className="w-full text-[11px] px-2.5 py-2 rounded-lg border border-border/40 bg-muted/20 outline-none">
                        <option value="toggle-chat">Toggle Chat</option><option value="open-chat">Open Chat</option>
                        <option value="open-link">Open Link</option><option value="email">Email</option><option value="phone">Phone</option>
                    </select>
                    {(['open-link', 'email', 'phone'] as const).includes(block.onClick as any) && (
                        <input type="text" value={block.linkUrl || ''} onChange={e => onUpdateBlock(block.id, { linkUrl: e.target.value })}
                            placeholder="URL / mailto: / tel:" className="w-full text-[11px] px-2.5 py-2 rounded-lg border border-border/40 bg-muted/20 outline-none" />
                    )}
                    <label className="flex items-center gap-2 text-[11px] pt-1">
                        <input type="checkbox" checked={block.mobileHidden || false} onChange={e => onUpdateBlock(block.id, { mobileHidden: e.target.checked })}
                            className="rounded border-border/50 w-3.5 h-3.5" />
                        Hide on Mobile
                    </label>
                </div>

                {/* Style Editor */}
                <div className="pt-3 border-t border-border/20">
                    <StyleEditor style={block.style || {}} hoverStyle={block.hoverStyle}
                        onChange={s => onUpdateBlock(block.id, { style: s })}
                        onHoverChange={s => onUpdateBlock(block.id, { hoverStyle: s })} />
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════
// ─── MAIN EDITOR COMPONENT ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════
export default function AdvancedWidgetEditor({ config, onChange }: { config: WidgetConfig; onChange: (c: WidgetConfig) => void }) {
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'launcher' | 'chat-builder' | 'chat-settings'>('launcher');
    const [selectedChatBlockId, setSelectedChatBlockId] = useState<string | null>(null);

    // ── Undo / Redo ──
    const historyRef = React.useRef<WidgetConfig[]>([config]);
    const historyIndexRef = React.useRef(0);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const pushHistory = React.useCallback((newConfig: WidgetConfig) => {
        const h = historyRef.current.slice(0, historyIndexRef.current + 1);
        h.push(newConfig);
        if (h.length > 50) h.shift();
        historyRef.current = h;
        historyIndexRef.current = h.length - 1;
        setCanUndo(historyIndexRef.current > 0);
        setCanRedo(false);
        onChange(newConfig);
    }, [onChange]);

    const undo = React.useCallback(() => {
        if (historyIndexRef.current > 0) {
            historyIndexRef.current--;
            const c = historyRef.current[historyIndexRef.current];
            setCanUndo(historyIndexRef.current > 0);
            setCanRedo(true);
            onChange(c);
        }
    }, [onChange]);

    const redo = React.useCallback(() => {
        if (historyIndexRef.current < historyRef.current.length - 1) {
            historyIndexRef.current++;
            const c = historyRef.current[historyIndexRef.current];
            setCanUndo(true);
            setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
            onChange(c);
        }
    }, [onChange]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
            if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); }
            if ((e.metaKey || e.ctrlKey) && e.key === 'y') { e.preventDefault(); redo(); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [undo, redo]);

    useEffect(() => {
        if (config.launcherStructure?.length && !selectedBlockId) setSelectedBlockId(config.launcherStructure[0].id);
    }, [config.launcherStructure]);

    // ── Launcher CRUD ──
    const updateStructure = (s: LauncherBlock[]) => pushHistory({ ...config, launcherStructure: s });

    const findContainer = (id: string, items: LauncherBlock[]): LauncherBlock[] | undefined => {
        if (items.some(i => i.id === id)) return items;
        for (const item of items) {
            if (item.children) { const f = findContainer(id, item.children); if (f) return f; }
        }
        return undefined;
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const ac = findContainer(active.id as string, config.launcherStructure || []);
        const oc = findContainer(over.id as string, config.launcherStructure || []);
        if (ac && oc) {
            const oi = ac.findIndex(b => b.id === active.id), ni = oc.findIndex(b => b.id === over.id);
            const ns = JSON.parse(JSON.stringify(config.launcherStructure));
            const fac = findContainer(active.id as string, ns)!;
            const foc = findContainer(over.id as string, ns)!;
            const [moved] = fac.splice(oi, 1);
            foc.splice(ni, 0, moved);
            updateStructure(ns);
        }
    };

    const findChatContainer = (id: string, items: ChatBlock[]): ChatBlock[] | undefined => {
        if (items.some(i => i.id === id)) return items;
        for (const item of items) {
            if (item.children) { const f = findChatContainer(id, item.children); if (f) return f; }
        }
        return undefined;
    };

    const handleChatDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const ac = findChatContainer(active.id as string, config.chatStructure || []);
        const oc = findChatContainer(over.id as string, config.chatStructure || []);
        if (ac && oc) {
            const oi = ac.findIndex(b => b.id === active.id), ni = oc.findIndex(b => b.id === over.id);
            const ns = JSON.parse(JSON.stringify(config.chatStructure));
            const fac = findChatContainer(active.id as string, ns)!;
            const foc = findChatContainer(over.id as string, ns)!;
            const [moved] = fac.splice(oi, 1);
            foc.splice(ni, 0, moved);
            updateChatStructure(ns);
        }
    };

    const updateBlock = (id: string, updates: Partial<LauncherBlock>) => {
        const rec = (blocks: LauncherBlock[]): LauncherBlock[] =>
            blocks.map(b => b.id === id ? { ...b, ...updates } : b.children ? { ...b, children: rec(b.children) } : b);
        updateStructure(rec(config.launcherStructure || []));
    };

    const deleteBlock = (id: string) => {
        const rec = (blocks: LauncherBlock[]): LauncherBlock[] =>
            blocks.filter(b => b.id !== id).map(b => !b.children?.length ? b : { ...b, children: rec(b.children!).length ? rec(b.children!) : undefined });
        updateStructure(rec(config.launcherStructure || []));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    // Deep clone a block with fresh IDs
    const cloneBlock = (b: LauncherBlock): LauncherBlock => ({ ...JSON.parse(JSON.stringify(b)), id: nanoid(), children: b.children?.map(cloneBlock) });
    const cloneChatBlock = (b: ChatBlock): ChatBlock => ({ ...JSON.parse(JSON.stringify(b)), id: nanoid(), children: b.children?.map(cloneChatBlock) });

    const duplicateBlock = (id: string) => {
        const rec = (blocks: LauncherBlock[]): LauncherBlock[] => {
            const result: LauncherBlock[] = [];
            for (const b of blocks) {
                result.push(b.children ? { ...b, children: rec(b.children) } : b);
                if (b.id === id) result.push(cloneBlock(b));
            }
            return result;
        };
        updateStructure(rec(config.launcherStructure || []));
    };

    const addBlock = (parentId: string | null) => {
        const nb: LauncherBlock = { id: nanoid(), type: 'container', style: { padding: '10px', backgroundColor: '#eeeeee', borderRadius: '8px', minHeight: '40px' }, content: 'New Block' };
        if (!parentId) { updateStructure([...(config.launcherStructure || []), nb]); }
        else {
            const rec = (blocks: LauncherBlock[]): LauncherBlock[] =>
                blocks.map(b => b.id === parentId ? { ...b, children: [...(b.children || []), nb] } : b.children ? { ...b, children: rec(b.children) } : b);
            updateStructure(rec(config.launcherStructure || []));
        }
        setSelectedBlockId(nb.id);
    };

    // ── Chat Builder CRUD ──
    const updateChatStructure = (s: ChatBlock[]) => pushHistory({ ...config, chatStructure: s, chatMode: 'advanced' });

    const updateChatBlock = (id: string, updates: Partial<ChatBlock>) => {
        const rec = (blocks: ChatBlock[]): ChatBlock[] =>
            blocks.map(b => b.id === id ? { ...b, ...updates } : b.children ? { ...b, children: rec(b.children) } : b);
        updateChatStructure(rec(config.chatStructure || []));
    };

    const deleteChatBlock = (id: string) => {
        const rec = (blocks: ChatBlock[]): ChatBlock[] =>
            blocks.filter(b => b.id !== id).map(b => !b.children?.length ? b : { ...b, children: rec(b.children!).length ? rec(b.children!) : undefined });
        updateChatStructure(rec(config.chatStructure || []));
        if (selectedChatBlockId === id) setSelectedChatBlockId(null);
    };

    const duplicateChatBlock = (id: string) => {
        const rec = (blocks: ChatBlock[]): ChatBlock[] => {
            const result: ChatBlock[] = [];
            for (const b of blocks) {
                result.push(b.children ? { ...b, children: rec(b.children) } : b);
                if (b.id === id) result.push(cloneChatBlock(b));
            }
            return result;
        };
        updateChatStructure(rec(config.chatStructure || []));
    };

    const addChatBlock = (parentId: string | null, type: ChatBlock['type']) => {
        const nb: ChatBlock = {
            id: nanoid(), type,
            content: type === 'text' ? 'New Text' : type === 'button' ? 'Click Me' : type === 'branding' ? 'Powered by AI' : undefined,
            placeholder: type === 'input' ? 'Type a message...' : undefined,
            style: type === 'container' || type === 'header' || type === 'messages' || type === 'input' ? { padding: '10px', backgroundColor: '#f9fafb' } : undefined,
            splitRatio: type === 'split' ? 50 : undefined,
            statusType: type === 'status' ? 'online' : undefined,
            children: type === 'split' ? [
                { id: nanoid(), type: 'container', style: { padding: '10px', flex: 1, backgroundColor: '#ffffff', border: '1px dashed #ccc' } },
                { id: nanoid(), type: 'container', style: { padding: '10px', flex: 1, backgroundColor: '#ffffff', border: '1px dashed #ccc' } }
            ] : undefined
        };
        if (!parentId) { updateChatStructure([...(config.chatStructure || []), nb]); }
        else {
            const rec = (blocks: ChatBlock[]): ChatBlock[] =>
                blocks.map(b => b.id === parentId ? { ...b, children: [...(b.children || []), nb] } : b.children ? { ...b, children: rec(b.children) } : b);
            updateChatStructure(rec(config.chatStructure || []));
        }
        setSelectedChatBlockId(nb.id);
    };

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const tabs = [
        { id: 'launcher' as const, label: 'Launcher', icon: <RemixIcons.RiApps2Line size={15} /> },
        { id: 'chat-builder' as const, label: 'Chat Builder', icon: <RemixIcons.RiLayoutMasonryLine size={15} /> },
        { id: 'chat-settings' as const, label: 'Settings', icon: <RemixIcons.RiSettings4Line size={15} /> },
    ];

    const getLauncherTarget = (): LauncherBlock | null => {
        if (!selectedBlockId) return null;
        const find = (blocks: LauncherBlock[]): LauncherBlock | null => {
            for (const b of blocks) { if (b.id === selectedBlockId) return b; if (b.children) { const f = find(b.children); if (f) return f; } } return null;
        }
        const t = find(config.launcherStructure || []);
        if (t && ['container', 'row', 'column'].includes(t.type)) return t;
        return null;
    };
    const launcherTarget = getLauncherTarget();
    const launcherIsEmpty = !config.launcherStructure || config.launcherStructure.length === 0;

    const getChatTarget = (): ChatBlock | null => {
        if (!selectedChatBlockId) return null;
        const find = (blocks: ChatBlock[]): ChatBlock | null => {
            for (const b of blocks) { if (b.id === selectedChatBlockId) return b; if (b.children) { const f = find(b.children); if (f) return f; } } return null;
        }
        const t = find(config.chatStructure || []);
        if (t && ['header', 'messages', 'input', 'container'].includes(t.type)) return t;
        return null;
    };
    const chatTarget = getChatTarget();

    return (
        <div className="h-full flex flex-col bg-background text-foreground overflow-hidden border border-border/30 rounded-2xl shadow-xl">
            {/* ── Tab Bar ── */}
            <div className="h-14 border-b border-border/30 flex items-center justify-between px-5 bg-gradient-to-r from-muted/20 to-transparent shrink-0">
                <div className="flex items-center gap-0.5 bg-muted/40 backdrop-blur-sm border border-border/30 rounded-xl p-1">
                    {tabs.map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)}
                            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-300
                ${activeTab === t.id
                                    ? 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md shadow-primary/20'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                            {t.icon}{t.label}
                        </button>
                    ))}
                </div>

                {/* Undo/Redo in toolbar */}
                <div className="flex items-center gap-1 ml-2">
                    <button onClick={undo} disabled={!canUndo} title="Undo (Cmd+Z)"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                        <RemixIcons.RiArrowGoBackLine size={14} />
                    </button>
                    <button onClick={redo} disabled={!canRedo} title="Redo (Cmd+Shift+Z)"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                        <RemixIcons.RiArrowGoForwardLine size={14} />
                    </button>
                </div>

                {activeTab === 'launcher' && (
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Templates</span>
                        <div className="flex bg-muted/30 border border-border/30 rounded-lg p-0.5 gap-0.5">
                            {LAUNCHER_TEMPLATES.map(t => (
                                <button key={t.id} onClick={() => { if (confirm('Replace launcher structure?')) updateStructure(t.structure); }}
                                    title={t.description} className="px-2.5 py-1.5 text-[10px] font-medium hover:bg-background/80 rounded-md transition-colors">
                                    {t.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Content ── */}
            {activeTab === 'launcher' ? (
                <div className="flex-1 grid grid-cols-[260px_1fr_300px] overflow-hidden">
                    {/* LEFT — Layers */}
                    <div className="border-r border-border/20 bg-muted/5 flex flex-col min-h-0">
                        <div className="p-3 border-b border-border/20 flex justify-between items-center shrink-0">
                            <h3 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Layers</h3>
                            <button onClick={() => addBlock(launcherTarget ? launcherTarget.id : null)}
                                disabled={!launcherIsEmpty && !launcherTarget}
                                className="text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20 px-2.5 py-1.5 rounded-lg hover:bg-primary/20 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <RemixIcons.RiAddLine size={12} /> Add {launcherTarget ? `to ${launcherTarget.type}` : launcherIsEmpty ? 'Root' : ''}
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                            {config.launcherStructure && (
                                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                    <SortableContext items={config.launcherStructure.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                        {config.launcherStructure.map(block => (
                                            <StructureItem key={block.id} block={block} selectedBlockId={selectedBlockId}
                                                onSelectBlock={setSelectedBlockId} onDeleteBlock={deleteBlock} onDuplicateBlock={duplicateBlock} />
                                        ))}
                                    </SortableContext>
                                </DndContext>
                            )}
                            {(!config.launcherStructure || !config.launcherStructure.length) && (
                                <div className="text-center text-[11px] text-muted-foreground/50 py-12">No blocks yet</div>
                            )}
                        </div>
                    </div>

                    {/* CENTER — Preview */}
                    <div className="bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 pointer-events-auto">
                                <InteractiveChatPreview config={config} isOpen={false} setIsOpen={() => { }} isPreview={true} />
                            </div>
                        </div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/60 backdrop-blur-lg border border-border/30 px-3.5 py-1.5 rounded-full shadow-lg text-[10px] text-muted-foreground flex items-center gap-2 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live Preview
                        </div>
                    </div>

                    {/* RIGHT — Properties */}
                    <div className="border-l border-border/20 bg-background/50 backdrop-blur-sm flex flex-col min-h-0">
                        <PropertiesPanel blockId={selectedBlockId} config={config} onUpdateBlock={updateBlock} />
                    </div>
                </div>
            ) : activeTab === 'chat-builder' ? (
                <div className="flex-1 grid grid-cols-[260px_1fr_300px] overflow-hidden">
                    {/* LEFT — Chat Blocks */}
                    <div className="border-r border-border/20 bg-muted/5 flex flex-col min-h-0">
                        <div className="p-3 border-b border-border/20 flex justify-between items-center shrink-0">
                            <h3 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Chat Blocks</h3>
                            {(config.chatStructure && config.chatStructure.length > 0) && (
                                <button onClick={() => { if (confirm('Clear all chat blocks and start over?')) { pushHistory({ ...config, chatStructure: [], chatMode: 'advanced' }); setSelectedChatBlockId(null); } }}
                                    className="text-[10px] font-semibold text-red-500 hover:bg-red-500/10 px-2.5 py-1.5 border border-transparent hover:border-red-500/20 rounded-lg transition-colors flex items-center gap-1">
                                    <RemixIcons.RiDeleteBinLine size={12} /> Clear
                                </button>
                            )}
                        </div>

                        {/* Structure list */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                            {config.chatStructure?.length ? (
                                <>
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleChatDragEnd}>
                                        <SortableContext items={config.chatStructure.map(b => b.id)} strategy={verticalListSortingStrategy}>
                                            {config.chatStructure.map(block => (
                                                <ChatStructureItem key={block.id} block={block} selectedChatBlockId={selectedChatBlockId}
                                                    onSelectBlock={setSelectedChatBlockId} onDeleteBlock={deleteChatBlock} onDuplicateBlock={duplicateChatBlock} />
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                    <div className="pt-3 mt-2 border-t border-border/20 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest block">Add Block</label>
                                            {chatTarget && <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">To {chatTarget.type}</span>}
                                        </div>
                                        {chatTarget ? (
                                            <div className="grid grid-cols-2 gap-1">
                                                {(['header', 'messages', 'input', 'container', 'split', 'text', 'button', 'divider', 'branding', 'icon', 'image', 'status'] as const).map(type => (
                                                    <button key={type} onClick={() => addChatBlock(chatTarget.id, type)}
                                                        className="px-2 py-1.5 text-[10px] font-medium bg-card/50 border border-border/30 hover:bg-primary/5 hover:border-primary/20 rounded-lg transition-all capitalize">
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center p-3 border border-dashed border-border/30 rounded-lg bg-muted/10">
                                                <RemixIcons.RiCursorLine size={18} className="mx-auto mb-1 opacity-30" />
                                                <p className="text-[10px] text-muted-foreground/70">Select a container block to insert new items</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3 px-2 py-4">
                                    <button onClick={() => {
                                        const nb: ChatBlock = { id: nanoid(), type: 'container', style: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb', padding: '16px', gap: '8px', minHeight: '100px', borderRadius: '16px' } };
                                        onChange({ ...config, chatStructure: [nb], chatMode: 'advanced' });
                                        setSelectedChatBlockId(nb.id);
                                    }} className="py-2.5 px-3 bg-primary text-primary-foreground text-[11px] font-semibold rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary/20">
                                        <RemixIcons.RiLayoutMasonryLine size={14} /> Start Blank Container
                                    </button>

                                    <div className="relative my-2">
                                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/30"></div></div>
                                        <div className="relative flex justify-center"><span className="bg-muted/5 px-2 text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Or Load Template</span></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-1.5">
                                        {CHAT_TEMPLATES.map(t => (
                                            <button key={t.id} onClick={() => { onChange({ ...config, chatStructure: t.structure as ChatBlock[], chatMode: 'advanced' }); if (t.structure.length) setSelectedChatBlockId(t.structure[0].id); }}
                                                className="px-2 py-2 text-[10px] font-semibold bg-card border border-border/50 hover:bg-primary/5 hover:border-primary/30 hover:text-primary rounded-lg transition-all text-left flex flex-col gap-0.5" title={t.description}>
                                                <span>{t.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CENTER — Chat Preview */}
                    <div className="bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 relative flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #888 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute inset-0 pointer-events-auto">
                                <InteractiveChatPreview config={config} isOpen={true} setIsOpen={() => { }} isPreview={true} />
                            </div>
                        </div>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/60 backdrop-blur-lg border border-border/30 px-3.5 py-1.5 rounded-full shadow-lg text-[10px] text-muted-foreground flex items-center gap-2 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live Preview
                        </div>
                    </div>

                    {/* RIGHT — Chat Block Properties */}
                    <div className="border-l border-border/20 bg-background/50 flex flex-col min-h-0 overflow-y-auto p-3.5 space-y-4">
                        <h3 className="text-xs font-semibold">Block Properties</h3>
                        {selectedChatBlockId && config.chatStructure ? (() => {
                            const findBlock = (blocks: ChatBlock[]): ChatBlock | null => {
                                for (const b of blocks) { if (b.id === selectedChatBlockId) return b; if (b.children) { const f = findBlock(b.children); if (f) return f; } } return null;
                            };
                            const block = findBlock(config.chatStructure);
                            if (!block) return <p className="text-[11px] text-muted-foreground">Block not found</p>;
                            return (
                                <div className="space-y-3">
                                    <div className="px-2.5 py-1.5 bg-muted/30 rounded-lg text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{block.type}</div>
                                    {(['text', 'button', 'branding', 'icon', 'image'] as const).includes(block.type as any) && (
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Content</label>
                                            <input type="text" value={block.content || ''} onChange={e => updateChatBlock(block.id, { content: e.target.value })}
                                                placeholder={block.type === 'icon' ? 'RiRobot2Line' : block.type === 'image' ? 'https://...' : ''}
                                                className="w-full text-[11px] px-2.5 py-2 rounded-lg border border-border/40 bg-muted/20 outline-none" />
                                        </div>
                                    )}
                                    {block.type === 'split' && (
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Left Column Width ({block.splitRatio || 50}%)</label>
                                            <input type="range" min="10" max="90" value={block.splitRatio || 50} onChange={e => updateChatBlock(block.id, { splitRatio: parseInt(e.target.value) })}
                                                className="w-full mt-1" />
                                        </div>
                                    )}
                                    {block.type === 'status' && (
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider">Status Indicator</label>
                                            <select value={block.statusType || 'online'} onChange={e => updateChatBlock(block.id, { statusType: e.target.value as any })}
                                                className="w-full text-[11px] px-2.5 py-2 mt-1 rounded-lg border border-border/40 bg-muted/20 outline-none">
                                                <option value="online">Online (Green)</option>
                                                <option value="away">Away (Yellow)</option>
                                                <option value="offline">Offline (Gray)</option>
                                            </select>
                                        </div>
                                    )}
                                    {block.type === 'input' && (
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Placeholder</label>
                                            <input type="text" value={block.placeholder || ''} onChange={e => updateChatBlock(block.id, { placeholder: e.target.value })}
                                                className="w-full text-[11px] px-2.5 py-2 rounded-lg border border-border/40 bg-muted/20 outline-none" />
                                        </div>
                                    )}
                                    {block.type === 'button' && (
                                        <>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-muted-foreground/70 uppercase">Action</label>
                                                <select value={block.onClick || 'send-message'} onChange={e => updateChatBlock(block.id, { onClick: e.target.value as any })}
                                                    className="w-full text-[11px] px-2.5 py-2 rounded-lg border border-border/40 bg-muted/20 outline-none">
                                                    <option value="send-message">Send Message</option><option value="close-chat">Close Chat</option><option value="open-url">Open URL</option>
                                                </select>
                                            </div>
                                            {block.onClick === 'open-url' && (
                                                <input type="text" value={block.url || ''} onChange={e => updateChatBlock(block.id, { url: e.target.value })}
                                                    placeholder="https://..." className="w-full text-[11px] px-2.5 py-2 rounded-lg border border-border/40 bg-muted/20 outline-none" />
                                            )}
                                        </>
                                    )}
                                    <label className="flex items-center gap-2 text-[11px]">
                                        <input type="checkbox" checked={block.mobileHidden || false} onChange={e => updateChatBlock(block.id, { mobileHidden: e.target.checked })} className="w-3.5 h-3.5 rounded" />
                                        Hide on Mobile
                                    </label>
                                    <div className="pt-3 border-t border-border/20">
                                        <StyleEditor style={block.style || {}} onChange={s => updateChatBlock(block.id, { style: s })} onHoverChange={s => updateChatBlock(block.id, { hoverStyle: s })} />
                                    </div>
                                </div>
                            );
                        })() : <p className="text-[11px] text-muted-foreground">Select a block to edit</p>}
                    </div>
                </div>
            ) : (
                <ChatSettingsPanel config={config} onChange={onChange} />
            )}
        </div>
    );
}
