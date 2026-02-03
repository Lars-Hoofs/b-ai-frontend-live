'use client';

import { useEffect, useRef } from 'react';
import * as RemixIcons from '@remixicon/react';
import { WidgetConfig } from './AdvancedWidgetEditor';

interface WidgetLivePreviewProps {
  config: WidgetConfig;
}

export function WidgetLivePreview({ config }: WidgetLivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Get position styles
  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
    };

    const offsetX = config.offsetX || 0;
    const offsetY = config.offsetY || 0;

    switch (config.position) {
      case 'top-left':
        return { ...base, top: `${20 + offsetY}px`, left: `${20 + offsetX}px` };
      case 'top-center':
        return { ...base, top: `${20 + offsetY}px`, left: '50%', transform: `translateX(calc(-50% + ${offsetX}px))` };
      case 'top-right':
        return { ...base, top: `${20 + offsetY}px`, right: `${20 - offsetX}px` };
      case 'middle-left':
        return { ...base, top: '50%', left: `${20 + offsetX}px`, transform: `translateY(calc(-50% + ${offsetY}px))` };
      case 'middle-center':
        return { ...base, top: '50%', left: '50%', transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))` };
      case 'middle-right':
        return { ...base, top: '50%', right: `${20 - offsetX}px`, transform: `translateY(calc(-50% + ${offsetY}px))` };
      case 'bottom-left':
        return { ...base, bottom: `${20 - offsetY}px`, left: `${20 + offsetX}px` };
      case 'bottom-center':
        return { ...base, bottom: `${20 - offsetY}px`, left: '50%', transform: `translateX(calc(-50% + ${offsetX}px))` };
      case 'bottom-right':
      default:
        return { ...base, bottom: `${20 - offsetY}px`, right: `${20 - offsetX}px` };
    }
  };

  // Get bubble styles
  const getBubbleStyles = (): React.CSSProperties => {
    let size = { width: 64, height: 64 };

    if (config.bubbleSize === 'small') size = { width: 48, height: 48 };
    else if (config.bubbleSize === 'large') size = { width: 80, height: 80 };
    else if (config.bubbleSize === 'custom' && config.bubbleWidth && config.bubbleHeight) {
      size = { width: config.bubbleWidth, height: config.bubbleHeight };
    }

    let borderRadius = '50%';
    if (config.bubbleShape === 'square') borderRadius = '0';
    else if (config.bubbleShape === 'rounded-square') borderRadius = '16px';

    return {
      width: `${size.width}px`,
      height: `${size.height}px`,
      backgroundColor: config.bubbleBackgroundColor,
      color: config.bubbleTextColor,
      borderRadius,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: config.bubbleShadow || '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
      transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      fontSize: '12px',
      fontWeight: 600,
      padding: config.bubbleText ? '8px' : '0',
      gap: '6px',
    };
  };

  // Get icon component
  const Icon = config.bubbleIcon && (RemixIcons as any)[config.bubbleIcon]
    ? (RemixIcons as any)[config.bubbleIcon]
    : RemixIcons.RiChat1Line;

  const renderBubbleWidget = () => (
    <div style={getBubbleStyles()}>
      {config.bubbleText ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
          <Icon size={20} />
          <span style={{ lineHeight: 1 }}>{config.bubbleText}</span>
        </div>
      ) : (
        <Icon size={24} />
      )}
    </div>
  );

  const renderSearchbarWidget = () => (
    <div style={{
      backgroundColor: config.bubbleBackgroundColor,
      color: config.bubbleTextColor,
      borderRadius: '24px',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      minWidth: '280px',
      cursor: 'text',
    }}>
      <Icon size={20} />
      <span style={{ fontSize: '14px', opacity: 0.8 }}>
        {config.placeholder || 'Type je bericht...'}
      </span>
    </div>
  );

  const renderCustomBoxWidget = () => (
    <div style={{
      backgroundColor: config.bubbleBackgroundColor,
      color: config.bubbleTextColor,
      borderRadius: '12px',
      padding: '16px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      cursor: 'pointer',
      maxWidth: '200px',
    }}>
      <Icon size={32} />
      {config.bubbleText && (
        <span style={{ fontSize: '14px', fontWeight: 600, textAlign: 'center' }}>
          {config.bubbleText}
        </span>
      )}
      {config.greeting && (
        <span style={{ fontSize: '12px', opacity: 0.8, textAlign: 'center' }}>
          {config.greeting.substring(0, 40)}{config.greeting.length > 40 ? '...' : ''}
        </span>
      )}
    </div>
  );

  const renderWidget = () => {
    switch (config.widgetType) {
      case 'searchbar':
        return renderSearchbarWidget();
      case 'custom-box':
        return renderCustomBoxWidget();
      case 'bubble':
      default:
        return renderBubbleWidget();
    }
  };

  return (
    <div className="sticky top-6">
      <div className="bg-background border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-sm text-foreground">Live Preview</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Zie hoe je widget er uit ziet op verschillende posities
          </p>
        </div>

        {/* Preview Area */}
        <div
          ref={containerRef}
          className="relative bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
          style={{
            height: '500px',
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1), transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1), transparent 50%)',
          }}
        >
          {/* Demo website elements */}
          <div className="absolute top-4 left-4 right-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
            <div className="h-3 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-2 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Widget */}
          <div style={{
            ...getPositionStyles(),
            zIndex: config.zIndex || 999999,
          }}>
            {renderWidget()}
          </div>
        </div>

        {/* Info */}
        <div className="px-4 py-3 border-t border-border bg-muted/30">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Type:</span>
              <span className="ml-2 font-medium text-foreground capitalize">
                {(config.widgetType || 'bubble').replace('-', ' ')}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Positie:</span>
              <span className="ml-2 font-medium text-foreground">
                {(config.position || 'bottom-right').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Grootte:</span>
              <span className="ml-2 font-medium text-foreground">
                {config.widgetType === 'bubble' ? config.bubbleSize : 'auto'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Chat:</span>
              <span className="ml-2 font-medium text-foreground">
                {config.chatWidth}×{config.chatHeight}px
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick tips */}
      <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <p className="text-xs text-muted-foreground">
          💡 <strong>Tip:</strong> Pas de offset aan in het Layout tabblad voor fijnafstelling van de positie
        </p>
      </div>
    </div>
  );
}
