'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as RemixIcons from '@remixicon/react';
import { WidgetConfig } from './AdvancedWidgetEditor';
import { RiCloseLine, RiSendPlaneFill, RiUser3Line, RiRobotLine } from '@remixicon/react';

interface InteractiveChatPreviewProps {
  config: WidgetConfig;
}

export function InteractiveChatPreview({ config }: InteractiveChatPreviewProps) {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; sources?: Array<{ title: string; url: string }> }>>([
    { text: config.greeting || 'Hoi! Hoe kan ik je helpen?', isUser: false }
  ]);
  const [inputValue, setInputValue] = useState('');

  const Icon = config.bubbleIcon && (RemixIcons as any)[config.bubbleIcon]
    ? (RemixIcons as any)[config.bubbleIcon]
    : RemixIcons.RiChat1Line;

  // Get chat window animation
  const getChatAnimation = () => {
    const animType = config.chatAnimation || 'slide-up';
    const duration = 0.3;

    switch (animType) {
      case 'slide-up':
        return {
          initial: { opacity: 0, y: 20, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: 20, scale: 0.95 },
          transition: { duration, ease: 'easeOut' as const },
        };
      case 'slide-down':
        return {
          initial: { opacity: 0, y: -20, scale: 0.95 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -20, scale: 0.95 },
          transition: { duration, ease: 'easeOut' as const },
        };
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration },
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.8 },
          transition: { duration, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] },
        };
      case 'none':
      default:
        return {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.15 },
        };
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

    if (config.backgroundGradient?.from && config.backgroundGradient?.to) {
      const dir = config.backgroundGradient.direction || 'to-br';
      styles.background = `linear-gradient(${dir.replace('to-', '')}, ${config.backgroundGradient.from}, ${config.backgroundGradient.to})`;
    } else {
      styles.backgroundColor = config.bubbleBackgroundColor;
    }

    styles.color = config.bubbleTextColor;

    if (config.glassEffect) {
      styles.backdropFilter = `blur(${config.backdropBlur || 10}px)`;
      styles.backgroundColor = `${config.bubbleBackgroundColor}cc`;
    } else if (config.backdropBlur) {
      styles.backdropFilter = `blur(${config.backdropBlur}px)`;
    }

    if (config.borderWidth && config.borderWidth > 0) {
      styles.border = `${config.borderWidth}px solid ${config.borderColor || config.bubbleTextColor}`;
    }

    return styles;
  };

  // Get chat window size based on layout mode
  const getChatWindowSize = (): React.CSSProperties => {
    const layoutMode = config.layoutMode || 'fixed';
    const styles: React.CSSProperties = {};

    switch (layoutMode) {
      case 'full-height':
        styles.height = '100%';
        styles.width = `${config.chatWidth}px`;
        if (config.maxWidth) styles.maxWidth = `${config.maxWidth}px`;
        if (config.minWidth) styles.minWidth = `${config.minWidth}px`;
        break;

      case 'full-width':
        styles.width = '100%';
        styles.height = `${config.chatHeight}px`;
        if (config.maxHeight) styles.maxHeight = `${config.maxHeight}px`;
        if (config.minHeight) styles.minHeight = `${config.minHeight}px`;
        break;

      case 'percentage':
        styles.width = `${config.widthPercentage || 80}%`;
        styles.height = `${config.heightPercentage || 80}%`;
        if (config.maxWidth) styles.maxWidth = `${config.maxWidth}px`;
        if (config.minWidth) styles.minWidth = `${config.minWidth}px`;
        if (config.maxHeight) styles.maxHeight = `${config.maxHeight}px`;
        if (config.minHeight) styles.minHeight = `${config.minHeight}px`;
        break;

      case 'fixed':
      default:
        styles.width = `${config.chatWidth}px`;
        styles.height = `${config.chatHeight}px`;
        break;
    }

    return styles;
  };

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    setMessages([...messages,
    { text: inputValue, isUser: true },
    {
      text: 'Bedankt voor je bericht! Dit is een voorbeeld antwoord.',
      isUser: false,
      sources: [
        { title: 'Google', url: 'https://google.com' },
        { title: 'Bonsai Media', url: 'https://bonsaimedia.nl' },
        { title: 'Example', url: 'https://example.com' },
        { title: 'OpenAI', url: 'https://openai.com' }
      ]
    }
    ]);
    setInputValue('');
  };

  const chatAnimation = getChatAnimation();

  return (
    <div className="space-y-4">
      {/* Preview Container */}
      <div className="bg-background border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-sm text-foreground">Interactieve Chat Preview</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Klik op de widget om de chat te openen
            </p>
          </div>
        </div>

        {/* Preview Area */}
        <div
          className="relative bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
          style={{
            height: '600px',
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.1), transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1), transparent 50%)',
          }}
        >
          {/* Demo website elements */}
          <div className="absolute top-4 left-4 right-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
            <div className="h-3 w-32 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
            <div className="h-2 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>

          {/* Widget Bubble */}
          <div style={{
            ...getPositionStyles(),
            zIndex: config.zIndex || 999999,
          }}>
            <motion.div
              style={getBubbleStyles()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowChat(!showChat)}
            >
              {config.bubbleImageUrl && config.imageIconRelation === 'cover' && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${config.bubbleImageUrl})`,
                  backgroundSize: config.bubbleImageFit || 'cover',
                  backgroundPosition: 'center',
                }} />
              )}

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

            {/* Chat Window */}
            <AnimatePresence mode="wait">
              {showChat && (
                <motion.div
                  {...chatAnimation}
                  style={{
                    ...getChatWindowSize(),
                    position: 'absolute',
                    // Voor full-height: neem volledige hoogte van container, anders normal offset
                    ...(config.layoutMode === 'full-height'
                      ? { top: 0, bottom: 0 }
                      : { bottom: '80px' }
                    ),
                    // Voor full-width: neem volledige breedte
                    ...(config.layoutMode === 'full-width'
                      ? { left: 0, right: 0 }
                      : config.position.includes('left')
                        ? { left: 0 }
                        : { right: 0 }
                    ),
                    backgroundColor: config.glassEffect
                      ? (config.theme === 'dark' ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)')
                      : '#ffffff',
                    backdropFilter: config.glassEffect ? `blur(${config.backdropBlur || 12}px)` : 'none',
                    border: config.glassEffect ? '1px solid rgba(255,255,255,0.2)' : 'none',
                    borderRadius: `${config.chatBorderRadius}px`,
                    boxShadow: config.shadowIntensity === 'none' ? 'none' : '0 20px 60px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  {/* Chat Header */}
                  <div
                    style={{
                      backgroundColor: config.glassEffect ? 'transparent' : config.headerBackgroundColor,
                      color: config.headerTextColor,
                      padding: '16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {config.showAgentAvatar !== false && (
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: config.avatarBackgroundColor || 'rgba(255,255,255,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          {config.headerAvatarUrl ? (
                            <img
                              src={config.headerAvatarUrl}
                              alt="Avatar"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <span style={{ fontSize: '18px' }}>{config.headerAvatarEmoji || '👤'}</span>
                          )}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold">{config.headerTitle || 'Chat Support'}</span>
                        {config.headerSubtitle && (
                          <div style={{ fontSize: '11px', opacity: 0.8 }}>{config.headerSubtitle}</div>
                        )}
                        {config.showOnlineStatus !== false && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', opacity: 0.9, marginTop: '2px' }}>
                            <span style={{ width: '6px', height: '6px', background: config.onlineStatusColor || '#22c55e', borderRadius: '50%' }}></span>
                            Online
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowChat(false);
                      }}
                      className="hover:opacity-80 transition-opacity"
                    >
                      <RiCloseLine size={20} />
                    </button>
                  </div>

                  {/* Messages */}
                  <div
                    style={{
                      flex: 1,
                      padding: '16px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      backgroundColor: config.glassEffect ? 'transparent' : (config.chatBackgroundColor || '#f9fafb'),
                    }}
                  >
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        style={{
                          display: 'flex',
                          justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '80%',
                            padding: '10px 14px',
                            borderRadius: `${config.messageBorderRadius}px`,
                            backgroundColor: msg.isUser ? config.userMessageColor : config.botMessageColor,
                            color: msg.isUser ? (config.userMessageTextColor || '#ffffff') : (config.botMessageTextColor || '#1f2937'),
                            fontSize: '14px',
                            lineHeight: 1.5,
                          }}
                        >
                          {msg.text}

                          {/* Sources Preview */}
                          {!msg.isUser && msg.sources && config.showSources !== false && (
                            <div style={{
                              marginTop: '8px',
                              paddingTop: '8px',
                              borderTop: '1px solid rgba(0,0,0,0.05)',
                              display: 'flex',
                              gap: '6px',
                              flexWrap: 'wrap',
                              alignItems: 'center'
                            }}>
                              {msg.sources.slice(0, config.maxVisibleSources || 3).map((source: any, i: number) => (
                                <a
                                  key={i}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={source.title}
                                  style={{
                                    display: 'block',
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    backgroundColor: 'white',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                  }}
                                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                  <img
                                    src={`https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=64`}
                                    alt={source.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Input Area */}
                  <div
                    style={{
                      padding: '16px',
                      borderTop: `1px solid ${config.glassEffect ? 'rgba(255,255,255,0.2)' : (config.inputAreaBorderColor || '#e5e7eb')}`,
                      backgroundColor: config.glassEffect
                        ? (config.theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)')
                        : (config.inputAreaBackgroundColor || '#ffffff'),
                    }}
                  >
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder={config.placeholder}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                      <button
                        onClick={sendMessage}
                        style={{
                          backgroundColor: config.userMessageColor,
                          color: '#ffffff',
                        }}
                        className="px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        <RiSendPlaneFill size={18} />
                      </button>
                    </div>
                    {config.showBranding && (
                      <div className="p-2 text-center border-t border-border bg-muted/30">
                        <a
                          href={config.brandingUrl || "https://bonsaimedia.nl"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {config.brandingText || "Powered by BonsaiMedia.nl"}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Branding */}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Info */}
        <div className="px-4 py-3 border-t border-border bg-muted/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Layout:</span>
              <span className="ml-2 font-medium text-foreground capitalize">
                {config.layoutMode || 'fixed'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Chat Animatie:</span>
              <span className="ml-2 font-medium text-foreground capitalize">
                {config.chatAnimation || 'slide-up'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Breedte:</span>
              <span className="ml-2 font-medium text-foreground">
                {config.layoutMode === 'percentage' ? `${config.widthPercentage || 80}%` : `${config.chatWidth}px`}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Hoogte:</span>
              <span className="ml-2 font-medium text-foreground">
                {config.layoutMode === 'full-height' ? '100%' :
                  config.layoutMode === 'percentage' ? `${config.heightPercentage || 80}%` :
                    `${config.chatHeight}px`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
