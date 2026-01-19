'use client';

import { useState } from 'react';
import { WidgetConfig } from './AdvancedWidgetEditor';

const GOOGLE_FONTS = [
    'Inter',
    'Roboto',
    'Outfit',
    'Poppins',
    'Montserrat',
    'Open Sans',
    'Lato',
    'Raleway',
    'Nunito',
    'Source Sans Pro',
    'PT Sans',
    'Merriweather',
    'Playfair Display',
    'Oswald',
    'Ubuntu',
];

interface TypographyTabProps {
    config: WidgetConfig;
    updateConfig: (updates: Partial<WidgetConfig>) => void;
}

export function TypographyTab({ config, updateConfig }: TypographyTabProps) {
    const [fontLoading, setFontLoading] = useState(false);

    const loadGoogleFont = (fontName: string) => {
        setFontLoading(true);
        const link = document.getElementById('google-font') as HTMLLinkElement;

        if (link) {
            link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@300;400;500;600;700;800&display=swap`;
        } else {
            const newLink = document.createElement('link');
            newLink.id = 'google-font';
            newLink.rel = 'stylesheet';
            newLink.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@300;400;500;600;700;800&display=swap`;
            document.head.appendChild(newLink);
        }

        setTimeout(() => setFontLoading(false), 500);
    };

    const updateFontSize = (key: 'header' | 'message' | 'input', value: number) => {
        updateConfig({
            fontSize: {
                ...config.fontSize,
                [key]: value,
            },
        });
    };

    const updateFontWeight = (key: 'header' | 'message' | 'input', value: number) => {
        updateConfig({
            fontWeight: {
                ...config.fontWeight,
                [key]: value,
            },
        });
    };

    const updateLineHeight = (key: 'header' | 'message' | 'input', value: number) => {
        updateConfig({
            lineHeight: {
                ...config.lineHeight,
                [key]: value,
            },
        });
    };

    const updateLetterSpacing = (key: 'header' | 'message' | 'input', value: number) => {
        updateConfig({
            letterSpacing: {
                ...config.letterSpacing,
                [key]: value,
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-l-4 border-purple-500 p-4 rounded-r-lg">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                    🎨 Typography Controle
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                    Kies je perfecte lettertype en pas alle tekststijlen aan voor een professionele uitstraling.
                </p>
            </div>

            {/* Font Family Selector */}
            <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                    Lettertype (Google Fonts)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {GOOGLE_FONTS.map((font) => (
                        <button
                            key={font}
                            onClick={() => {
                                updateConfig({ fontFamily: font });
                                loadGoogleFont(font);
                            }}
                            className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${config.fontFamily === font
                                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                    : 'border-border hover:border-primary/50'
                                }
              `}
                            style={{ fontFamily: font }}
                        >
                            <div className="font-semibold text-sm">{font}</div>
                            <div className="text-xs text-muted-foreground mt-1">Aa Bb Cc 123</div>
                        </button>
                    ))}
                </div>
                {fontLoading && (
                    <p className="text-xs text-muted-foreground mt-2">Laden...</p>
                )}
            </div>

            {/* Font Preview */}
            <div className="bg-card border rounded-xl p-5 space-y-4">
                <h3 className="font-semibold text-foreground">Voorbeeld</h3>
                <div
                    className="p-4 bg-muted/30 rounded-lg space-y-3"
                    style={{ fontFamily: config.fontFamily || 'system-ui' }}
                >
                    <div
                        style={{
                            fontSize: `${config.fontSize?.header || 18}px`,
                            fontWeight: config.fontWeight?.header || 700,
                            lineHeight: config.lineHeight?.header || 1.4,
                            letterSpacing: `${config.letterSpacing?.header || -0.02}em`,
                        }}
                    >
                        Chat Support Header
                    </div>
                    <div
                        style={{
                            fontSize: `${config.fontSize?.message || 14}px`,
                            fontWeight: config.fontWeight?.message || 400,
                            lineHeight: config.lineHeight?.message || 1.6,
                            letterSpacing: `${config.letterSpacing?.message || 0}em`,
                        }}
                    >
                        Dit is een voorbeeldbericht om te zien hoe je tekst eruitziet.
                    </div>
                    <div
                        style={{
                            fontSize: `${config.fontSize?.input || 14}px`,
                            fontWeight: config.fontWeight?.input || 400,
                            lineHeight: config.lineHeight?.input || 1.5,
                            letterSpacing: `${config.letterSpacing?.input || 0}em`,
                        }}
                    >
                        Type je bericht hier...
                    </div>
                </div>
            </div>

            {/* Header Typography */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground border-b pb-2">
                    Header Typografie
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-muted-foreground mb-2">
                            Lettergrootte (px)
                        </label>
                        <input
                            type="number"
                            value={config.fontSize?.header || 18}
                            onChange={(e) => updateFontSize('header', parseInt(e.target.value))}
                            min={12}
                            max={32}
                            className="w-full px-4 py-2 bg-background border border-input rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-2">
                            Dikte (Weight)
                        </label>
                        <select
                            value={config.fontWeight?.header || 700}
                            onChange={(e) => updateFontWeight('header', parseInt(e.target.value))}
                            className="w-full px-4 py-2 bg-background border border-input rounded-lg"
                        >
                            <option value={300}>Light (300)</option>
                            <option value={400}>Regular (400)</option>
                            <option value={500}>Medium (500)</option>
                            <option value={600}>Semi-Bold (600)</option>
                            <option value={700}>Bold (700)</option>
                            <option value={800}>Extra-Bold (800)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-2">
                            Lijnhoogte
                        </label>
                        <input
                            type="number"
                            value={config.lineHeight?.header || 1.4}
                            onChange={(e) => updateLineHeight('header', parseFloat(e.target.value))}
                            step={0.1}
                            min={1}
                            max={2}
                            className="w-full px-4 py-2 bg-background border border-input rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-2">
                            Letter Spacing (em)
                        </label>
                        <input
                            type="number"
                            value={config.letterSpacing?.header || -0.02}
                            onChange={(e) => updateLetterSpacing('header', parseFloat(e.target.value))}
                            step={0.01}
                            min={-0.1}
                            max={0.2}
                            className="w-full px-4 py-2 bg-background border border-input rounded-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Message Typography */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground border-b pb-2">
                    Bericht Typografie
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-muted-foreground mb-2">
                            Lettergrootte (px)
                        </label>
                        <input
                            type="number"
                            value={config.fontSize?.message || 14}
                            onChange={(e) => updateFontSize('message', parseInt(e.target.value))}
                            min={10}
                            max={20}
                            className="w-full px-4 py-2 bg-background border border-input rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-2">
                            Dikte (Weight)
                        </label>
                        <select
                            value={config.fontWeight?.message || 400}
                            onChange={(e) => updateFontWeight('message', parseInt(e.target.value))}
                            className="w-full px-4 py-2 bg-background border border-input rounded-lg"
                        >
                            <option value={300}>Light (300)</option>
                            <option value={400}>Regular (400)</option>
                            <option value={500}>Medium (500)</option>
                            <option value={600}>Semi-Bold (600)</option>
                            <option value={700}>Bold (700)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-2">
                            Lijnhoogte
                        </label>
                        <input
                            type="number"
                            value={config.lineHeight?.message || 1.6}
                            onChange={(e) => updateLineHeight('message', parseFloat(e.target.value))}
                            step={0.1}
                            min={1}
                            max={2}
                            className="w-full px-4 py-2 bg-background border border-input rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-2">
                            Letter Spacing (em)
                        </label>
                        <input
                            type="number"
                            value={config.letterSpacing?.message || 0}
                            onChange={(e) => updateLetterSpacing('message', parseFloat(e.target.value))}
                            step={0.01}
                            min={-0.05}
                            max={0.1}
                            className="w-full px-4 py-2 bg-background border border-input rounded-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Input Typography */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg text-foreground border-b pb-2">
                    Input Typografie
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-muted-foreground mb-2">
                            Lettergrootte (px)
                        </label>
                        <input
                            type="number"
                            value={config.fontSize?.input || 14}
                            onChange={(e) => updateFontSize('input', parseInt(e.target.value))}
                            min={10}
                            max={18}
                            className="w-full px-4 py-2 bg-background border border-input rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-2">
                            Dikte (Weight)
                        </label>
                        <select
                            value={config.fontWeight?.input || 400}
                            onChange={(e) => updateFontWeight('input', parseInt(e.target.value))}
                            className="w-full px-4 py-2 bg-background border border-input rounded-lg"
                        >
                            <option value={300}>Light (300)</option>
                            <option value={400}>Regular (400)</option>
                            <option value={500}>Medium (500)</option>
                            <option value={600}>Semi-Bold (600)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-2">
                            Lijnhoogte
                        </label>
                        <input
                            type="number"
                            value={config.lineHeight?.input || 1.5}
                            onChange={(e) => updateLineHeight('input', parseFloat(e.target.value))}
                            step={0.1}
                            min={1}
                            max={2}
                            className="w-full px-4 py-2 bg-background border border-input rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-muted-foreground mb-2">
                            Letter Spacing (em)
                        </label>
                        <input
                            type="number"
                            value={config.letterSpacing?.input || 0}
                            onChange={(e) => updateLetterSpacing('input', parseFloat(e.target.value))}
                            step={0.01}
                            min={-0.05}
                            max={0.1}
                            className="w-full px-4 py-2 bg-background border border-input rounded-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Presets */}
            <div>
                <h3 className="font-semibold text-foreground mb-3">Snelle Presets</h3>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => {
                            updateConfig({
                                fontFamily: 'Inter',
                                fontSize: { header: 18, message: 14, input: 14 },
                                fontWeight: { header: 700, message: 400, input: 400 },
                                lineHeight: { header: 1.4, message: 1.6, input: 1.5 },
                                letterSpacing: { header: -0.02, message: 0, input: 0 },
                            });
                            loadGoogleFont('Inter');
                        }}
                        className="p-4 border-2 border-border hover:border-primary rounded-lg text-left transition-all"
                    >
                        <div className="font-semibold text-sm">Modern & Clean</div>
                        <div className="text-xs text-muted-foreground mt-1">Inter, balanced spacing</div>
                    </button>
                    <button
                        onClick={() => {
                            updateConfig({
                                fontFamily: 'Poppins',
                                fontSize: { header: 20, message: 15, input: 15 },
                                fontWeight: { header: 600, message: 400, input: 400 },
                                lineHeight: { header: 1.3, message: 1.7, input: 1.5 },
                                letterSpacing: { header: 0, message: 0.01, input: 0 },
                            });
                            loadGoogleFont('Poppins');
                        }}
                        className="p-4 border-2 border-border hover:border-primary rounded-lg text-left transition-all"
                    >
                        <div className="font-semibold text-sm">Friendly & Round</div>
                        <div className="text-xs text-muted-foreground mt-1">Poppins, relaxed feel</div>
                    </button>
                    <button
                        onClick={() => {
                            updateConfig({
                                fontFamily: 'Roboto',
                                fontSize: { header: 18, message: 14, input: 14 },
                                fontWeight: { header: 500, message: 400, input: 400 },
                                lineHeight: { header: 1.5, message: 1.6, input: 1.5 },
                                letterSpacing: { header: 0, message: 0, input: 0 },
                            });
                            loadGoogleFont('Roboto');
                        }}
                        className="p-4 border-2 border-border hover:border-primary rounded-lg text-left transition-all"
                    >
                        <div className="font-semibold text-sm">Classic & Readable</div>
                        <div className="text-xs text-muted-foreground mt-1">Roboto, neutral style</div>
                    </button>
                    <button
                        onClick={() => {
                            updateConfig({
                                fontFamily: 'Outfit',
                                fontSize: { header: 19, message: 14, input: 14 },
                                fontWeight: { header: 600, message: 400, input: 400 },
                                lineHeight: { header: 1.4, message: 1.6, input: 1.5 },
                                letterSpacing: { header: -0.01, message: 0, input: 0 },
                            });
                            loadGoogleFont('Outfit');
                        }}
                        className="p-4 border-2 border-border hover:border-primary rounded-lg text-left transition-all"
                    >
                        <div className="font-semibold text-sm">Bold & Statement</div>
                        <div className="text-xs text-muted-foreground mt-1">Outfit, eye-catching</div>
                    </button>
                </div>
            </div>
        </div>
    );
}
