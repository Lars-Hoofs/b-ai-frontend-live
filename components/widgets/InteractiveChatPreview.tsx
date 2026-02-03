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
              // transformOrigin based on position would be cool but center bottom is fine
            }}
          >
            {/* Fake Chat Header */}
            <div style={{ padding: 16, borderBottom: '1px solid #eee', background: config.headerBackgroundColor || '#fff', color: config.headerTextColor || '#000' }}>
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold block">{config.headerTitle || 'Chat'}</span>
                  <span className="text-xs opacity-70 block">{config.headerSubtitle || 'We are online'}</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="opacity-70 hover:opacity-100">✕</button>
              </div>
            </div>
            <div className="flex-1 bg-gray-50 p-4">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-gray-800 border border-gray-100 max-w-[80%]">
                  {config.greeting || "Hello! How can I help you today?"}
                </div>
              </div>
              <div className="text-center text-xs text-gray-400 mt-8">Preview Mode</div>
            </div>
            {/* Input Placeholder */}
            <div className="p-3 border-t bg-white">
              <div className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-500">
                {config.placeholder || "Type a message..."}
              </div>
            </div>
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
