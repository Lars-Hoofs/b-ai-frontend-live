'use client';
import React, { useState, useRef, useCallback } from 'react';
import * as I from 'react-icons/ri';

// ─── helpers ─────────────────────────────────────────────────────────
const cls = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');
const inp = 'w-full text-[11px] px-2 py-1.5 rounded-lg border border-border/40 bg-muted/20 focus:border-primary/40 outline-none';
const lbl = 'text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider';
const btnBase = 'text-[10px] py-1 px-2 rounded-md border transition-all font-medium';
const btnOn = 'bg-primary text-primary-foreground border-primary';
const btnOff = 'border-border/40 text-muted-foreground hover:border-primary/40';

// ─── Accordion Section ────────────────────────────────────────────────
function Sec({ title, icon, children, open: initOpen = false }: {
    title: string; icon: React.ReactNode; children: React.ReactNode; open?: boolean;
}) {
    const [open, setOpen] = useState(initOpen);
    return (
        <div className="border-b border-border/15 last:border-0">
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-muted/20 transition-colors text-left group">
                <span className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors">{icon}</span>
                <span className="flex-1 text-[11px] font-semibold text-foreground/80 uppercase tracking-widest">{title}</span>
                <I.RiArrowDownSLine size={14} className={cls('text-muted-foreground/40 transition-transform', open && 'rotate-180')} />
            </button>
            {open && <div className="px-3 pb-3 space-y-3">{children}</div>}
        </div>
    );
}

// ─── Unit Input ────────────────────────────────────────────────────────
type Unit = 'px' | '%' | 'rem' | 'em' | 'vw' | 'vh' | 'auto' | 'fr' | 'none' | '';

function UnitInput({ label, value, onChange, units = ['px', '%', 'rem', 'em', 'vw', 'vh', 'auto'], placeholder = '0' }: {
    label?: string; value: string; onChange: (v: string) => void;
    units?: Unit[]; placeholder?: string;
}) {
    const hasUnit = units.some(u => value?.endsWith(u));
    const currentUnit = units.find(u => value?.endsWith(u)) ?? units[0];
    const numVal = value?.replace(/[^0-9.-]/g, '') ?? '';
    const set = (num: string, unit: string) => {
        if (unit === 'auto') { onChange('auto'); return; }
        onChange(num ? `${num}${unit}` : '');
    };
    return (
        <div className="space-y-0.5">
            {label && <label className={lbl}>{label}</label>}
            <div className="flex gap-1">
                <input type={currentUnit === 'auto' ? 'text' : 'number'} value={currentUnit === 'auto' ? 'auto' : numVal}
                    onChange={e => set(e.target.value, currentUnit)} placeholder={placeholder}
                    className={cls(inp, 'flex-1 min-w-0')} readOnly={currentUnit === 'auto'} />
                <select value={currentUnit} onChange={e => set(numVal, e.target.value)}
                    className="text-[10px] px-1 rounded-lg border border-border/40 bg-muted/20 outline-none cursor-pointer">
                    {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
            </div>
        </div>
    );
}

// ─── Color Input ───────────────────────────────────────────────────────
function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    const safe = value?.startsWith('#') ? value : '#000000';
    return (
        <div className="space-y-0.5">
            <label className={lbl}>{label}</label>
            <div className="flex gap-1.5 items-center">
                <input type="color" value={safe} onChange={e => onChange(e.target.value)}
                    className="w-7 h-7 p-0 rounded-md border border-border/40 cursor-pointer flex-shrink-0" />
                <input type="text" value={value ?? ''} onChange={e => onChange(e.target.value)}
                    placeholder="transparent" className={cls(inp, 'flex-1')} />
            </div>
        </div>
    );
}

// ─── Slider Row ────────────────────────────────────────────────────────
function SliderRow({ label, value, min, max, step = 1, unit = '', onChange }: {
    label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void;
}) {
    return (
        <div className="space-y-0.5">
            <div className="flex justify-between">
                <label className={lbl}>{label}</label>
                <span className="text-[10px] text-muted-foreground/50">{value}{unit}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(parseFloat(e.target.value))} className="w-full accent-primary" />
        </div>
    );
}

// ─── Button Group ──────────────────────────────────────────────────────
function BtnGroup<T extends string>({ options, value, onChange }: { options: { v: T; label: React.ReactNode }[]; value: T; onChange: (v: T) => void }) {
    return (
        <div className="flex gap-0.5 flex-wrap">
            {options.map(o => (
                <button key={o.v} onClick={() => onChange(o.v)}
                    className={cls(btnBase, value === o.v ? btnOn : btnOff)}>{o.label}</button>
            ))}
        </div>
    );
}

// ─── Background Editor ─────────────────────────────────────────────────
type BgMode = 'solid' | 'linear' | 'radial' | 'conic' | 'image' | 'glass' | 'none';
function detectBgMode(s: React.CSSProperties): BgMode {
    const bg = (s.background as string) ?? '';
    const bgi = (s.backgroundImage as string) ?? '';
    if (s.backdropFilter) return 'glass';
    if (bg.startsWith('linear') || bgi.startsWith('linear')) return 'linear';
    if (bg.startsWith('radial') || bgi.startsWith('radial')) return 'radial';
    if (bg.startsWith('conic') || bgi.startsWith('conic')) return 'conic';
    if (bgi.startsWith('url(') || bg.startsWith('url(')) return 'image';
    if (!s.backgroundColor && !bg && !bgi) return 'none';
    return 'solid';
}

