'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdvancedWidgetEditor, { WidgetConfig } from '@/components/widgets/AdvancedWidgetEditor';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { widgetAPI, agentAPI } from '@/lib/api';
import { RiArrowLeftLine, RiSaveLine, RiFullscreenLine, RiFullscreenExitLine } from '@remixicon/react';

const DEFAULT_CONFIG: WidgetConfig = {
  name: 'My New Widget',
  position: 'bottom-right',
  primaryColor: '#6366f1',
  bubbleIcon: 'RiChat1Line',
  headerTitle: 'Chat Support',
  headerSubtitle: "We're here to help",
  greeting: 'Hi there! 👋 How can I help you today?',
  placeholder: 'Type your message...',
  launcherMode: 'advanced',
  launcherStructure: [
    {
      id: 'root', type: 'container',
      style: { padding: '12px', backgroundColor: '#6366f1', borderRadius: '50px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' },
      children: [
        { id: 'icon', type: 'icon', content: 'RiChat3Line' },
        { id: 'text', type: 'text', content: 'Chat with us' }
      ]
    }
  ]
};

function WidgetEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const widgetId = searchParams.get('id');
  const { selectedWorkspace } = useWorkspace();

  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);
  const [agentId, setAgentId] = useState('');
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    if (selectedWorkspace) {
      loadAgents();
      if (widgetId) loadWidget();
      else setIsLoading(false);
    }
  }, [selectedWorkspace, widgetId]);

  const loadAgents = async () => {
    try {
      const data = await agentAPI.getWorkspaceAgents(selectedWorkspace!.id);
      const activeAgents = data.filter((a: any) => a.isActive);
      setAgents(activeAgents);
      if (!widgetId && activeAgents.length > 0 && !agentId) setAgentId(activeAgents[0].id);
    } catch (e) { console.error(e); }
  };

  const loadWidget = async () => {
    try {
      setIsLoading(true);
      const data = await widgetAPI.getById(widgetId!, selectedWorkspace!.id);
      setConfig(data);
      setAgentId(data.agentId);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    if (!config.name || !agentId) return alert('Name and Agent required');
    try {
      setIsSaving(true);

      // Send ALL config fields — the API schema supports them all
      const payload: any = {
        name: config.name,
        agentId,
        workspaceId: selectedWorkspace!.id,

        // Layout & Position
        widgetType: config.widgetType || 'bubble',
        position: config.position || 'bottom-right',
        offsetX: config.offsetX,
        offsetY: config.offsetY,
        layoutMode: config.layoutMode,
        zIndex: config.zIndex,

        // Launcher
        bubbleIcon: config.bubbleIcon,
        bubbleText: config.bubbleText,
        bubbleShape: config.bubbleShape,
        bubbleSize: config.bubbleSize === 'custom' ? 'medium' : config.bubbleSize,
        bubbleWidth: config.bubbleWidth,
        bubbleHeight: config.bubbleHeight,
        bubbleImageUrl: config.bubbleImageUrl,
        bubbleImageFit: config.bubbleImageFit,
        bubbleShadow: config.bubbleShadow,

        // Colors
        primaryColor: config.primaryColor,
        bubbleBackgroundColor: config.bubbleBackgroundColor,
        bubbleTextColor: config.bubbleTextColor,
        bubbleIconColor: config.bubbleIconColor,
        headerBackgroundColor: config.headerBackgroundColor,
        headerTextColor: config.headerTextColor,
        userMessageColor: config.userMessageColor,
        userMessageTextColor: config.userMessageTextColor,
        botMessageColor: config.botMessageColor,
        botMessageTextColor: config.botMessageTextColor,
        borderColor: config.borderColor,

        // Hover
        bubbleHoverBackgroundColor: config.bubbleHoverBackgroundColor,
        bubbleHoverTextColor: config.bubbleHoverTextColor,
        bubbleHoverIconColor: config.bubbleHoverIconColor,
        bubbleHoverScale: config.bubbleHoverScale,

        // Header
        headerTitle: config.headerTitle,
        headerSubtitle: config.headerSubtitle,
        headerCloseIcon: config.headerCloseIcon,
        headerCloseIconColor: config.headerCloseIconColor,
        headerCloseIconHoverColor: config.headerCloseIconHoverColor,
        headerCloseIconBackgroundColor: config.headerCloseIconBackgroundColor,
        headerCloseIconHoverBackgroundColor: config.headerCloseIconHoverBackgroundColor,
        showAgentAvatar: config.showAgentAvatar,
        showOnlineStatus: config.showOnlineStatus,
        headerAvatarUrl: config.headerAvatarUrl,
        headerAvatarEmoji: config.headerAvatarEmoji,
        onlineStatusColor: config.onlineStatusColor,
        avatarBackgroundColor: config.avatarBackgroundColor,

        // Chat Area
        chatBackgroundColor: config.chatBackgroundColor,

        // Input
        inputBorderColor: config.inputBorderColor,
        inputFocusBorderColor: config.inputFocusBorderColor,
        inputBackgroundColor: config.inputBackgroundColor,
        inputTextColor: config.inputTextColor,
        inputPlaceholderColor: config.inputPlaceholderColor,
        inputAreaBackgroundColor: config.inputAreaBackgroundColor,
        inputAreaBorderColor: config.inputAreaBorderColor,
        typingIndicatorColor: config.typingIndicatorColor,

        // Send Button
        sendButtonIcon: config.sendButtonIcon,
        sendButtonBackgroundColor: config.sendButtonBackgroundColor,
        sendButtonIconColor: config.sendButtonIconColor,
        sendButtonHoverBackgroundColor: config.sendButtonHoverBackgroundColor,
        sendButtonHoverIconColor: config.sendButtonHoverIconColor,

        // Advanced Styling
        backgroundGradient: config.backgroundGradient,
        backdropBlur: config.backdropBlur,
        borderWidth: config.borderWidth,
        shadowIntensity: config.shadowIntensity,
        glassEffect: config.glassEffect,

        // Chat Window
        greeting: config.greeting,
        placeholder: config.placeholder,
        chatWidth: config.chatWidth,
        chatHeight: config.chatHeight,
        chatBorderRadius: config.chatBorderRadius,
        messageBorderRadius: config.messageBorderRadius,
        chatAnimation: config.chatAnimation,
        chatOffsetX: config.chatOffsetX,
        chatOffsetY: config.chatOffsetY,

        // Animation
        enableAnimation: config.enableAnimation,
        animationType: config.animationType,
        animationDirection: config.animationDirection,
        animationDuration: config.animationDuration,
        animationDelay: config.animationDelay,
        hoverAnimation: config.hoverAnimation,

        // Image/Icon
        imageIconRelation: config.imageIconRelation,
        imagePosition: config.imagePosition,
        imageFullHeight: config.imageFullHeight,

        // Behavior
        autoOpen: config.autoOpen,
        autoOpenDelay: config.autoOpenDelay,
        soundEnabled: config.soundEnabled,

        // AI Mode
        aiOnlyMode: config.aiOnlyMode,
        aiOnlyMessage: config.aiOnlyMessage,

        // Typography
        fontFamily: config.fontFamily,
        fontSize: config.fontSize,
        fontWeight: config.fontWeight,
        lineHeight: config.lineHeight,
        letterSpacing: config.letterSpacing,

        // Branding
        showBranding: config.showBranding,
        brandingText: config.brandingText,
        brandingUrl: config.brandingUrl,

        // Sources
        showSources: config.showSources,
        maxVisibleSources: config.maxVisibleSources,

        // Advanced Builders
        launcherMode: config.launcherMode,
        launcherStructure: config.launcherStructure,
        chatMode: config.chatMode,
        chatStructure: config.chatStructure,

        // Custom CSS
        customCss: config.customCss,
      };

      // Clean undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) delete payload[key];
      });

      if (widgetId) {
        await widgetAPI.update(widgetId, payload);
        alert('Saved!');
      } else {
        const res = await widgetAPI.create(payload);
        router.push(`/dashboard/widgets/editor?id=${res.id}`);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Loading widget...</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/30 px-5 py-3 flex items-center justify-between flex-shrink-0 h-16">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard/widgets')}
            className="p-2 hover:bg-muted/50 rounded-xl transition-colors">
            <RiArrowLeftLine size={20} />
          </button>
          <div className="flex flex-col gap-0.5">
            <input value={config.name} onChange={e => setConfig({ ...config, name: e.target.value })}
              className="bg-transparent font-bold text-lg focus:outline-none focus:underline" placeholder="Widget Name" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Agent:</span>
              <select value={agentId} onChange={e => setAgentId(e.target.value)}
                className="bg-muted/30 border border-border/30 rounded-lg px-2 py-0.5 text-xs">
                <option value="">Select Agent...</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleFullscreen}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
            {isFullscreen ? <RiFullscreenExitLine size={20} /> : <RiFullscreenLine size={20} />}
          </button>
          <button onClick={handleSave} disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all font-semibold text-sm disabled:opacity-50">
            <RiSaveLine size={18} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden p-3 bg-muted/5">
        <AdvancedWidgetEditor config={config} onChange={setConfig} />
      </div>
    </div>
  );
}

export default function WidgetEditorPage() {
  return <Suspense><WidgetEditor /></Suspense>;
}
