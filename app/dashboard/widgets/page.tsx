'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  RiAddLine,
  RiLayoutGridLine,
  RiMoreLine,
  RiDeleteBinLine,
  RiEditLine,
  RiToggleLine,
  RiCodeLine,
  RiFileCopyLine,
  RiRobotLine,
  RiCheckLine,
} from '@remixicon/react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { widgetAPI } from '@/lib/api';

interface Widget {
  id: string;
  name: string;
  agentId: string;
  position: string;
  primaryColor: string;
  theme: string;
  isActive: boolean;
  installCode: string;
  agent?: {
    id: string;
    name: string;
  };
  _count?: {
    conversations: number;
  };
  createdAt: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function WidgetsPage() {
  const router = useRouter();
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { selectedWorkspace } = useWorkspace();

  // Load widgets when workspace changes
  useEffect(() => {
    if (selectedWorkspace) {
      loadWidgets();
    } else {
      setWidgets([]);
      setIsLoading(false);
    }
  }, [selectedWorkspace]);

  const loadWidgets = async () => {
    if (!selectedWorkspace) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await widgetAPI.getWorkspaceWidgets(selectedWorkspace.id);
      setWidgets(data);
    } catch (err: any) {
      console.error('Failed to load widgets:', err);
      setError(err.message || 'Failed to load widgets');
    } finally {
      setIsLoading(false);
    }
  };


  const handleToggleWidget = async (widgetId: string, currentStatus: boolean) => {
    if (!selectedWorkspace) return;
    
    try {
      await widgetAPI.toggle(widgetId, selectedWorkspace.id, !currentStatus);
      setWidgets(widgets.map(w => w.id === widgetId ? { ...w, isActive: !currentStatus } : w));
      setMenuOpenId(null);
    } catch (err: any) {
      console.error('Failed to toggle widget:', err);
      alert(err.message || 'Failed to toggle widget status');
    }
  };

  const handleDeleteWidget = async (widgetId: string) => {
    if (!confirm('Weet je zeker dat je deze widget wilt verwijderen?')) return;
    if (!selectedWorkspace) return;
    
    try {
      await widgetAPI.delete(widgetId, selectedWorkspace.id);
      setWidgets(widgets.filter(w => w.id !== widgetId));
      setMenuOpenId(null);
    } catch (err: any) {
      console.error('Failed to delete widget:', err);
      alert(err.message || 'Failed to delete widget');
    }
  };

  const copyEmbedCode = (widget: Widget) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const embedCode = `<!-- Bonsai AI Chat Widget -->
<script>
  window.aiChatConfig = {
    installCode: '${widget.installCode}',
    apiUrl: '${apiUrl}'
  };
</script>
<script src="${apiUrl}/widget.js" async></script>`;
    
    navigator.clipboard.writeText(embedCode);
    setCopiedId(widget.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Widgets laden...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Fout bij laden</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={loadWidgets}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Probeer opnieuw
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show workspace selection if no workspace
  if (!selectedWorkspace) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RiLayoutGridLine size={64} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Selecteer een workspace</h3>
            <p className="text-muted-foreground">Gebruik de team selector bovenaan om een workspace te selecteren</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Widgets</h1>
            <p className="text-muted-foreground text-lg">
              Embed AI chat widgets op je website
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard/widgets/editor')}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/25"
          >
            <RiAddLine size={20} />
            Nieuwe Widget
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">{widgets.length}</div>
            <div className="text-sm text-muted-foreground">Totaal Widgets</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {widgets.filter(w => w.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">Actieve Widgets</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {widgets.reduce((acc, w) => acc + (w._count?.conversations || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Totaal Gesprekken</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-2xl font-bold text-foreground">
              {widgets.filter(w => w.isActive).length > 0 ? '🟢' : '⚪'}
            </div>
            <div className="text-sm text-muted-foreground">Status</div>
          </div>
        </div>
      </div>

      {/* Widgets Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {widgets.map((widget) => (
          <motion.div
            key={widget.id}
            variants={itemVariants}
            className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  widget.isActive ? 'bg-primary/10' : 'bg-muted'
                }`}>
                  <RiLayoutGridLine size={24} className={widget.isActive ? 'text-primary' : 'text-muted-foreground'} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {widget.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      widget.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {widget.isActive ? 'Actief' : 'Inactief'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === widget.id ? null : widget.id);
                  }}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <RiMoreLine size={20} className="text-muted-foreground" />
                </button>

                {menuOpenId === widget.id && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        router.push(`/dashboard/widgets/editor?id=${widget.id}`);
                        setMenuOpenId(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                    >
                      <RiEditLine size={18} />
                      <span>Bewerken</span>
                    </button>
                    <button
                      onClick={() => handleToggleWidget(widget.id, widget.isActive)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors text-left"
                    >
                      <RiToggleLine size={18} />
                      <span>{widget.isActive ? 'Deactiveren' : 'Activeren'}</span>
                    </button>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => handleDeleteWidget(widget.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-destructive/10 text-destructive transition-colors text-left"
                    >
                      <RiDeleteBinLine size={18} />
                      <span>Verwijderen</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Agent Info */}
            {widget.agent && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <RiRobotLine size={16} />
                <span>{widget.agent.name}</span>
              </div>
            )}

            {/* Widget Preview */}
            <div className="mb-4 bg-muted rounded-lg p-3 h-32 flex items-end" style={{
              justifyContent: widget.position.includes('right') ? 'flex-end' : 'flex-start'
            }}>
              <div 
                className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
                style={{ backgroundColor: widget.primaryColor }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Embed Code Button */}
            <button
              onClick={() => copyEmbedCode(widget)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm font-medium mb-3"
            >
              {copiedId === widget.id ? (
                <>
                  <RiCheckLine size={16} className="text-green-600" />
                  <span className="text-green-600">Gekopieerd!</span>
                </>
              ) : (
                <>
                  <RiCodeLine size={16} />
                  <span>Kopieer Embed Code</span>
                </>
              )}
            </button>

            {/* Footer stats */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="text-sm">
                <span className="font-semibold text-foreground">{widget._count?.conversations || 0}</span>
                <span className="text-muted-foreground"> gesprekken</span>
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {widget.position.replace('-', ' ')}
              </div>
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
            <RiLayoutGridLine size={48} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Nog geen widgets</h3>
          <p className="text-muted-foreground mb-6">
            Maak je eerste widget aan om je AI agent op je website te embedden
          </p>
          <button
            onClick={() => router.push('/dashboard/widgets/editor')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/25"
          >
            Maak je eerste widget
          </button>
        </div>
      )}
    </div>
  );
}
