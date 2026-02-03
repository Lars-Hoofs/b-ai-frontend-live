import React, { useState, useEffect } from 'react';
import { WidgetConfig } from './AdvancedWidgetEditor';
import * as RemixIcons from 'react-icons/ri';
import { motion, AnimatePresence } from 'framer-motion';

// Re-using interface from Editor (in a real app, this should be in a shared types file)
interface LauncherBlock {
  id: string;
  type: 'container' | 'row' | 'column' | 'icon' | 'text' | 'image';
  style?: React.CSSProperties;
  content?: string;
  children?: LauncherBlock[];
  onClick?: 'open-chat' | 'toggle-chat' | 'open-link' | 'email' | 'phone';
  linkUrl?: string;
  hoverStyle?: React.CSSProperties;
  mobileHidden?: boolean;
}

interface ChatBlock {
  id: string;
  type: 'header' | 'messages' | 'input' | 'container' | 'text' | 'button' | 'divider' | 'branding';
  content?: string;
  style?: Record<string, any>;
  className?: string;
  children?: ChatBlock[];
  position?: 'top' | 'bottom' | 'left' | 'right';
  placeholder?: string;
  icon?: string;
  onClick?: 'send-message' | 'close-chat' | 'custom' | 'open-url';
  url?: string;
  hoverStyle?: Record<string, any>;
  mobileHidden?: boolean;
}

