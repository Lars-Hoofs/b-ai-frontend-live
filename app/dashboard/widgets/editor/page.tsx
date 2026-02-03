'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdvancedWidgetEditor, { WidgetConfig } from '@/components/widgets/AdvancedWidgetEditor';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { widgetAPI, agentAPI } from '@/lib/api';
import { RiArrowLeftLine, RiSaveLine, RiSettings4Line } from '@remixicon/react';

const DEFAULT_CONFIG: WidgetConfig = {
  name: 'My New Widget',
  position: 'bottom-right',
  // ... (All defaults handled or let undefined be undefined, but good to have some)
  primaryColor: '#6366f1',
  bubbleIcon: 'RiChat1Line',
  headerTitle: 'Chat Support',
  launcherMode: 'advanced', // Default to new Mode
  launcherStructure: [
    {
      id: 'root', type: 'container', style: { padding: '12px', backgroundColor: '#6366f1', borderRadius: '50px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }, children: [
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

  // Load widget/agents logic (Keep same)
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
    // ... (Same logic: fetch agents)
    try {
      const data = await agentAPI.getWorkspaceAgents(selectedWorkspace!.id); // ! safe usage in effect
      const activeAgents = data.filter((a: any) => a.isActive);
      setAgents(activeAgents);
      if (!widgetId && activeAgents.length > 0 && !agentId) setAgentId(activeAgents[0].id);
    } catch (e) {
      console.error(e);
    }
  };

  const loadWidget = async () => {
    // ... (Same logic: fetch widget, setConfig)
    try {
      setIsLoading(true);
      const data = await widgetAPI.getById(widgetId!, selectedWorkspace!.id);
      setConfig(data); // Assuming data returns matching shape or close enough
      setAgentId(data.agentId);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // ... (Same save logic)
    if (!config.name || !agentId) return alert('Name and Agent required');
    try {
      setIsSaving(true);
      // Sanitize payload for backend compatibility
      const safePayload = {
        ...config,
        agentId,
        workspaceId: selectedWorkspace!.id,
        // Map new/advanced types to 'bubble' for backend storage if not supported
        widgetType: (['searchbar', 'custom-box'].includes(config.widgetType || '') ? 'bubble' : config.widgetType) as any,
        // Map new/advanced positions to 'bottom-right' for backend storage
        position: (['top-center', 'bottom-center', 'middle-center'].includes(config.position || '') ? 'bottom-right' : config.position) as any
      };

      if (widgetId) {
        await widgetAPI.update(widgetId, safePayload);
        alert('Saved!');
      } else {
        const res = await widgetAPI.create(safePayload);
        router.push(`/dashboard/widgets/editor?id=${res.id}`);
      }
    } catch (e: any) {
      alert('Error: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="fixed inset-0 flex flex-col bg-background" style={{ marginLeft: 'var(--sidebar-width, 256px)', top: '4rem' }}>

      {/* Top Header: Actions & Meta Data */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0 h-16">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard/widgets')} className="p-2 hover:bg-muted rounded-lg">
            <RiArrowLeftLine size={20} />
          </button>

          <div className="flex flex-col gap-1">
            <input
              value={config.name}
              onChange={e => setConfig({ ...config, name: e.target.value })}
              className="bg-transparent font-bold text-lg focus:outline-none focus:underline"
              placeholder="Widget Name"
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Linked Agent:</span>
              <select
                value={agentId}
                onChange={e => setAgentId(e.target.value)}
                className="bg-muted/50 border border-input rounded px-1 py-0.5 text-xs"
              >
                <option value="">Select Agent...</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
        >
          <RiSaveLine size={18} />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Main Content: Full Screen Editor */}
      <div className="flex-1 overflow-hidden p-4 bg-muted/10">
        <AdvancedWidgetEditor config={config} onChange={setConfig} />
      </div>
    </div>
  );
}

export default function WidgetEditorPage() {
  return <Suspense><WidgetEditor /></Suspense>;
}