function BgEditor({ style, onChange }: { style: React.CSSProperties; onChange: (p: Partial<React.CSSProperties>) => void }) {
    const [mode, setMode] = useState<BgMode>(detectBgMode(style));
    const [from, setFrom] = useState('#6366f1');
    const [to, setTo] = useState('#8b5cf6');
    const [angle, setAngle] = useState(135);
    const [imgUrl, setImgUrl] = useState('');
    const [blur, setBlur] = useState(8);
    const [overlay, setOverlay] = useState('rgba(255,255,255,0.1)');
    const [solid, setSolid] = useState((style.backgroundColor as string) ?? '#ffffff');

    const apply = (m: BgMode) => {
        setMode(m);
        const clear = { background: undefined, backgroundImage: undefined, backdropFilter: undefined, WebkitBackdropFilter: undefined };
        if (m === 'none') onChange({ ...clear, backgroundColor: undefined });
        else if (m === 'solid') onChange({ ...clear, backgroundColor: solid });
        else if (m === 'linear') onChange({ ...clear, backgroundColor: undefined, background: `linear-gradient(${angle}deg, ${from}, ${to})` });
        else if (m === 'radial') onChange({ ...clear, backgroundColor: undefined, background: `radial-gradient(circle at center, ${from}, ${to})` });
        else if (m === 'conic') onChange({ ...clear, backgroundColor: undefined, background: `conic-gradient(from ${angle}deg, ${from}, ${to}, ${from})` });
        else if (m === 'image') onChange({ ...clear, backgroundColor: undefined, backgroundImage: `url("${imgUrl}")`, backgroundSize: 'cover', backgroundPosition: 'center' });
        else if (m === 'glass') onChange({ ...clear, backgroundColor: overlay, backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)` });
    };

    const MODES: { v: BgMode; label: string }[] = [
        { v: 'solid', label: '■ Solid' }, { v: 'linear', label: '▽ Linear' }, { v: 'radial', label: '◎ Radial' },
        { v: 'conic', label: '⊙ Conic' }, { v: 'image', label: '🖼 Image' }, { v: 'glass', label: '❄ Glass' }, { v: 'none', label: '∅ None' },
    ];

    const upGrad = (a: number, f: string, t: string) => {
        if (mode === 'linear') onChange({ background: `linear-gradient(${a}deg, ${f}, ${t})`, backgroundColor: undefined });
        else if (mode === 'radial') onChange({ background: `radial-gradient(circle at center, ${f}, ${t})`, backgroundColor: undefined });
        else if (mode === 'conic') onChange({ background: `conic-gradient(from ${a}deg, ${f}, ${t}, ${f})`, backgroundColor: undefined });
    };

    return (
        <div className="space-y-2.5">
            <label className={lbl}>Fill Type</label>
            <div className="grid grid-cols-4 gap-1">
                {MODES.map(m => (
                    <button key={m.v} onClick={() => apply(m.v)}
                        className={cls('text-[9px] py-1.5 rounded-md border font-semibold transition-all', mode === m.v ? btnOn : btnOff)}>
                        {m.label}
                    </button>
                ))}
            </div>

            {mode === 'solid' && (
                <ColorInput label="Color" value={solid} onChange={v => { setSolid(v); onChange({ backgroundColor: v, background: undefined }); }} />
            )}

            {(mode === 'linear' || mode === 'radial' || mode === 'conic') && (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <ColorInput label="From" value={from} onChange={v => { setFrom(v); upGrad(angle, v, to); }} />
                        <ColorInput label="To" value={to} onChange={v => { setTo(v); upGrad(angle, from, v); }} />
                    </div>
                    {(mode === 'linear' || mode === 'conic') && (
                        <SliderRow label="Angle" value={angle} min={0} max={360} unit="°"
                            onChange={a => { setAngle(a); upGrad(a, from, to); }} />
                    )}
                    <div className="h-8 rounded-lg border border-border/20"
                        style={{ background: mode === 'linear' ? `linear-gradient(${angle}deg, ${from}, ${to})` : mode === 'radial' ? `radial-gradient(circle, ${from}, ${to})` : `conic-gradient(from ${angle}deg, ${from}, ${to}, ${from})` }} />
                </div>
            )}

            {mode === 'image' && (
                <div className="space-y-2">
                    <div className="space-y-0.5">
                        <label className={lbl}>Image URL</label>
                        <input value={imgUrl} onChange={e => { setImgUrl(e.target.value); onChange({ backgroundImage: `url("${e.target.value}")` }); }}
                            placeholder="https://..." className={inp} />
                    </div>
                    <div>
                        <label className={lbl}>Size</label>
                        <div className="flex gap-1 mt-1 flex-wrap">
                            {['cover', 'contain', 'auto', '100% 100%'].map(s => (
                                <button key={s} onClick={() => onChange({ backgroundSize: s })}
                                    className={cls(btnBase, style.backgroundSize === s ? btnOn : btnOff)}>{s}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className={lbl}>Position</label>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                            {['top left', 'top center', 'top right', 'center left', 'center', 'center right', 'bottom left', 'bottom center', 'bottom right'].map(p => (
                                <button key={p} onClick={() => onChange({ backgroundPosition: p })}
                                    className={cls('text-[9px] py-1 rounded border transition-all', style.backgroundPosition === p ? btnOn : btnOff)}>{p}</button>
                            ))}
                        </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={style.backgroundRepeat === 'repeat'} onChange={e => onChange({ backgroundRepeat: e.target.checked ? 'repeat' : 'no-repeat' })} />
                        <span className={lbl}>Repeat</span>
                    </label>
                </div>
            )}

            {mode === 'glass' && (
                <div className="space-y-2">
                    <SliderRow label="Blur" value={blur} min={0} max={40} unit="px"
                        onChange={b => { setBlur(b); onChange({ backdropFilter: `blur(${b}px)`, WebkitBackdropFilter: `blur(${b}px)` }); }} />
                    <div className="space-y-0.5">
                        <label className={lbl}>Overlay color</label>
                        <input value={overlay} onChange={e => { setOverlay(e.target.value); onChange({ backgroundColor: e.target.value }); }}
                            placeholder="rgba(255,255,255,0.1)" className={inp} />
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Shadow Builder ────────────────────────────────────────────────────
interface Shadow { x: number; y: number; blur: number; spread: number; color: string; inset: boolean; }
function ShadowBuilder({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [shadows, setShadows] = useState<Shadow[]>(() => {
        if (!value || value === 'none') return [];
        return [{ x: 2, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.15)', inset: false }];
    });
    const [sel, setSel] = useState(0);

    const toStr = (ss: Shadow[]) => ss.length === 0 ? 'none' : ss.map(s =>
        `${s.inset ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`
    ).join(', ');

    const upd = (ss: Shadow[]) => { setShadows(ss); onChange(toStr(ss)); };
    const add = () => { const ns = [...shadows, { x: 0, y: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.15)', inset: false }]; upd(ns); setSel(ns.length - 1); };
    const rem = (i: number) => { const ns = shadows.filter((_, j) => j !== i); upd(ns); setSel(Math.max(0, sel - 1)); };
    const set = (i: number, k: keyof Shadow, v: any) => { const ns = shadows.map((s, j) => j === i ? { ...s, [k]: v } : s); upd(ns); };

    const cur = shadows[sel];
    return (
        <div className="space-y-2">
            <div className="flex gap-1 flex-wrap">
                {shadows.map((_, i) => (
                    <button key={i} onClick={() => setSel(i)}
                        className={cls(btnBase, sel === i ? btnOn : btnOff)}>Shadow {i + 1}</button>
                ))}
                <button onClick={add} className={cls(btnBase, btnOff)}>+ Add</button>
            </div>
            {cur && (
                <div className="space-y-2 p-2 border border-border/20 rounded-lg bg-muted/10">
                    <div className="grid grid-cols-2 gap-2">
                        <SliderRow label="X" value={cur.x} min={-50} max={50} unit="px" onChange={v => set(sel, 'x', v)} />
                        <SliderRow label="Y" value={cur.y} min={-50} max={50} unit="px" onChange={v => set(sel, 'y', v)} />
                        <SliderRow label="Blur" value={cur.blur} min={0} max={100} unit="px" onChange={v => set(sel, 'blur', v)} />
                        <SliderRow label="Spread" value={cur.spread} min={-50} max={50} unit="px" onChange={v => set(sel, 'spread', v)} />
                    </div>
                    <ColorInput label="Color" value={cur.color} onChange={v => set(sel, 'color', v)} />
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={cur.inset} onChange={e => set(sel, 'inset', e.target.checked)} />
                            <span className={lbl}>Inset shadow</span>
                        </label>
                        <button onClick={() => rem(sel)} className="text-[10px] text-red-400 hover:text-red-500">Remove</button>
                    </div>
                </div>
            )}
            {shadows.length > 0 && (
                <div className="h-10 rounded-lg border border-border/20 bg-white" style={{ boxShadow: toStr(shadows) }} />
            )}
        </div>
    );
}

// ─── Per-side border ───────────────────────────────────────────────────
type Side = 'Top' | 'Right' | 'Bottom' | 'Left';
interface BorderState { width: number; style: string; color: string; }
function BorderEditor({ style, onChange }: { style: React.CSSProperties; onChange: (p: Partial<React.CSSProperties>) => void }) {
    const [linked, setLinked] = useState(true);
    const [sel, setSel] = useState<Side>('Top');
    const [bs, setBs] = useState<Record<Side, BorderState>>({
        Top: { width: 0, style: 'solid', color: '#000000' },
        Right: { width: 0, style: 'solid', color: '#000000' },
        Bottom: { width: 0, style: 'solid', color: '#000000' },
        Left: { width: 0, style: 'solid', color: '#000000' },
    });
    const sides: Side[] = ['Top', 'Right', 'Bottom', 'Left'];
    const STYLES = ['solid', 'dashed', 'dotted', 'double', 'none'];

    const upd = (side: Side, k: keyof BorderState, v: any) => {
        const updated = linked ? Object.fromEntries(sides.map(s => [s, { ...bs[s], [k]: v }])) as Record<Side, BorderState>
            : { ...bs, [side]: { ...bs[side], [k]: v } };
        setBs(updated);
        const toCSS = (s: Side) => `${updated[s].width}px ${updated[s].style} ${updated[s].color}`;
        onChange({
            borderTop: toCSS('Top'), borderRight: toCSS('Right'),
            borderBottom: toCSS('Bottom'), borderLeft: toCSS('Left'),
        });
    };

    const cur = bs[sel];
    return (
        <div className="space-y-2">
            <div className="flex gap-1 items-center">
                {sides.map(s => (
                    <button key={s} onClick={() => setSel(s)}
                        className={cls('text-[9px] px-1.5 py-1 rounded border flex-1', sel === s && !linked ? btnOn : btnOff)}>{s[0]}</button>
                ))}
                <button onClick={() => setLinked(l => !l)} title="Link all sides"
                    className={cls(btnBase, linked ? btnOn : btnOff)}>
                    <I.RiLink size={10} />
                </button>
            </div>
            <SliderRow label="Width" value={cur.width} min={0} max={20} unit="px" onChange={v => upd(sel, 'width', v)} />
            <div>
                <label className={lbl}>Style</label>
                <div className="flex gap-1 mt-1 flex-wrap">
                    {STYLES.map(s => (
                        <button key={s} onClick={() => upd(sel, 'style', s)}
                            className={cls(btnBase, cur.style === s ? btnOn : btnOff)}>{s}</button>
                    ))}
                </div>
            </div>
            <ColorInput label="Color" value={cur.color} onChange={v => upd(sel, 'color', v)} />
        </div>
    );
}

// ─── Transform ────────────────────────────────────────────────────────
function TransformEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [rotate, setRotate] = useState(0);
    const [scaleX, setScaleX] = useState(1);
    const [scaleY, setScaleY] = useState(1);
    const [tx, setTx] = useState(0);
    const [ty, setTy] = useState(0);
    const [skewX, setSkewX] = useState(0);
    const [skewY, setSkewY] = useState(0);
    const [origin, setOrigin] = useState('center');

    const build = (r: number, sx: number, sy: number, x: number, y: number, kx: number, ky: number) =>
        `rotate(${r}deg) scale(${sx}, ${sy}) translate(${x}px, ${y}px) skew(${kx}deg, ${ky}deg)`;

    const upd = (r = rotate, sx = scaleX, sy = scaleY, x = tx, y = ty, kx = skewX, ky = skewY) =>
        onChange(build(r, sx, sy, x, y, kx, ky));

    const ORIGINS = ['top left', 'top center', 'top right', 'center left', 'center', 'center right', 'bottom left', 'bottom center', 'bottom right'];

    return (
        <div className="space-y-2">
            <SliderRow label="Rotate" value={rotate} min={-180} max={180} unit="°"
                onChange={v => { setRotate(v); upd(v); }} />
            <div className="grid grid-cols-2 gap-2">
                <SliderRow label="Scale X" value={scaleX} min={0} max={3} step={0.05}
                    onChange={v => { setScaleX(v); upd(rotate, v, scaleY); }} />
                <SliderRow label="Scale Y" value={scaleY} min={0} max={3} step={0.05}
                    onChange={v => { setScaleY(v); upd(rotate, scaleX, v); }} />
                <SliderRow label="Translate X" value={tx} min={-200} max={200} unit="px"
                    onChange={v => { setTx(v); upd(rotate, scaleX, scaleY, v, ty); }} />
                <SliderRow label="Translate Y" value={ty} min={-200} max={200} unit="px"
                    onChange={v => { setTy(v); upd(rotate, scaleX, scaleY, tx, v); }} />
                <SliderRow label="Skew X" value={skewX} min={-45} max={45} unit="°"
                    onChange={v => { setSkewX(v); upd(rotate, scaleX, scaleY, tx, ty, v, skewY); }} />
                <SliderRow label="Skew Y" value={skewY} min={-45} max={45} unit="°"
                    onChange={v => { setSkewY(v); upd(rotate, scaleX, scaleY, tx, ty, skewX, v); }} />
            </div>
            <div>
                <label className={lbl}>Transform Origin</label>
                <div className="grid grid-cols-3 gap-1 mt-1">
                    {ORIGINS.map(o => (
                        <button key={o} onClick={() => onChange && onChange(origin)}
                            className={cls('text-[9px] py-1 rounded border transition-all', origin === o ? btnOn : btnOff)}
                            onMouseDown={() => setOrigin(o)}>{o.split(' ').map(w => w[0]).join('')}</button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Filter Editor ────────────────────────────────────────────────────
function FilterEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [filters, setFilters] = useState({ blur: 0, brightness: 100, contrast: 100, saturate: 100, grayscale: 0, hueRotate: 0, sepia: 0, invert: 0 });
    const upd = (k: string, v: number) => {
        const nf = { ...filters, [k]: v };
        setFilters(nf);
        const str = [
            nf.blur > 0 ? `blur(${nf.blur}px)` : '',
            nf.brightness !== 100 ? `brightness(${nf.brightness}%)` : '',
            nf.contrast !== 100 ? `contrast(${nf.contrast}%)` : '',
            nf.saturate !== 100 ? `saturate(${nf.saturate}%)` : '',
            nf.grayscale > 0 ? `grayscale(${nf.grayscale}%)` : '',
            nf.hueRotate > 0 ? `hue-rotate(${nf.hueRotate}deg)` : '',
            nf.sepia > 0 ? `sepia(${nf.sepia}%)` : '',
            nf.invert > 0 ? `invert(${nf.invert}%)` : '',
        ].filter(Boolean).join(' ');
        onChange(str || 'none');
    };
    return (
        <div className="space-y-2">
            <SliderRow label="Blur" value={filters.blur} min={0} max={20} unit="px" onChange={v => upd('blur', v)} />
            <SliderRow label="Brightness" value={filters.brightness} min={0} max={200} unit="%" onChange={v => upd('brightness', v)} />
            <SliderRow label="Contrast" value={filters.contrast} min={0} max={200} unit="%" onChange={v => upd('contrast', v)} />
            <SliderRow label="Saturation" value={filters.saturate} min={0} max={200} unit="%" onChange={v => upd('saturate', v)} />
            <SliderRow label="Grayscale" value={filters.grayscale} min={0} max={100} unit="%" onChange={v => upd('grayscale', v)} />
            <SliderRow label="Hue Rotate" value={filters.hueRotate} min={0} max={360} unit="°" onChange={v => upd('hueRotate', v)} />
            <SliderRow label="Sepia" value={filters.sepia} min={0} max={100} unit="%" onChange={v => upd('sepia', v)} />
            <SliderRow label="Invert" value={filters.invert} min={0} max={100} unit="%" onChange={v => upd('invert', v)} />
            <button onClick={() => { setFilters({ blur: 0, brightness: 100, contrast: 100, saturate: 100, grayscale: 0, hueRotate: 0, sepia: 0, invert: 0 }); onChange('none'); }}
                className={cls(btnBase, btnOff, 'w-full')}>Reset Filters</button>
        </div>
    );
}

// ─── Animation Editor ─────────────────────────────────────────────────
export interface BlockAnimation {
    type: string; duration: number; delay: number; easing: string; trigger: string; repeat: number;
}
const ANIM_TYPES = ['none', 'fadeIn', 'fadeUp', 'fadeDown', 'fadeLeft', 'fadeRight', 'scaleIn', 'scaleUp', 'bounce', 'rotateIn', 'flipX', 'flipY', 'shake', 'pulse', 'slideLeft', 'slideRight', 'zoomIn'];
const EASINGS = ['power1.out', 'power2.out', 'power3.out', 'power4.out', 'back.out(1.7)', 'elastic.out(1,0.5)', 'bounce.out', 'linear', 'sine.out', 'expo.out', 'circ.out'];
const TRIGGERS = ['onOpen', 'onHover', 'onScroll', 'onLoad'];

function AnimEditor({ anim, onChange }: { anim: BlockAnimation; onChange: (a: BlockAnimation) => void }) {
    const set = (k: keyof BlockAnimation, v: any) => onChange({ ...anim, [k]: v });
    return (
        <div className="space-y-2">
            <div className="space-y-0.5">
                <label className={lbl}>Animation Type</label>
                <select value={anim.type} onChange={e => set('type', e.target.value)} className={inp}>
                    {ANIM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            {anim.type !== 'none' && <>
                <SliderRow label="Duration" value={anim.duration} min={0.1} max={3} step={0.1} unit="s" onChange={v => set('duration', v)} />
                <SliderRow label="Delay" value={anim.delay} min={0} max={2} step={0.05} unit="s" onChange={v => set('delay', v)} />
                <div className="space-y-0.5">
                    <label className={lbl}>Easing</label>
                    <select value={anim.easing} onChange={e => set('easing', e.target.value)} className={inp}>
                        {EASINGS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>
                <div className="space-y-0.5">
                    <label className={lbl}>Trigger</label>
                    <div className="flex gap-1 flex-wrap">
                        {TRIGGERS.map(t => (
                            <button key={t} onClick={() => set('trigger', t)}
                                className={cls(btnBase, anim.trigger === t ? btnOn : btnOff)}>{t}</button>
                        ))}
                    </div>
                </div>
                <SliderRow label="Repeat (0 = once, -1 = infinite)" value={anim.repeat} min={-1} max={10} onChange={v => set('repeat', v)} />
            </>}
        </div>
    );
}

// ─── Main StyleEditor ─────────────────────────────────────────────────
export interface StyleEditorProps {
    style: React.CSSProperties;
    hoverStyle?: React.CSSProperties;
    animation?: BlockAnimation;
    onChange: (s: React.CSSProperties) => void;
    onHoverChange?: (s: React.CSSProperties) => void;
    onAnimationChange?: (a: BlockAnimation) => void;
}

const DEFAULT_ANIM: BlockAnimation = { type: 'none', duration: 0.6, delay: 0, easing: 'power2.out', trigger: 'onOpen', repeat: 0 };

export function StyleEditor({ style, hoverStyle, animation, onChange, onHoverChange, onAnimationChange }: StyleEditorProps) {
    const [tab, setTab] = useState<'normal' | 'hover'>('normal');
    const cur = tab === 'normal' ? style : (hoverStyle ?? {});
    const upd = tab === 'normal' ? onChange : (onHoverChange ?? (() => { }));
    const set = (k: keyof React.CSSProperties, v: any) => upd({ ...cur, [k]: v || undefined });
    const patch = (p: Partial<React.CSSProperties>) => upd({ ...cur, ...p });

    const BLEND_MODES = ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'];

    return (
        <div className="space-y-0">
            {/* Normal / Hover tab */}
            <div className="flex bg-muted/30 p-0.5 rounded-lg mx-3 my-2">
                {(['normal', 'hover'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={cls('flex-1 text-[10px] py-1.5 rounded-md font-semibold uppercase tracking-wider transition-all',
                            tab === t ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                        {t}
                    </button>
                ))}
            </div>

            {/* ─ Box Model ─ */}
            <Sec title="Box Model" icon={<I.RiLayoutLine size={13} />} open>
                <div className="grid grid-cols-2 gap-2">
                    <UnitInput label="Width" value={(cur.width as string) ?? ''} onChange={v => set('width', v)} />
                    <UnitInput label="Height" value={(cur.height as string) ?? ''} onChange={v => set('height', v)} />
                    <UnitInput label="Min Width" value={(cur.minWidth as string) ?? ''} onChange={v => set('minWidth', v)} />
                    <UnitInput label="Max Width" value={(cur.maxWidth as string) ?? ''} onChange={v => set('maxWidth', v)} units={['px', '%', 'rem', 'vw', 'none']} />
                    <UnitInput label="Min Height" value={(cur.minHeight as string) ?? ''} onChange={v => set('minHeight', v)} />
                    <UnitInput label="Max Height" value={(cur.maxHeight as string) ?? ''} onChange={v => set('maxHeight', v)} units={['px', '%', 'rem', 'vh', 'none']} />
                </div>
                <div className="space-y-0.5">
                    <label className={lbl}>Aspect Ratio</label>
                    <input value={(cur.aspectRatio as string) ?? ''} onChange={e => set('aspectRatio', e.target.value)} placeholder="16/9 or 1/1" className={inp} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <UnitInput label="Padding" value={(cur.padding as string) ?? ''} onChange={v => set('padding', v)} />
                    <UnitInput label="Margin" value={(cur.margin as string) ?? ''} onChange={v => set('margin', v)} />
                    <UnitInput label="Gap" value={(cur.gap as string) ?? ''} onChange={v => set('gap', v)} />
                </div>
                <div className="space-y-0.5">
                    <label className={lbl}>Box Sizing</label>
                    <BtnGroup options={[{ v: 'border-box', label: 'Border Box' }, { v: 'content-box', label: 'Content Box' }]} value={(cur.boxSizing as string) ?? 'border-box'} onChange={v => set('boxSizing', v)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                        <label className={lbl}>Overflow X</label>
                        <select value={(cur.overflowX as string) ?? ''} onChange={e => set('overflowX', e.target.value)} className={inp}>
                            {['', 'auto', 'hidden', 'scroll', 'visible'].map(v => <option key={v} value={v}>{v || 'default'}</option>)}
                        </select>
                    </div>
                    <div className="space-y-0.5">
                        <label className={lbl}>Overflow Y</label>
                        <select value={(cur.overflowY as string) ?? ''} onChange={e => set('overflowY', e.target.value)} className={inp}>
                            {['', 'auto', 'hidden', 'scroll', 'visible'].map(v => <option key={v} value={v}>{v || 'default'}</option>)}
                        </select>
                    </div>
                </div>
            </Sec>

            {/* ─ Fill / Background ─ */}
            <Sec title="Background" icon={<I.RiPaintLine size={13} />} open>
                <BgEditor style={cur} onChange={patch} />
            </Sec>

            {/* ─ Typography ─ */}
            <Sec title="Typography" icon={<I.RiText size={13} />}>
                <ColorInput label="Text Color" value={(cur.color as string) ?? ''} onChange={v => set('color', v)} />
                <div className="grid grid-cols-2 gap-2">
                    <UnitInput label="Font Size" value={(cur.fontSize as string) ?? ''} onChange={v => set('fontSize', v)} units={['px', 'rem', 'em', '%', 'vw']} />
                    <div className="space-y-0.5">
                        <label className={lbl}>Weight</label>
                        <select value={(cur.fontWeight as string) ?? ''} onChange={e => set('fontWeight', e.target.value)} className={inp}>
                            {['', '100', '200', '300', '400', '500', '600', '700', '800', '900'].map(w => <option key={w} value={w}>{w || 'inherit'}</option>)}
                        </select>
                    </div>
                    <div className="space-y-0.5">
                        <label className={lbl}>Font Family</label>
                        <select value={(cur.fontFamily as string) ?? ''} onChange={e => set('fontFamily', e.target.value)} className={inp}>
                            {[['', 'Inherit'], ['Inter, sans-serif', 'Inter'], ['Roboto, sans-serif', 'Roboto'], ['Poppins, sans-serif', 'Poppins'], ['\"Playfair Display\", serif', 'Playfair'], ['Georgia, serif', 'Georgia'], ['monospace', 'Monospace'], ['system-ui, sans-serif', 'System']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                    </div>
                    <UnitInput label="Line Height" value={(cur.lineHeight as string) ?? ''} onChange={v => set('lineHeight', v)} units={['px', 'rem', 'em', '']} />
                    <UnitInput label="Letter Spacing" value={(cur.letterSpacing as string) ?? ''} onChange={v => set('letterSpacing', v)} units={['px', 'em', 'rem']} />
                    <UnitInput label="Word Spacing" value={(cur.wordSpacing as string) ?? ''} onChange={v => set('wordSpacing', v)} units={['px', 'em']} />
                </div>
                <div className="space-y-0.5">
                    <label className={lbl}>Text Align</label>
                    <BtnGroup options={[{ v: 'left', label: <I.RiAlignLeft size={11} /> }, { v: 'center', label: <I.RiAlignCenter size={11} /> }, { v: 'right', label: <I.RiAlignRight size={11} /> }, { v: 'justify', label: <I.RiAlignJustify size={11} /> }]}
                        value={(cur.textAlign as string) ?? 'left'} onChange={v => set('textAlign', v)} />
                </div>
                <div className="space-y-0.5">
                    <label className={lbl}>Transform</label>
                    <BtnGroup options={[{ v: '', label: 'Aa' }, { v: 'uppercase', label: 'AA' }, { v: 'lowercase', label: 'aa' }, { v: 'capitalize', label: 'Aa·' }]}
                        value={(cur.textTransform as string) ?? ''} onChange={v => set('textTransform', v)} />
                </div>
                <div className="space-y-0.5">
                    <label className={lbl}>Decoration</label>
                    <BtnGroup options={[{ v: 'none', label: 'None' }, { v: 'underline', label: <><u>U</u></> }, { v: 'line-through', label: <><s>S</s></> }, { v: 'overline', label: 'O&#773;' }]}
                        value={(cur.textDecoration as string) ?? 'none'} onChange={v => set('textDecoration', v)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                        <label className={lbl}>White Space</label>
                        <select value={(cur.whiteSpace as string) ?? ''} onChange={e => set('whiteSpace', e.target.value)} className={inp}>
                            {['', 'normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line'].map(v => <option key={v} value={v}>{v || 'normal'}</option>)}
                        </select>
                    </div>
                    <div className="space-y-0.5">
                        <label className={lbl}>Overflow</label>
                        <select value={(cur.textOverflow as string) ?? ''} onChange={e => set('textOverflow', e.target.value)} className={inp}>
                            {['', 'clip', 'ellipsis'].map(v => <option key={v} value={v}>{v || 'clip'}</option>)}
                        </select>
                    </div>
                    <div className="space-y-0.5">
                        <label className={lbl}>Writing Mode</label>
                        <select value={(cur.writingMode as string) ?? ''} onChange={e => set('writingMode', e.target.value)} className={inp}>
                            {['', 'horizontal-tb', 'vertical-rl', 'vertical-lr'].map(v => <option key={v} value={v}>{v || 'horizontal'}</option>)}
                        </select>
                    </div>
                    <div className="space-y-0.5">
                        <label className={lbl}>Cursor</label>
                        <select value={(cur.cursor as string) ?? ''} onChange={e => set('cursor', e.target.value)} className={inp}>
                            {['', 'pointer', 'default', 'text', 'not-allowed', 'grab', 'zoom-in', 'crosshair'].map(v => <option key={v} value={v}>{v || 'default'}</option>)}
                        </select>
                    </div>
                </div>
            </Sec>

            {/* ─ Border & Radius ─ */}
            <Sec title="Border" icon={<I.RiRoundedCorner size={13} />}>
                <BorderEditor style={cur} onChange={patch} />
                <UnitInput label="Border Radius" value={(cur.borderRadius as string) ?? ''} onChange={v => set('borderRadius', v)} units={['px', '%', 'rem', 'em']} />
                <div className="space-y-0.5">
                    <label className={lbl}>Outline</label>
                    <input value={(cur.outline as string) ?? ''} onChange={e => set('outline', e.target.value)} placeholder="2px solid #6366f1" className={inp} />
                </div>
            </Sec>

            {/* ─ Effects ─ */}
            <Sec title="Effects & Filters" icon={<I.RiMagicLine size={13} />}>
                <SliderRow label="Opacity" value={typeof cur.opacity === 'number' ? cur.opacity * 100 : 100} min={0} max={100} unit="%"
                    onChange={v => set('opacity', v / 100)} />
                <div className="pt-1 border-t border-border/15">
                    <label className={lbl}>Box Shadow</label>
                    <div className="mt-1">
                        <ShadowBuilder value={(cur.boxShadow as string) ?? ''} onChange={v => set('boxShadow', v)} />
                    </div>
                </div>
                <div className="pt-1 border-t border-border/15">
                    <label className={lbl}>CSS Filters</label>
                    <div className="mt-1">
                        <FilterEditor value={(cur.filter as string) ?? ''} onChange={v => set('filter', v)} />
                    </div>
                </div>
            </Sec>

            {/* ─ Transform ─ */}
            <Sec title="Transform" icon={<I.RiDragMoveLine size={13} />}>
                <TransformEditor value={(cur.transform as string) ?? ''} onChange={v => set('transform', v)} />
                <div className="space-y-0.5 pt-1 border-t border-border/15">
                    <label className={lbl}>Transform Origin</label>
                    <input value={(cur.transformOrigin as string) ?? ''} onChange={e => set('transformOrigin', e.target.value)} placeholder="center" className={inp} />
                </div>
            </Sec>

            {/* ─ Position ─ */}
            <Sec title="Position & Layer" icon={<I.RiLayoutLine size={13} />}>
                <div className="space-y-0.5">
                    <label className={lbl}>Position</label>
                    <BtnGroup options={[{ v: 'static', label: 'Static' }, { v: 'relative', label: 'Relative' }, { v: 'absolute', label: 'Absolute' }, { v: 'fixed', label: 'Fixed' }, { v: 'sticky', label: 'Sticky' }]}
                        value={(cur.position as string) ?? 'static'} onChange={v => set('position', v)} />
                </div>
                {(cur.position === 'absolute' || cur.position === 'fixed' || cur.position === 'sticky') && (
                    <div className="grid grid-cols-2 gap-2">
                        {(['top', 'right', 'bottom', 'left'] as const).map(d => (
                            <UnitInput key={d} label={d.charAt(0).toUpperCase() + d.slice(1)}
                                value={(cur[d] as string) ?? ''} onChange={v => set(d, v)} units={['px', '%', 'rem', 'auto']} />
                        ))}
                    </div>
                )}
                <div className="space-y-0.5">
                    <label className={lbl}>Z-Index</label>
                    <input type="number" value={(cur.zIndex as number) ?? ''} onChange={e => set('zIndex', e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="auto" className={inp} />
                </div>
                <div className="space-y-0.5">
                    <label className={lbl}>Display</label>
                    <select value={(cur.display as string) ?? ''} onChange={e => set('display', e.target.value)} className={inp}>
                        {['', 'block', 'flex', 'inline-flex', 'inline', 'inline-block', 'grid', 'none'].map(v => <option key={v} value={v}>{v || 'block'}</option>)}
                    </select>
                </div>
                {(cur.display === 'flex' || cur.display === 'inline-flex') && (
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                            <label className={lbl}>Direction</label>
                            <select value={(cur.flexDirection as string) ?? ''} onChange={e => set('flexDirection', e.target.value)} className={inp}>
                                {['row', 'column', 'row-reverse', 'column-reverse'].map(v => <option key={v}>{v}</option>)}
                            </select>
                        </div>
                        <div className="space-y-0.5">
                            <label className={lbl}>Wrap</label>
                            <select value={(cur.flexWrap as string) ?? ''} onChange={e => set('flexWrap', e.target.value)} className={inp}>
                                {['nowrap', 'wrap', 'wrap-reverse'].map(v => <option key={v}>{v}</option>)}
                            </select>
                        </div>
                        <div className="space-y-0.5">
                            <label className={lbl}>Align Items</label>
                            <select value={(cur.alignItems as string) ?? ''} onChange={e => set('alignItems', e.target.value)} className={inp}>
                                {['', 'stretch', 'center', 'flex-start', 'flex-end', 'baseline'].map(v => <option key={v} value={v}>{v || 'stretch'}</option>)}
                            </select>
                        </div>
                        <div className="space-y-0.5">
                            <label className={lbl}>Justify Content</label>
                            <select value={(cur.justifyContent as string) ?? ''} onChange={e => set('justifyContent', e.target.value)} className={inp}>
                                {['', 'flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'].map(v => <option key={v} value={v}>{v || 'flex-start'}</option>)}
                            </select>
                        </div>
                    </div>
                )}
                {cur.display === 'grid' && (
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                            <label className={lbl}>Template Cols</label>
                            <input value={(cur.gridTemplateColumns as string) ?? ''} onChange={e => set('gridTemplateColumns', e.target.value)} placeholder="1fr 1fr" className={inp} />
                        </div>
                        <div className="space-y-0.5">
                            <label className={lbl}>Template Rows</label>
                            <input value={(cur.gridTemplateRows as string) ?? ''} onChange={e => set('gridTemplateRows', e.target.value)} placeholder="auto" className={inp} />
                        </div>
                    </div>
                )}
            </Sec>

            {/* ─ Blend Modes ─ */}
            <Sec title="Blend Modes" icon={<I.RiStackLine size={13} />}>
                <div className="space-y-0.5">
                    <label className={lbl}>Mix Blend Mode</label>
                    <select value={(cur.mixBlendMode as string) ?? ''} onChange={e => set('mixBlendMode', e.target.value)} className={inp}>
                        {BLEND_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
                <div className="space-y-0.5">
                    <label className={lbl}>Background Blend Mode</label>
                    <select value={(cur.backgroundBlendMode as string) ?? ''} onChange={e => set('backgroundBlendMode', e.target.value)} className={inp}>
                        {BLEND_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </Sec>

            {/* ─ Animation ─ */}
            {onAnimationChange && (
                <Sec title="GSAP Animation" icon={<I.RiMovie2Line size={13} />}>
                    <AnimEditor anim={animation ?? DEFAULT_ANIM} onChange={onAnimationChange} />
                </Sec>
            )}

            {/* ─ Raw CSS ─ */}
            <Sec title="Raw CSS" icon={<I.RiCodeLine size={13} />}>
                <div className="space-y-0.5">
                    <label className={lbl}>Custom properties (key: value; ...)</label>
                    <textarea rows={4} value={(cur as any).__raw ?? ''}
                        onChange={e => upd({ ...cur, ...(e.target.value ? { __raw: e.target.value } as any : {}) })}
                        placeholder="font-variant: small-caps; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);"
                        className={`${inp} text-[10px] font-mono resize-none h-20`} />
                </div>
            </Sec>
        </div>
    );
}

export default StyleEditor;
