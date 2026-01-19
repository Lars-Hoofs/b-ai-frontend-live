import { WidgetConfig } from './AdvancedWidgetEditor';

interface AvatarGradientEditorProps {
    config: WidgetConfig;
    updateConfig: (updates: Partial<WidgetConfig>) => void;
}

export function AvatarGradientEditor({ config, updateConfig }: AvatarGradientEditorProps) {
    const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
        <div>
            <label className="block text-xs text-muted-foreground mb-2">
                {label}
            </label>
            <div className="flex gap-3">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-12 h-10 rounded-lg cursor-pointer border border-input shadow-sm"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 px-3 py-2 bg-background border border-input rounded-lg font-mono text-xs shadow-sm"
                />
            </div>
        </div>
    );

    const GRADIENT_PRESETS = [
        { name: 'Sunset', from: '#ff6b6b', to: '#feca57', direction: 'to-br' },
        { name: 'Ocean', from: '#667eea', to: '#764ba2', direction: 'to-br' },
        { name: 'Forest', from: '#56ab2f', to: '#a8e063', direction: 'to-br' },
        { name: 'Fire', from: '#ee0979', to: '#ff6a00', direction: 'to-br' },
        { name: 'Sky', from: '#00d2ff', to: '#3a7bd5', direction: 'to-br' },
        { name: 'Purple', from: '#a8c0ff', to: '#3f2b96', direction: 'to-br' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950/20 dark:to-pink-950/20 border-l-4 border-orange-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 flex items-center gap-2">
                    ✨ Avatar Gradient
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    Creëer een moderne, opvallende gradient avatar zoals in moderne chat apps.
                </p>
            </div>

            {/* Enable Avatar Gradient */}
            <div className="flex items-center gap-4 p-4 border rounded-xl bg-card">
                <input
                    type="checkbox"
                    id="enableAvatarGradient"
                    checked={!!config.avatarGradient}
                    onChange={(e) => {
                        if (e.target.checked) {
                            updateConfig({
                                avatarGradient: {
                                    from: '#ff6b6b',
                                    to: '#feca57',
                                    direction: 'to-br',
                                },
                            });
                        } else {
                            updateConfig({ avatarGradient: undefined });
                        }
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <div className="flex-1">
                    <label htmlFor="enableAvatarGradient" className="font-medium text-foreground cursor-pointer">
                        Gebruik Avatar Gradient
                    </label>
                    <p className="text-xs text-muted-foreground">
                        Maak je avatar modern met een mooie gradient zoals in de screenshot
                    </p>
                </div>
            </div>

            {/* Gradient Controls */}
            {config.avatarGradient && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Gradient Colors */}
                    <div className="bg-card border rounded-xl p-5 space-y-4">
                        <h4 className="font-semibold text-sm">Gradient Kleuren</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <ColorInput
                                label="Start Kleur"
                                value={config.avatarGradient.from}
                                onChange={(v) =>
                                    updateConfig({
                                        avatarGradient: { ...config.avatarGradient!, from: v },
                                    })
                                }
                            />
                            <ColorInput
                                label="Eind Kleur"
                                value={config.avatarGradient.to}
                                onChange={(v) =>
                                    updateConfig({
                                        avatarGradient: { ...config.avatarGradient!, to: v },
                                    })
                                }
                            />
                        </div>

                        {/* Direction */}
                        <div>
                            <label className="block text-xs text-muted-foreground mb-2">
                                Gradient Richting
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {['to-t', 'to-tr', 'to-r', 'to-br', 'to-b', 'to-bl', 'to-l', 'to-tl'].map((dir) => (
                                    <button
                                        key={dir}
                                        onClick={() =>
                                            updateConfig({
                                                avatarGradient: { ...config.avatarGradient!, direction: dir },
                                            })
                                        }
                                        className={`
                      h-10 rounded border-2 transition-all relative overflow-hidden
                      ${config.avatarGradient?.direction === dir
                                                ? 'border-primary ring-2 ring-primary/20'
                                                : 'border-input hover:border-primary/50'
                                            }
                    `}
                                        title={dir}
                                        style={{
                                            background: `linear-gradient(${dir.replace('to-', 'to ')}, ${config.avatarGradient.from}, ${config.avatarGradient.to})`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Presets */}
                    <div>
                        <h4 className="font-semibold text-sm mb-3">Snelle Presets</h4>
                        <div className="grid grid-cols-3 gap-3">
                            {GRADIENT_PRESETS.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() =>
                                        updateConfig({
                                            avatarGradient: {
                                                from: preset.from,
                                                to: preset.to,
                                                direction: preset.direction,
                                            },
                                        })
                                    }
                                    className="group relative p-4 rounded-lg border-2 border-border hover:border-primary transition-all overflow-hidden"
                                >
                                    <div
                                        className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                                        style={{
                                            background: `linear-gradient(${preset.direction.replace('to-', 'to ')}, ${preset.from}, ${preset.to})`,
                                        }}
                                    />
                                    <div className="relative">
                                        <div
                                            className="w-12 h-12 rounded-full mx-auto mb-2 border-2 border-white/50"
                                            style={{
                                                background: `linear-gradient(${preset.direction.replace('to-', 'to ')}, ${preset.from}, ${preset.to})`,
                                            }}
                                        />
                                        <div className="text-xs font-medium text-center">{preset.name}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Additional Options */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-muted-foreground mb-2">
                                Avatar Grootte (px)
                            </label>
                            <input
                                type="number"
                                value={config.avatarSize || 44}
                                onChange={(e) => updateConfig({ avatarSize: parseInt(e.target.value) })}
                                min={32}
                                max={80}
                                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-muted-foreground mb-2">
                                Border Kleur
                            </label>
                            <input
                                type="color"
                                value={config.avatarBorderColor || '#ffffff'}
                                onChange={(e) => updateConfig({ avatarBorderColor: e.target.value })}
                                className="w-full h-10 rounded-lg cursor-pointer border border-input"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-muted-foreground mb-2">
                                Border Dikte (px)
                            </label>
                            <input
                                type="number"
                                value={config.avatarBorderWidth || 0}
                                onChange={(e) => updateConfig({ avatarBorderWidth: parseInt(e.target.value) })}
                                min={0}
                                max={5}
                                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-muted/30 rounded-xl p-6 flex items-center justify-center">
                        <div className="text-center">
                            <div
                                className="mx-auto rounded-full flex items-center justify-center shadow-lg"
                                style={{
                                    width: `${config.avatarSize || 44}px`,
                                    height: `${config.avatarSize || 44}px`,
                                    background: `linear-gradient(${config.avatarGradient.direction.replace('to-', 'to ')}, ${config.avatarGradient.from}, ${config.avatarGradient.to})`,
                                    border: config.avatarBorderWidth
                                        ? `${config.avatarBorderWidth}px solid ${config.avatarBorderColor || '#ffffff'}`
                                        : undefined,
                                }}
                            >
                                <span style={{ fontSize: `${(config.avatarSize || 44) * 0.5}px` }}>
                                    {config.headerAvatarEmoji || '👤'}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">Avatar Voorbeeld</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
