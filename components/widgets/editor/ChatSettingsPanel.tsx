'use client';

import React from 'react';
import { WidgetConfig, ensureHex } from './types';
import * as RemixIcons from 'react-icons/ri';

interface Props {
    config: WidgetConfig;
    onChange: (c: WidgetConfig) => void;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
            <div className="flex gap-2 items-center">
                <input type="color" value={ensureHex(value) || '#000000'} onChange={(e) => onChange(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-border/50 cursor-pointer p-0 bg-transparent" />
                <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)}
                    className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-border/50 bg-muted/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all" placeholder="#000000" />
            </div>
        </div>
    );
}

function TextField({ label, value, onChange, placeholder, multiline }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }) {
    return (
        <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
            {multiline ? (
                <textarea value={value || ''} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-border/50 bg-muted/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all resize-none" />
            ) : (
                <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-border/50 bg-muted/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all" />
            )}
        </div>
    );
}

function NumberField({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
    return (
        <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
            <input type="number" value={value ?? ''} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} min={min} max={max} step={step}
                className="w-full text-xs px-3 py-2 rounded-lg border border-border/50 bg-muted/30 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all" />
        </div>
    );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
    return (
        <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
            <select value={value || ''} onChange={(e) => onChange(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-border/50 bg-muted/30 focus:border-primary/50 outline-none transition-all">
                {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );
}

function ToggleField({ label, value, onChange, description }: { label: string; value: boolean; onChange: (v: boolean) => void; description?: string }) {
    return (
        <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`relative w-10 h-5 rounded-full transition-all duration-300 ${value ? 'bg-primary shadow-[0_0_12px_rgba(99,102,241,0.3)]' : 'bg-muted-foreground/20'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${value ? 'left-5' : 'left-0.5'}`} />
            </div>
            <div>
                <span className="text-xs font-medium">{label}</span>
                {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
            </div>
        </label>
    );
}

function Section({ title, icon, children, defaultOpen = true }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = React.useState(defaultOpen);
    return (
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden transition-all">
            <button onClick={() => setOpen(!open)}
                className="w-full px-5 py-3.5 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                <span className="text-primary">{icon}</span>
                <span className="text-sm font-semibold flex-1 text-left">{title}</span>
                <RemixIcons.RiArrowDownSLine size={16} className={`text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <div className="px-5 pb-5 space-y-4 border-t border-border/30 pt-4">{children}</div>}
        </div>
    );
}

export default function ChatSettingsPanel({ config, onChange }: Props) {
    const set = (updates: Partial<WidgetConfig>) => onChange({ ...config, ...updates });

    return (
        <div className="flex-1 overflow-auto">
            <div className="max-w-3xl mx-auto p-6 space-y-4">
                {/* Hero Header */}
                <div className="text-center pb-2">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Widget Settings</h2>
                    <p className="text-xs text-muted-foreground mt-1">Configure every aspect of your chat widget</p>
                </div>

                {/* === HEADER === */}
                <Section title="Header" icon={<RemixIcons.RiLayoutTopLine size={18} />}>
                    <div className="grid grid-cols-1 gap-3">
                        <TextField label="Title" value={config.headerTitle || ''} onChange={v => set({ headerTitle: v })} placeholder="Chat Support" />
                        <TextField label="Subtitle" value={config.headerSubtitle || ''} onChange={v => set({ headerSubtitle: v })} placeholder="We're here to help" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <ColorField label="Background" value={config.headerBackgroundColor || '#ffffff'} onChange={v => set({ headerBackgroundColor: v })} />
                        <ColorField label="Text Color" value={config.headerTextColor || '#000000'} onChange={v => set({ headerTextColor: v })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <ToggleField label="Show Avatar" value={config.showAgentAvatar !== false} onChange={v => set({ showAgentAvatar: v })} />
                        <ToggleField label="Online Status" value={config.showOnlineStatus || false} onChange={v => set({ showOnlineStatus: v })} />
                    </div>
                    <TextField label="Avatar URL" value={config.headerAvatarUrl || ''} onChange={v => set({ headerAvatarUrl: v })} placeholder="https://..." />
                    <TextField label="Avatar Emoji" value={config.headerAvatarEmoji || ''} onChange={v => set({ headerAvatarEmoji: v })} placeholder="🤖" />
                    <ColorField label="Online Status Color" value={config.onlineStatusColor || '#10b981'} onChange={v => set({ onlineStatusColor: v })} />
                </Section>

                {/* === MESSAGES === */}
                <Section title="Messages & Behavior" icon={<RemixIcons.RiMessage3Line size={18} />}>
                    <TextField label="Greeting" value={config.greeting || ''} onChange={v => set({ greeting: v })} placeholder="Hello! How can I help?" multiline />
                    <TextField label="Input Placeholder" value={config.placeholder || ''} onChange={v => set({ placeholder: v })} placeholder="Type a message..." />
                    <div className="grid grid-cols-2 gap-3">
                        <ColorField label="User Message BG" value={config.userMessageColor || '#6366f1'} onChange={v => set({ userMessageColor: v })} />
                        <ColorField label="User Message Text" value={config.userMessageTextColor || '#ffffff'} onChange={v => set({ userMessageTextColor: v })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <ColorField label="Bot Message BG" value={config.botMessageColor || '#f3f4f6'} onChange={v => set({ botMessageColor: v })} />
                        <ColorField label="Bot Message Text" value={config.botMessageTextColor || '#1f2937'} onChange={v => set({ botMessageTextColor: v })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <NumberField label="Message Border Radius" value={config.messageBorderRadius || 18} onChange={v => set({ messageBorderRadius: v })} min={0} max={50} />
                        <ColorField label="Chat Background" value={config.chatBackgroundColor || '#ffffff'} onChange={v => set({ chatBackgroundColor: v })} />
                    </div>
                    <ColorField label="Typing Indicator Color" value={config.typingIndicatorColor || '#9ca3af'} onChange={v => set({ typingIndicatorColor: v })} />
                </Section>

                {/* === INPUT STYLING === */}
                <Section title="Input Field" icon={<RemixIcons.RiInputMethodLine size={18} />} defaultOpen={false}>
                    <div className="grid grid-cols-2 gap-3">
                        <ColorField label="Border Color" value={config.inputBorderColor || 'transparent'} onChange={v => set({ inputBorderColor: v })} />
                        <ColorField label="Focus Border" value={config.inputFocusBorderColor || '#6366f1'} onChange={v => set({ inputFocusBorderColor: v })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <ColorField label="Background" value={config.inputBackgroundColor || '#f3f4f6'} onChange={v => set({ inputBackgroundColor: v })} />
                        <ColorField label="Text Color" value={config.inputTextColor || '#1f2937'} onChange={v => set({ inputTextColor: v })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <ColorField label="Placeholder Color" value={config.inputPlaceholderColor || '#9ca3af'} onChange={v => set({ inputPlaceholderColor: v })} />
                        <ColorField label="Area Background" value={config.inputAreaBackgroundColor || '#ffffff'} onChange={v => set({ inputAreaBackgroundColor: v })} />
                    </div>
                    <ColorField label="Area Border Color" value={config.inputAreaBorderColor || 'transparent'} onChange={v => set({ inputAreaBorderColor: v })} />
                </Section>

                {/* === SEND BUTTON === */}
                <Section title="Send Button" icon={<RemixIcons.RiSendPlaneLine size={18} />} defaultOpen={false}>
                    <TextField label="Send Icon" value={config.sendButtonIcon || ''} onChange={v => set({ sendButtonIcon: v })} placeholder="RiSendPlaneFill" />
                    <div className="grid grid-cols-2 gap-3">
                        <ColorField label="Background" value={config.sendButtonBackgroundColor || 'transparent'} onChange={v => set({ sendButtonBackgroundColor: v })} />
                        <ColorField label="Icon Color" value={config.sendButtonIconColor || '#000000'} onChange={v => set({ sendButtonIconColor: v })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <ColorField label="Hover BG" value={config.sendButtonHoverBackgroundColor || ''} onChange={v => set({ sendButtonHoverBackgroundColor: v })} />
                        <ColorField label="Hover Icon" value={config.sendButtonHoverIconColor || ''} onChange={v => set({ sendButtonHoverIconColor: v })} />
                    </div>
                </Section>

                {/* === CHAT WINDOW === */}
                <Section title="Chat Window" icon={<RemixIcons.RiChat3Line size={18} />}>
                    <div className="grid grid-cols-2 gap-3">
                        <NumberField label="Width (px)" value={config.chatWidth || 380} onChange={v => set({ chatWidth: v })} min={300} max={800} />
                        <NumberField label="Height (px)" value={config.chatHeight || 650} onChange={v => set({ chatHeight: v })} min={400} max={900} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <NumberField label="Border Radius" value={config.chatBorderRadius || 24} onChange={v => set({ chatBorderRadius: v })} min={0} max={50} />
                        <SelectField label="Open Animation" value={config.chatAnimation || 'slide-up'} onChange={v => set({ chatAnimation: v })}
                            options={[{ value: 'none', label: 'None' }, { value: 'slide-up', label: 'Slide Up' }, { value: 'slide-down', label: 'Slide Down' }, { value: 'fade', label: 'Fade' }, { value: 'scale', label: 'Scale' }]} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <NumberField label="Offset X" value={config.chatOffsetX || 0} onChange={v => set({ chatOffsetX: v })} min={-500} max={500} />
                        <NumberField label="Offset Y" value={config.chatOffsetY || 0} onChange={v => set({ chatOffsetY: v })} min={-500} max={500} />
                    </div>
                    <SelectField label="Layout Mode" value={config.layoutMode || 'fixed'} onChange={v => set({ layoutMode: v as any })}
                        options={[{ value: 'fixed', label: 'Fixed Size' }, { value: 'percentage', label: 'Percentage' }, { value: 'full-height', label: 'Full Height' }, { value: 'full-width', label: 'Full Width' }]} />
                </Section>

                {/* === POSITION === */}
                <Section title="Position & Layout" icon={<RemixIcons.RiLayout4Line size={18} />} defaultOpen={false}>
                    <SelectField label="Position" value={config.position || 'bottom-right'} onChange={v => set({ position: v as any })}
                        options={[
                            { value: 'bottom-right', label: 'Bottom Right' }, { value: 'bottom-left', label: 'Bottom Left' },
                            { value: 'top-right', label: 'Top Right' }, { value: 'top-left', label: 'Top Left' },
                            { value: 'bottom-center', label: 'Bottom Center' }, { value: 'top-center', label: 'Top Center' },
                            { value: 'middle-right', label: 'Middle Right' }, { value: 'middle-left', label: 'Middle Left' },
                            { value: 'middle-center', label: 'Center' },
                        ]} />
                    <div className="grid grid-cols-2 gap-3">
                        <NumberField label="Offset X" value={config.offsetX || 0} onChange={v => set({ offsetX: v })} min={-500} max={500} />
                        <NumberField label="Offset Y" value={config.offsetY || 0} onChange={v => set({ offsetY: v })} min={-500} max={500} />
                    </div>
                    <NumberField label="Z-Index" value={config.zIndex || 999999} onChange={v => set({ zIndex: v })} min={1} max={999999} />
                </Section>

                {/* === ADVANCED STYLING === */}
                <Section title="Advanced Styling" icon={<RemixIcons.RiMagicLine size={18} />} defaultOpen={false}>
                    <ColorField label="Primary Color" value={config.primaryColor || '#6366f1'} onChange={v => set({ primaryColor: v })} />
                    <ToggleField label="Glass Effect" value={config.glassEffect || false} onChange={v => set({ glassEffect: v })} description="Frosted glass with backdrop blur" />
                    {config.glassEffect && (
                        <NumberField label="Backdrop Blur" value={config.backdropBlur || 20} onChange={v => set({ backdropBlur: v })} min={0} max={40} />
                    )}
                    <SelectField label="Shadow Intensity" value={config.shadowIntensity || 'md'} onChange={v => set({ shadowIntensity: v as any })}
                        options={[{ value: 'none', label: 'None' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }, { value: 'xl', label: 'Extra Large' }]} />
                    <ColorField label="Border Color" value={config.borderColor || ''} onChange={v => set({ borderColor: v })} />
                    <NumberField label="Border Width" value={config.borderWidth || 0} onChange={v => set({ borderWidth: v })} min={0} max={10} />
                </Section>

                {/* === BEHAVIOR === */}
                <Section title="Behavior" icon={<RemixIcons.RiSettings4Line size={18} />} defaultOpen={false}>
                    <ToggleField label="Auto Open" value={config.autoOpen || false} onChange={v => set({ autoOpen: v })} description="Automatically open the chat window" />
                    {config.autoOpen && (
                        <NumberField label="Auto Open Delay (ms)" value={config.autoOpenDelay || 3000} onChange={v => set({ autoOpenDelay: v })} min={0} max={60000} step={500} />
                    )}
                    <ToggleField label="Sound Enabled" value={config.soundEnabled || false} onChange={v => set({ soundEnabled: v })} description="Play sound on new messages" />
                    <ToggleField label="Show Sources" value={config.showSources !== false} onChange={v => set({ showSources: v })} description="Show source links on AI responses" />
                    {config.showSources !== false && (
                        <NumberField label="Max Visible Sources" value={config.maxVisibleSources || 3} onChange={v => set({ maxVisibleSources: v })} min={1} max={10} />
                    )}
                </Section>

                {/* === BRANDING === */}
                <Section title="Branding" icon={<RemixIcons.RiSparklingLine size={18} />} defaultOpen={false}>
                    <ToggleField label="Show Branding" value={config.showBranding !== false} onChange={v => set({ showBranding: v })} />
                    <TextField label="Branding Text" value={config.brandingText || ''} onChange={v => set({ brandingText: v })} placeholder="Powered by Bonsai" />
                    <TextField label="Branding URL" value={config.brandingUrl || ''} onChange={v => set({ brandingUrl: v })} placeholder="https://bonsaimedia.nl" />
                </Section>

                {/* === TYPOGRAPHY === */}
                <Section title="Typography" icon={<RemixIcons.RiTextSpacing size={18} />} defaultOpen={false}>
                    <TextField label="Font Family (Google Fonts)" value={config.fontFamily || ''} onChange={v => set({ fontFamily: v })} placeholder="Inter, Roboto, etc." />
                    <div className="grid grid-cols-3 gap-3">
                        <NumberField label="Header Size" value={config.fontSize?.header || 18} onChange={v => set({ fontSize: { ...config.fontSize, header: v } })} min={12} max={32} />
                        <NumberField label="Message Size" value={config.fontSize?.message || 15} onChange={v => set({ fontSize: { ...config.fontSize, message: v } })} min={10} max={20} />
                        <NumberField label="Input Size" value={config.fontSize?.input || 15} onChange={v => set({ fontSize: { ...config.fontSize, input: v } })} min={10} max={18} />
                    </div>
                </Section>

                {/* === CUSTOM CSS === */}
                <Section title="Custom CSS" icon={<RemixIcons.RiCodeLine size={18} />} defaultOpen={false}>
                    <div className="space-y-1">
                        <label className="text-[11px] font-medium text-muted-foreground">Custom CSS</label>
                        <textarea
                            value={config.customCss || ''} onChange={(e) => set({ customCss: e.target.value })}
                            rows={6} placeholder="/* Custom CSS for the widget */\n#ai-chat-widget-container { }"
                            className="w-full text-xs px-3 py-2 rounded-lg border border-border/50 bg-zinc-900 text-green-400 font-mono focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all resize-y"
                        />
                    </div>
                </Section>
            </div>
        </div>
    );
}
