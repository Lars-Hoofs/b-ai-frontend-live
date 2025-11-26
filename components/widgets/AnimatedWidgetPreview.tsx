'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as RemixIcons from '@remixicon/react';
import { WidgetConfig } from './AdvancedWidgetEditor';
import { RiPlayFill, RiRefreshLine } from '@remixicon/react';

interface AnimatedWidgetPreviewProps {
  config: WidgetConfig;
}

export function AnimatedWidgetPreview({ config }: AnimatedWidgetPreviewProps) {
  const [showWidget, setShowWidget] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [key, setKey] = useState(0);

  // Get animation variants
  const getAnimationVariants = () => {
    const type = config.animationType || 'slide';
    const direction = config.animationDirection || 'bottom';
    const duration = (config.animationDuration || 500) / 1000;
    const delay = (config.animationDelay || 0) / 1000;

    const baseTransition = {
      duration,
      delay,
      ease: type === 'bounce' ? [0.68, -0.55, 0.265, 1.55] : 'easeOut',
    };

    switch (type) {
      case 'slide':
        const slideDistance = 100;
        const slideFrom = {
          top: { y: -slideDistance, opacity: 0 },
          bottom: { y: slideDistance, opacity: 0 },
          left: { x: -slideDistance, opacity: 0 },
          right: { x: slideDistance, opacity: 0 },
          center: { scale: 0.5, opacity: 0 },
        };
        return {
          initial: slideFrom[direction as keyof typeof slideFrom] || slideFrom.bottom,
          animate: { x: 0, y: 0, scale: 1, opacity: 1 },
          exit: slideFrom[direction as keyof typeof slideFrom] || slideFrom.bottom,
          transition: baseTransition,
        };

      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: baseTransition,
        };

      case 'scale':
        return {
          initial: { scale: 0, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0, opacity: 0 },
          transition: baseTransition,
        };

      case 'bounce':
        return {
          initial: { y: -200, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -200, opacity: 0 },
          transition: baseTransition,
        };

      case 'flip':
        const flipAxis = direction === 'left' || direction === 'right' ? 'rotateY' : 'rotateX';
        return {
          initial: { [flipAxis]: 90, opacity: 0 },
          animate: { [flipAxis]: 0, opacity: 1 },
          exit: { [flipAxis]: 90, opacity: 0 },
          transition: baseTransition,
        };

      default:
        return {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: 20, opacity: 0 },
          transition: baseTransition,
        };
    }
  };

  // Get hover animation
  const getHoverAnimation = () => {
    const hover = config.hoverAnimation || 'lift';
    switch (hover) {
      case 'lift':
        return { y: -8, boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2)' };
      case 'grow':
        return { scale: 1.1 };
      case 'pulse':
        return { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 1 } };
      case 'rotate':
        return { rotate: 5 };
      case 'none':
        return {};
      default:
        return { y: -8 };
    }
  };

  // Get position styles
  const getPositionStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = { position: 'absolute' };
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

  // Get bubble styles with all enhancements
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

    // Shadow intensity mapping
    const shadows = {
      none: 'none',
      sm: '0 2px 8px rgba(0, 0, 0, 0.1)',
      md: '0 8px 24px rgba(0, 0, 0, 0.12)',
      lg: '0 12px 32px rgba(0, 0, 0, 0.15)',
      xl: '0 20px 48px rgba(0, 0, 0, 0.2)',
    };

    const styles: React.CSSProperties = {
      width: `${size.width}px`,
      height: `${size.height}px`,
      borderRadius,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: shadows[config.shadowIntensity || 'md'],
      fontSize: '12px',
      fontWeight: 600,
      padding: config.bubbleText ? '8px' : '0',
      gap: '6px',
      position: 'relative',
      overflow: config.bubbleImageUrl ? 'hidden' : 'visible',
    };

    // Apply gradient or solid color
    if (config.backgroundGradient?.from && config.backgroundGradient?.to) {
      const dir = config.backgroundGradient.direction || 'to-br';
      styles.background = `linear-gradient(${dir.replace('to-', '')}, ${config.backgroundGradient.from}, ${config.backgroundGradient.to})`;
    } else {
      styles.backgroundColor = config.bubbleBackgroundColor;
    }

    styles.color = config.bubbleTextColor;

    // Glass effect
    if (config.glassEffect) {
      styles.backdropFilter = `blur(${config.backdropBlur || 10}px)`;
      styles.backgroundColor = `${config.bubbleBackgroundColor}cc`; // Add transparency
    } else if (config.backdropBlur) {
      styles.backdropFilter = `blur(${config.backdropBlur}px)`;
    }

    // Border
    if (config.borderWidth && config.borderWidth > 0) {
      styles.border = `${config.borderWidth}px solid ${config.borderColor || config.bubbleTextColor}`;
    }

    return styles;
  };

  const Icon = config.bubbleIcon && (RemixIcons as any)[config.bubbleIcon]
    ? (RemixIcons as any)[config.bubbleIcon]
    : RemixIcons.RiChat1Line;

  const animationVariants = config.enableAnimation !== false ? getAnimationVariants() : undefined;

  const renderBubbleWidget = () => (
    <motion.div
      style={getBubbleStyles()}
      whileHover={config.enableAnimation !== false ? getHoverAnimation() : undefined}
      onClick={() => setShowChat(!showChat)}
    >
      {/* Image if present */}
      {config.bubbleImageUrl && config.imageIconRelation === 'cover' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${config.bubbleImageUrl})`,
          backgroundSize: config.bubbleImageFit || 'cover',
          backgroundPosition: 'center',
        }} />
      )}

      {/* Image with icon */}
      {config.bubbleImageUrl && config.imageIconRelation === 'overlay' && (
        <>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${config.bubbleImageUrl})`,
            backgroundSize: config.bubbleImageFit || 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
          }} />
          <Icon size={24} style={{ position: 'relative', zIndex: 1 }} />
        </>
      )}

      {/* Default icon + text */}
      {(!config.bubbleImageUrl || config.imageIconRelation === 'side-by-side') && (
        <>
          {config.bubbleText ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              <Icon size={20} />
              <span style={{ lineHeight: 1 }}>{config.bubbleText}</span>
            </div>
          ) : (
            <Icon size={24} style={{ position: 'relative', zIndex: 1 }} />
          )}
        </>
      )}
    </motion.div>
  );

  const replay = () => {
    setShowWidget(false);
    setTimeout(() => {
      setShowWidget(true);
      setKey(k => k + 1);
    }, 100);
  };

  return (
    <div className="space-y-4">
      {/* Preview Container */}
      <div className="bg-background border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-sm text-foreground">Animatie Preview</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Zie hoe je widget verschijnt met animaties
            </p>
          </div>
          <button
            onClick={replay}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <RiRefreshLine size={16} />
            Replay
          </button>
        </div>

        {/* Preview Area */}
        <div 
          className="relative bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
          style={{ 
            height: '400px',
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1), transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1), transparent 50%)',
          }}
        >
          {/* Demo website elements */}
          <div className="absolute top-4 left-4 right-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
            <div className="h-3 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-2 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Animated Widget */}
          <div style={{
            ...getPositionStyles(),
            zIndex: config.zIndex || 999999,
          }}>
            <AnimatePresence mode="wait">
              {showWidget && (
                <motion.div
                  key={key}
                  {...animationVariants}
                >
                  {renderBubbleWidget()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Animation Info */}
        <div className="px-4 py-3 border-t border-border bg-muted/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Type:</span>
              <span className="ml-2 font-medium text-foreground capitalize">
                {config.animationType || 'slide'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Richting:</span>
              <span className="ml-2 font-medium text-foreground capitalize">
                {config.animationDirection || 'bottom'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Duur:</span>
              <span className="ml-2 font-medium text-foreground">
                {config.animationDuration || 500}ms
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Hover:</span>
              <span className="ml-2 font-medium text-foreground capitalize">
                {config.hoverAnimation || 'lift'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Settings */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowWidget(!showWidget)}
          className="px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
        >
          {showWidget ? 'Verberg Widget' : 'Toon Widget'}
        </button>
        <button
          onClick={replay}
          className="px-4 py-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <RiPlayFill size={16} />
          Replay Animatie
        </button>
      </div>
    </div>
  );
}