export function InteractiveChatPreview({ config, isOpen, setIsOpen, isPreview = false }: {
  config: WidgetConfig,
  isOpen: boolean,
  setIsOpen: (v: boolean) => void,
  isPreview?: boolean
}) {
  // Determine position styles
  const positionStyles: React.CSSProperties = {
    position: isPreview ? 'absolute' : 'fixed',
    zIndex: isPreview ? 10 : (config.zIndex || 999999),
  };

  const offset = { x: config.offsetX || 20, y: config.offsetY || 20 };

  switch (config.position) {
    case 'bottom-right':
      positionStyles.bottom = offset.y;
      positionStyles.right = offset.x;
      break;
    case 'bottom-left':
      positionStyles.bottom = offset.y;
      positionStyles.left = offset.x;
      break;
    case 'top-right':
      positionStyles.top = offset.y;
      positionStyles.right = offset.x;
      break;
    case 'top-left':
      positionStyles.top = offset.y;
      positionStyles.left = offset.x;
      break;
    case 'middle-right':
      positionStyles.top = '50%';
      positionStyles.right = offset.x;
      positionStyles.transform = `translateY(-50%) translateY(${offset.y}px)`; // Correct calc
      break;
    case 'middle-left':
      positionStyles.top = '50%';
      positionStyles.left = offset.x;
      positionStyles.transform = `translateY(-50%) translateY(${offset.y}px)`;
      break;
    case 'top-center':
      positionStyles.top = offset.y;
      positionStyles.left = '50%';
      positionStyles.transform = `translateX(-50%) translateX(${offset.x}px)`;
      break;
    case 'bottom-center':
      positionStyles.bottom = offset.y;
      positionStyles.left = '50%';
      positionStyles.transform = `translateX(-50%) translateX(${offset.x}px)`;
      break;
    case 'middle-center':
      positionStyles.top = '50%';
      positionStyles.left = '50%';
      positionStyles.transform = `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`;
      break;
    default:
      positionStyles.bottom = 20;
      positionStyles.right = 20;
  }

  // Render Blocks Recursively with Framer Motion
  const renderBlock = (block: LauncherBlock) => {
    // Mobile hidden check (simple CSS class or conditional render)
    // We use a CSS class approach for SSR compatibility, assuming usage of Tailwind 'hidden md:flex' or similar if we had specific breakpoints. 
    // Since we are in a preview, we might just apply display: none if we were emulating, 
    // but for now let's just use a style override if we want to simulate it, or just ignore since it's desktop preview.
    // We will add the class 'hidden md:flex' if mobileHidden is true, assuming Preview container simulates viewport or user resizes.

    const baseStyle: any = {
      ...block.style,
      display: block.style?.display || (block.type === 'row' ? 'flex' : block.type === 'column' ? 'flex' : 'block'),
      flexDirection: block.style?.flexDirection || (block.type === 'row' ? 'row' : block.type === 'column' ? 'column' : undefined),
    };

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent bubbling if nested

      const action = block.onClick || 'toggle-chat';
      if (action === 'toggle-chat') {
        setIsOpen(!isOpen);
      } else if (action === 'open-chat') {
        setIsOpen(true);
      } else if (action === 'open-link' && block.linkUrl) {
        window.open(block.linkUrl, '_blank');
      } else if (action === 'email' && block.linkUrl) {
        window.location.href = `mailto:${block.linkUrl}`;
      } else if (action === 'phone' && block.linkUrl) {
        window.location.href = `tel:${block.linkUrl}`;
      }
    };

    const content = () => {
      if (block.type === 'icon') {
        // Dynamic Icon
        const IconComponent = (RemixIcons as any)[block.content || 'RiChat1Line'] || RemixIcons.RiChat1Line;
        return <IconComponent style={{ width: '100%', height: '100%' }} />;
      }
      if (block.type === 'image') {
        return <motion.img src={block.content} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />;
      }
      if (block.type === 'text') {
        return <span>{block.content}</span>;
      }
      // Helper for children
      return (block.children || []).map(child => <React.Fragment key={child.id}>{renderBlock(child)}</React.Fragment>);
    };

    // Framer Motion Props
    const motionProps = {
      style: { ...baseStyle, cursor: block.onClick ? 'pointer' : 'default' },
      whileHover: (block.hoverStyle ? block.hoverStyle : { scale: 1.02, opacity: 0.95 }) as any, // Default subtle hover if no specific style
      whileTap: { scale: 0.95 },
      onClick: handleClick,
    };

    return (
      <motion.div
        key={block.id}
        className={`relative ${block.mobileHidden ? 'hidden md:flex' : ''}`} // Simple responsive class
        {...motionProps}
        transition={{ duration: 0.2 }}
      >
        {content()}
      </motion.div>
    );
  };

  // Render Chat Blocks Recursively
  const renderChatBlock = (block: ChatBlock): React.ReactNode => {
    const baseStyle: any = {
      ...block.style,
    };

    const key = block.id;

    switch (block.type) {
      case 'header':
        return (
          <div key={key} style={{ ...baseStyle, padding: baseStyle.padding || '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: baseStyle.background || config.headerBackgroundColor || '#fff', color: baseStyle.color || config.headerTextColor || '#000' }}>
            {block.children ? block.children.map(renderChatBlock) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {config.showAgentAvatar !== false && (
                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      {config.headerAvatarUrl ? (
                        <img src={config.headerAvatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' }} />
                      )}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '18px' }}>{config.headerTitle || 'Chat'}</div>
                    {config.headerSubtitle && <div style={{ fontSize: '13px', opacity: 0.6, marginTop: '2px' }}>{config.headerSubtitle}</div>}
                    {config.showOnlineStatus && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                        <span style={{ width: '8px', height: '8px', background: config.onlineStatusColor || '#10b981', borderRadius: '50%', display: 'inline-block', border: '1.5px solid #fff' }} />
                        Online
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', padding: 0, width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </>
            )}
          </div>
        );

      case 'messages':
        return (
          <div key={key} style={{ ...baseStyle, flex: baseStyle.flex || 1, overflowY: 'auto', padding: baseStyle.padding || '24px', display: 'flex', flexDirection: 'column', gap: '24px', background: baseStyle.background || config.chatBackgroundColor || '#fff' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', flexShrink: 0 }} />
              <div style={{
                background: config.botMessageColor || '#f3f4f6',
                color: config.botMessageTextColor || '#111827',
                padding: '12px 16px',
                borderRadius: `${config.messageBorderRadius || 16}px`,
                borderTopLeftRadius: '4px',
                fontSize: '14px',
                maxWidth: '80%'
              }}>
                {config.greeting || "Hello! How can I help you today?"}
              </div>
            </div>
            {block.children && block.children.map(renderChatBlock)}
          </div>
        );

      case 'input':
        return (
          <div key={key} style={{ ...baseStyle, padding: baseStyle.padding || '20px 24px', borderTop: baseStyle.borderTop || '1px solid transparent', background: baseStyle.background || config.inputAreaBackgroundColor || '#fff' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: config.inputBackgroundColor || '#f3f4f6', borderRadius: '32px', padding: '6px 6px 6px 20px' }}>
              <input
                type="text"
                placeholder={block.placeholder || config.placeholder || "Type a message..."}
                disabled
                style={{ flex: 1, border: 'none', fontSize: '15px', outline: 'none', background: 'transparent', padding: '10px 0' }}
              />
              <button style={{
                background: config.sendButtonBackgroundColor || config.primaryColor || '#000',
                color: config.sendButtonIconColor || '#fff',
                border: 'none',
                padding: 0,
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <RemixIcons.RiSendPlaneFill size={20} />
              </button>
              {block.children && block.children.map(renderChatBlock)}
            </div>
          </div>
        );

      case 'container':
        return (
          <div key={key} style={baseStyle}>
            {block.children && block.children.map(renderChatBlock)}
          </div>
        );

      case 'text':
        return (
          <div key={key} style={baseStyle}>
            {block.content || 'Text Block'}
          </div>
        );

      case 'button':
        const Icon = block.icon && (RemixIcons as any)[block.icon] ? (RemixIcons as any)[block.icon] : RemixIcons.RiSendPlaneFill;
        return (
          <button
            key={key}
            style={baseStyle}
            onClick={() => {
              if (block.onClick === 'close-chat') setIsOpen(false);
              if (block.onClick === 'open-url' && block.url) window.open(block.url, '_blank');
            }}
            className="hover:opacity-80 transition-opacity"
          >
            {block.icon && <Icon size={16} />}
            {block.content}
          </button>
        );

      case 'divider':
        return (
          <div key={key} style={{ height: '1px', backgroundColor: '#eee', ...baseStyle }}></div>
        );

      case 'branding':
        return (
          <div key={key} style={{ textAlign: 'center', padding: '8px', fontSize: '11px', color: '#999', ...baseStyle }}>
            {block.content || 'Powered by Your Brand'}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={positionStyles} className="pointer-events-auto">
      <AnimatePresence>
        {/* Chat Window */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              width: config.chatWidth || 380,
              height: config.chatHeight || 650,
              backgroundColor: '#fff',
              borderRadius: config.chatBorderRadius || 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              marginBottom: 16,
            }}
          >
            {/* Render Custom Chat Structure OR Default Layout */}
            {config.chatMode === 'advanced' && config.chatStructure && config.chatStructure.length > 0 ? (
              // ADVANCED MODE: Render chatStructure
              config.chatStructure.map(block => renderChatBlock(block as ChatBlock))
            ) : (
              // SIMPLE MODE: Default Layout - EXACT MATCH with backend widget
              <>
                {/* Header - matches getChatWindowHTML */}
                <div style={{
                  background: config.headerBackgroundColor || '#fff',
                  color: config.headerTextColor || '#000',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Avatar */}
                    {config.showAgentAvatar !== false && (
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        background: config.avatarBackgroundColor || 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                      }}>
                        {config.headerAvatarUrl ? (
                          <img src={config.headerAvatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : config.headerAvatarEmoji ? (
                          <span style={{ fontSize: '24px' }}>{config.headerAvatarEmoji}</span>
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' }} />
                        )}
                      </div>
                    )}
                    <div>
                      {config.headerTitle && (
                        <div style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em' }}>{config.headerTitle}</div>
                      )}
                      {config.headerSubtitle && (
                        <div style={{ fontSize: '13px', opacity: 0.6, marginTop: '2px' }}>{config.headerSubtitle}</div>
                      )}
                      {config.showOnlineStatus && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                          <span style={{
                            width: '8px',
                            height: '8px',
                            background: config.onlineStatusColor || '#10b981',
                            borderRadius: '50%',
                            display: 'inline-block',
                            border: '1.5px solid #fff'
                          }} />
                          Online
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    style={{
                      background: config.headerCloseIconBackgroundColor || 'transparent',
                      border: 'none',
                      color: config.headerCloseIconColor || (config.headerBackgroundColor === '#ffffff' ? '#000' : config.headerTextColor),
                      fontSize: '20px',
                      cursor: 'pointer',
                      padding: 0,
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >✕</button>
                </div>

                {/* Messages Area */}
                <div id="ai-chat-messages" style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px',
                  background: config.chatBackgroundColor || '#fff'
                }}>
                  {/* Initial greeting message */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
                      flexShrink: 0
                    }} />
                    <div style={{
                      background: config.botMessageColor || '#f3f4f6',
                      color: config.botMessageTextColor || '#111827',
                      padding: '12px 16px',
                      borderRadius: `${config.messageBorderRadius || 16}px`,
                      borderTopLeftRadius: '4px',
                      fontSize: '14px',
                      maxWidth: '80%',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      {config.greeting || "Hello! How can I help you today?"}
                    </div>
                  </div>
                </div>

                {/* Input Area - matches backend exactly */}
                <div style={{
                  padding: '20px 24px',
                  borderTop: `1px solid ${config.inputAreaBorderColor || 'transparent'}`,
                  background: config.inputAreaBackgroundColor || '#fff'
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    background: config.inputBackgroundColor || '#f3f4f6',
                    borderRadius: '32px',
                    padding: '6px 6px 6px 20px',
                    border: `1px solid ${config.inputBorderColor || 'transparent'}`
                  }}>
                    <input
                      type="text"
                      placeholder={config.placeholder || "Type here..."}
                      disabled
                      style={{
                        flex: 1,
                        border: 'none',
                        fontSize: '15px',
                        outline: 'none',
                        background: 'transparent',
                        color: config.inputTextColor || '#1f2937',
                        padding: '10px 0'
                      }}
                    />
                    <button style={{
                      background: config.sendButtonBackgroundColor || config.primaryColor || '#000',
                      color: config.sendButtonIconColor || '#fff',
                      border: 'none',
                      padding: 0,
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <RemixIcons.RiSendPlaneFill size={20} />
                    </button>
                  </div>
                </div>

                {/* Branding */}
                {config.showBranding && (
                  <div style={{
                    padding: '8px',
                    textAlign: 'center',
                    fontSize: '11px',
                    color: '#d1d5db',
                    background: config.chatBackgroundColor || '#fff'
                  }}>
                    <a href={config.brandingUrl || 'https://bonsaimedia.nl'} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                      {config.brandingText || 'Powered by Bonsai'}
                    </a>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Area */}
      {config.launcherMode === 'advanced' && config.launcherStructure ? (
        <div className="flex flex-col items-end gap-2">
          <AnimatePresence>
            {config.launcherStructure.map(block => (
              renderBlock(block as LauncherBlock)
            ))}
          </AnimatePresence>
        </div>
      ) : (
        // Simple / Classic Launcher
        !isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            style={{
              width: config.bubbleSize === 'large' ? 80 : config.bubbleSize === 'small' ? 48 : 64,
              height: config.bubbleSize === 'large' ? 80 : config.bubbleSize === 'small' ? 48 : 64,
              backgroundColor: config.primaryColor || '#000',
              borderRadius: config.bubbleShape === 'square' ? 0 : config.bubbleShape === 'rounded-square' ? 16 : '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <RemixIcons.RiChat1Fill size={28} />
          </motion.div>
        )
      )}
    </div>
  );
}
