'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdvancedWidgetEditor, WidgetConfig } from '@/components/widgets/AdvancedWidgetEditor';
import { WidgetLivePreview } from '@/components/widgets/WidgetLivePreview';
import { AnimatedWidgetPreview } from '@/components/widgets/AnimatedWidgetPreview';
import { InteractiveChatPreview } from '@/components/widgets/InteractiveChatPreview';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { widgetAPI, agentAPI } from '@/lib/api';
import { RiArrowLeftLine, RiSaveLine, RiEyeLine, RiMagicLine, RiLayoutLine, RiChat3Line } from '@remixicon/react';

const DEFAULT_CONFIG: WidgetConfig = {
  name: '',
  widgetType: 'bubble',
  position: 'bottom-right',
  bubbleIcon: 'RiChat1Line',
  bubbleShape: 'circle',
  bubbleSize: 'medium',
  bubbleBackgroundColor: '#6366f1',
  bubbleTextColor: '#ffffff',
  headerBackgroundColor: '#6366f1',
  headerTextColor: '#ffffff',
  userMessageColor: '#6366f1',
  botMessageColor: '#f3f4f6',
  botMessageTextColor: '#1f2937',
  chatWidth: 400,
  chatHeight: 600,
  chatBorderRadius: 16,
  messageBorderRadius: 12,
  greeting: 'Hoi! Hoe kan ik je helpen?',
  placeholder: 'Type je bericht...',
  showBranding: true,
  zIndex: 999999,
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
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [previewMode, setPreviewMode] = useState<'static' | 'animated' | 'interactive'>('interactive');

  // Load widget if editing
  useEffect(() => {
    if (selectedWorkspace) {
      loadAgents();
      if (widgetId) {
        loadWidget();
      } else {
        setIsLoading(false);
      }
    }
  }, [selectedWorkspace, widgetId]);

  const loadAgents = async () => {
    if (!selectedWorkspace) return;

    try {
      setIsLoadingAgents(true);
      const data = await agentAPI.getWorkspaceAgents(selectedWorkspace.id);
      const activeAgents = data.filter((a: any) => a.isActive);
      setAgents(activeAgents);

      // Auto-select first agent if creating new widget
      if (!widgetId && activeAgents.length > 0 && !agentId) {
        setAgentId(activeAgents[0].id);
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const loadWidget = async () => {
    if (!selectedWorkspace || !widgetId) return;

    try {
      setIsLoading(true);
      const data = await widgetAPI.getById(widgetId, selectedWorkspace.id);

      // Map API data to config
      setConfig({
        name: data.name,
        widgetType: data.widgetType || 'bubble',
        position: data.position,
        offsetX: data.offsetX,
        offsetY: data.offsetY,

        // Advanced Layout
        layoutMode: data.layoutMode,
        widthPercentage: data.widthPercentage,
        heightPercentage: data.heightPercentage,
        maxWidth: data.maxWidth,
        maxHeight: data.maxHeight,
        minWidth: data.minWidth,
        minHeight: data.minHeight,

        // Bubble/Icon
        bubbleIcon: data.bubbleIcon,
        bubbleText: data.bubbleText,
        bubbleShape: data.bubbleShape,
        bubbleSize: data.bubbleSize,
        bubbleWidth: data.bubbleWidth,
        bubbleHeight: data.bubbleHeight,
        bubbleImageUrl: data.bubbleImageUrl,
        bubbleImageFit: data.bubbleImageFit,
        bubbleShadow: data.bubbleShadow,

        // Animation System
        enableAnimation: data.enableAnimation,
        animationType: data.animationType,
        animationDirection: data.animationDirection,
        animationDuration: data.animationDuration,
        animationDelay: data.animationDelay,
        hoverAnimation: data.hoverAnimation,

        // Icon/Image Relationship
        imageIconRelation: data.imageIconRelation,
        imagePosition: data.imagePosition,
        imageFullHeight: data.imageFullHeight,

        // Colors
        bubbleBackgroundColor: data.bubbleBackgroundColor,
        bubbleTextColor: data.bubbleTextColor,
        bubbleIconColor: data.bubbleIconColor,
        headerBackgroundColor: data.headerBackgroundColor,
        headerTextColor: data.headerTextColor,
        userMessageColor: data.userMessageColor,
        userMessageTextColor: data.userMessageTextColor,
        botMessageColor: data.botMessageColor,
        botMessageTextColor: data.botMessageTextColor,
        borderColor: data.borderColor,

        // Bubble Hover
        bubbleHoverBackgroundColor: data.bubbleHoverBackgroundColor,
        bubbleHoverTextColor: data.bubbleHoverTextColor,
        bubbleHoverIconColor: data.bubbleHoverIconColor,
        bubbleHoverScale: data.bubbleHoverScale,

        // Header Close Button
        headerCloseIcon: data.headerCloseIcon,
        headerCloseIconColor: data.headerCloseIconColor,
        headerCloseIconHoverColor: data.headerCloseIconHoverColor,
        headerCloseIconBackgroundColor: data.headerCloseIconBackgroundColor,
        headerCloseIconHoverBackgroundColor: data.headerCloseIconHoverBackgroundColor,
        onlineStatusColor: data.onlineStatusColor,
        avatarBackgroundColor: data.avatarBackgroundColor,

        // Header Avatar
        showAgentAvatar: data.showAgentAvatar,
        showOnlineStatus: data.showOnlineStatus,
        headerAvatarUrl: data.headerAvatarUrl,
        headerAvatarEmoji: data.headerAvatarEmoji,
        headerTitle: data.headerTitle,
        headerSubtitle: data.headerSubtitle,

        // Chat Area
        chatBackgroundColor: data.chatBackgroundColor,

        // Input Styling
        inputBorderColor: data.inputBorderColor,
        inputFocusBorderColor: data.inputFocusBorderColor,
        inputBackgroundColor: data.inputBackgroundColor,
        inputTextColor: data.inputTextColor,
        inputPlaceholderColor: data.inputPlaceholderColor,
        inputAreaBackgroundColor: data.inputAreaBackgroundColor,
        inputAreaBorderColor: data.inputAreaBorderColor,
        typingIndicatorColor: data.typingIndicatorColor,

        // Send Button
        sendButtonIcon: data.sendButtonIcon,
        sendButtonBackgroundColor: data.sendButtonBackgroundColor,
        sendButtonIconColor: data.sendButtonIconColor,
        sendButtonHoverBackgroundColor: data.sendButtonHoverBackgroundColor,
        sendButtonHoverIconColor: data.sendButtonHoverIconColor,

        // Advanced Styling
        backgroundGradient: data.backgroundGradient,
        backdropBlur: data.backdropBlur,
        borderWidth: data.borderWidth,
        shadowIntensity: data.shadowIntensity,
        glassEffect: data.glassEffect,

        // Chat Window
        chatWidth: data.chatWidth,
        chatHeight: data.chatHeight,
        chatBorderRadius: data.chatBorderRadius,
        messageBorderRadius: data.messageBorderRadius,
        chatAnimation: data.chatAnimation,
        chatOffsetX: data.chatOffsetX,
        chatOffsetY: data.chatOffsetY,

        // Behavior
        greeting: data.greeting,
        placeholder: data.placeholder,
        autoOpen: data.autoOpen,
        autoOpenDelay: data.autoOpenDelay,

        // AI-Only Mode & Availability
        aiOnlyMode: data.aiOnlyMode,
        aiOnlyMessage: data.aiOnlyMessage,
        workingHours: data.workingHours,
        holidays: data.holidays,

        // Branding
        showBranding: data.showBranding,
        brandingText: data.brandingText,
        brandingUrl: data.brandingUrl,

        // Advanced
        customCss: data.customCss,
        zIndex: data.zIndex,
      });

      setAgentId(data.agentId);
    } catch (err: any) {
      console.error('Failed to load widget:', err);
      alert('Failed to load widget: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedWorkspace || !config.name.trim() || !agentId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsSaving(true);

      const widgetData = {
        workspaceId: selectedWorkspace.id,
        agentId,
        name: config.name.trim(),
        widgetType: config.widgetType,
        position: config.position,
        offsetX: config.offsetX,
        offsetY: config.offsetY,

        // Advanced Layout
        layoutMode: config.layoutMode,
        widthPercentage: config.widthPercentage,
        heightPercentage: config.heightPercentage,
        maxWidth: config.maxWidth,
        maxHeight: config.maxHeight,
        minWidth: config.minWidth,
        minHeight: config.minHeight,

        // Bubble/Icon
        bubbleIcon: config.bubbleIcon,
        bubbleText: config.bubbleText,
        bubbleShape: config.bubbleShape,
        bubbleSize: config.bubbleSize,
        bubbleWidth: config.bubbleWidth,
        bubbleHeight: config.bubbleHeight,
        bubbleImageUrl: config.bubbleImageUrl,
        bubbleImageFit: config.bubbleImageFit,
        bubbleShadow: config.bubbleShadow,

        // Animation System
        enableAnimation: config.enableAnimation,
        animationType: config.animationType,
        animationDirection: config.animationDirection,
        animationDuration: config.animationDuration,
        animationDelay: config.animationDelay,
        hoverAnimation: config.hoverAnimation,

        // Icon/Image Relationship
        imageIconRelation: config.imageIconRelation,
        imagePosition: config.imagePosition,
        imageFullHeight: config.imageFullHeight,

        // Colors
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

        // Bubble Hover
        bubbleHoverBackgroundColor: config.bubbleHoverBackgroundColor,
        bubbleHoverTextColor: config.bubbleHoverTextColor,
        bubbleHoverIconColor: config.bubbleHoverIconColor,
        bubbleHoverScale: config.bubbleHoverScale,

        // Header Close Button
        headerCloseIcon: config.headerCloseIcon,
        headerCloseIconColor: config.headerCloseIconColor,
        headerCloseIconHoverColor: config.headerCloseIconHoverColor,
        headerCloseIconBackgroundColor: config.headerCloseIconBackgroundColor,
        headerCloseIconHoverBackgroundColor: config.headerCloseIconHoverBackgroundColor,
        onlineStatusColor: config.onlineStatusColor,
        avatarBackgroundColor: config.avatarBackgroundColor,

        // Header Avatar
        showAgentAvatar: config.showAgentAvatar,
        showOnlineStatus: config.showOnlineStatus,
        headerAvatarUrl: config.headerAvatarUrl,
        headerAvatarEmoji: config.headerAvatarEmoji,
        headerTitle: config.headerTitle,
        headerSubtitle: config.headerSubtitle,

        // Chat Area
        chatBackgroundColor: config.chatBackgroundColor,

        // Input Styling
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
        chatWidth: config.chatWidth,
        chatHeight: config.chatHeight,
        chatBorderRadius: config.chatBorderRadius,
        messageBorderRadius: config.messageBorderRadius,
        chatAnimation: config.chatAnimation,
        chatOffsetX: config.chatOffsetX,
        chatOffsetY: config.chatOffsetY,

        // Behavior
        greeting: config.greeting?.trim() || undefined,
        placeholder: config.placeholder.trim(),
        autoOpen: config.autoOpen,
        autoOpenDelay: config.autoOpenDelay,

        // AI-Only Mode & Availability
        aiOnlyMode: config.aiOnlyMode,
        aiOnlyMessage: config.aiOnlyMessage,
        workingHours: config.workingHours,
        holidays: config.holidays,

        // Branding
        showBranding: config.showBranding,
        brandingText: config.brandingText,
        brandingUrl: config.brandingUrl,

        // Advanced
        customCss: config.customCss,
        zIndex: config.zIndex,
      };

      if (widgetId) {
        await widgetAPI.update(widgetId, widgetData);
        alert('✅ Widget updated successfully!');
      } else {
        const newWidget = await widgetAPI.create(widgetData);
        alert('✅ Widget created successfully!');
        router.push(`/dashboard/widgets/editor?id=${newWidget.id}`);
      }
    } catch (err: any) {
      console.error('Failed to save widget:', err);
      alert('❌ Failed to save widget: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading widget...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-background" style={{ marginLeft: 'var(--sidebar-width, 256px)', top: '4rem' }}>
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/widgets')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            title="Back to widgets"
          >
            <RiArrowLeftLine size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {widgetId ? 'Edit Widget' : 'Create New Widget'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {widgetId ? `Editing: ${config.name}` : 'Configure your chat widget'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Preview */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm font-medium"
          >
            <RiEyeLine size={18} />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving || !config.name.trim() || !agentId || agents.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
          >
            <RiSaveLine size={18} />
            {isSaving ? 'Saving...' : widgetId ? 'Update Widget' : 'Create Widget'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Editor Section */}
        <div className={`overflow-y-auto ${showPreview ? 'flex-1' : 'w-full'} px-6 py-6`}>
          {/* Widget Name & Agent */}
          <div className="max-w-4xl mx-auto space-y-6 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="widget-name" className="block text-sm font-medium text-foreground mb-2">
                  Widget Naam <span className="text-destructive">*</span>
                </label>
                <input
                  id="widget-name"
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({ ...config, name: e.target.value })}
                  placeholder="Bijv. Homepage Chat, Support Widget..."
                  required
                  maxLength={100}
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label htmlFor="agent" className="block text-sm font-medium text-foreground mb-2">
                  Selecteer Agent <span className="text-destructive">*</span>
                </label>
                <select
                  id="agent"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  disabled={isLoadingAgents}
                  required
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground disabled:opacity-50"
                >
                  <option value="">Selecteer een agent...</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.aiModel})
                    </option>
                  ))}
                </select>
                {agents.length === 0 && !isLoadingAgents && (
                  <div className="text-xs text-destructive mt-1">
                    Geen actieve agents beschikbaar. Maak eerst een agent aan.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Editor */}
          <div className="max-w-4xl mx-auto">
            <AdvancedWidgetEditor config={config} onChange={setConfig} />
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="w-[420px] border-l border-border bg-muted/30 overflow-y-auto flex-shrink-0">
            {/* Preview Mode Switcher */}
            <div className="sticky top-0 bg-muted/30 backdrop-blur-sm z-10 p-4 border-b border-border">
              <div className="grid grid-cols-3 gap-2 p-1 bg-background rounded-lg border border-border">
                <button
                  onClick={() => setPreviewMode('interactive')}
                  className={`flex items-center justify-center gap-2 py-2 px-2 rounded-md text-xs font-medium transition-all ${previewMode === 'interactive'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                  title="Volledig interactieve chat preview"
                >
                  <RiChat3Line size={16} />
                  Chat
                </button>
                <button
                  onClick={() => setPreviewMode('animated')}
                  className={`flex items-center justify-center gap-2 py-2 px-2 rounded-md text-xs font-medium transition-all ${previewMode === 'animated'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                  title="Bekijk widget animaties"
                >
                  <RiMagicLine size={16} />
                  Animaties
                </button>
                <button
                  onClick={() => setPreviewMode('static')}
                  className={`flex items-center justify-center gap-2 py-2 px-2 rounded-md text-xs font-medium transition-all ${previewMode === 'static'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                  title="Statische layout preview"
                >
                  <RiLayoutLine size={16} />
                  Layout
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-6">
              {previewMode === 'interactive' ? (
                <InteractiveChatPreview config={config} />
              ) : previewMode === 'animated' ? (
                <AnimatedWidgetPreview config={config} />
              ) : (
                <WidgetLivePreview config={config} />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Saving Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-foreground">{widgetId ? 'Updating' : 'Creating'} widget...</p>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading widget editor...</p>
      </div>
    </div>
  );
}

export default function WidgetEditorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WidgetEditor />
    </Suspense>
  );
}
