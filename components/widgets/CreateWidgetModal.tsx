'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { RiLayoutGridLine } from '@remixicon/react';
import { agentAPI } from '@/lib/api';
import { AdvancedWidgetEditor, WidgetConfig } from './AdvancedWidgetEditor';
import { WidgetLivePreview } from './WidgetLivePreview';

interface CreateWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  workspaceId: string;
}

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

export function CreateWidgetModal({ isOpen, onClose, onSubmit, workspaceId }: CreateWidgetModalProps) {
  const [agentId, setAgentId] = useState('');
  const [agents, setAgents] = useState<any[]>([]);
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  // Load agents
  useEffect(() => {
    if (isOpen && workspaceId) {
      loadAgents();
    }
  }, [isOpen, workspaceId]);

  const loadAgents = async () => {
    try {
      setIsLoadingAgents(true);
      const data = await agentAPI.getWorkspaceAgents(workspaceId);
      // Only show active agents
      const activeAgents = data.filter((a: any) => a.isActive);
      setAgents(activeAgents);
      // Auto-select first agent if available
      if (activeAgents.length > 0 && !agentId) {
        setAgentId(activeAgents[0].id);
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.name.trim() || !agentId) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        workspaceId,
        agentId,
        name: config.name.trim(),
        widgetType: config.widgetType,
        position: config.position,
        
        // Bubble customization
        bubbleIcon: config.bubbleIcon,
        bubbleText: config.bubbleText,
        bubbleShape: config.bubbleShape,
        bubbleSize: config.bubbleSize,
        bubbleWidth: config.bubbleWidth,
        bubbleHeight: config.bubbleHeight,
        bubbleBackgroundColor: config.bubbleBackgroundColor,
        bubbleTextColor: config.bubbleTextColor,
        
        // Layout
        offsetX: config.offsetX,
        offsetY: config.offsetY,
        
        // Chat window
        chatWidth: config.chatWidth,
        chatHeight: config.chatHeight,
        chatBorderRadius: config.chatBorderRadius,
        
        // Header
        headerBackgroundColor: config.headerBackgroundColor,
        headerTextColor: config.headerTextColor,
        
        // Messages
        userMessageColor: config.userMessageColor,
        botMessageColor: config.botMessageColor,
        botMessageTextColor: config.botMessageTextColor,
        messageBorderRadius: config.messageBorderRadius,
        
        // Behavior
        greeting: config.greeting?.trim() || undefined,
        placeholder: config.placeholder.trim(),
        autoOpen: config.autoOpen,
        autoOpenDelay: config.autoOpenDelay,
        
        // Advanced
        showBranding: config.showBranding,
        customCss: config.customCss,
        zIndex: config.zIndex,
      });
      // Reset form
      setConfig(DEFAULT_CONFIG);
      setAgentId('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setConfig(DEFAULT_CONFIG);
      setAgentId('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nieuwe Widget Aanmaken" size="xl">
      <form onSubmit={handleSubmit} className="h-full flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <RiLayoutGridLine size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Configureer je chat widget volledig naar wens - van kleuren tot gedrag
              </p>
            </div>
          </div>
        </div>

        {/* Content - 2 columns */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-[1fr,400px] h-full">
            {/* Left: Editor */}
            <div className="overflow-y-auto px-6 py-6">
              {/* Widget Name & Agent */}
              <div className="space-y-4 mb-6">
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

              {/* Advanced Editor */}
              <AdvancedWidgetEditor
                config={config}
                onChange={setConfig}
              />
            </div>

            {/* Right: Live Preview */}
            <div className="border-l border-border bg-muted/30 p-6 overflow-y-auto">
              <WidgetLivePreview config={config} />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              💡 Tip: Gebruik de live preview om je widget in real-time te zien
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={!config.name.trim() || !agentId || isSubmitting || agents.length === 0}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
              >
                {isSubmitting ? 'Widget aanmaken...' : 'Widget Aanmaken'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}
