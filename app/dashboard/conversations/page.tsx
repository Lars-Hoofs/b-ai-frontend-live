'use client';

import { useState, useEffect } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { chatAPI, dashboardAPI, getCurrentUser } from '@/lib/api';
import { ConversationList } from '@/components/conversations/ConversationList';
import { ConversationDetail } from '@/components/conversations/ConversationDetail';
import { ConversationFilters } from '@/components/conversations/ConversationFilters';
import { 
  RiMessage2Line, 
  RiRefreshLine,
  RiUserLine,
  RiCheckLine,
  RiTimeLine
} from '@remixicon/react';

interface Conversation {
  id: string;
  userId: string | null;
  agentId: string;
  workspaceId: string;
  status: 'active' | 'waiting' | 'resolved';
  assignedToId: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  rating: number | null;
  feedback: string | null;
  startedAt: string;
  resolvedAt: string | null;
  lastMessageAt: string;
  messageCount: number;
  currentPageUrl?: string | null; 
  agent?: {
    name: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  lastMessage?: {
    content: string;
    sender: 'user' | 'agent' | 'system';
  };
}

export default function ConversationsPage() {
  const { selectedWorkspace } = useWorkspace();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    status: 'open', 
    assigned: 'all',
    priority: 'all',
  });

  // Statistics
  const [stats, setStats] = useState({
    active: 0,
    waiting: 0,
    resolved: 0,
    unassigned: 0,
  });

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      loadConversations(true);
      // Refresh every 5 seconds without loader
      const interval = setInterval(() => loadConversations(false), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedWorkspace, filters]);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUserId(user.id);
      }
    } catch (err) {
      console.error('Failed to load current user:', err);
    }
  };

  const loadConversations = async (showLoader = false) => {
    if (!selectedWorkspace) return;

    try {
      if (showLoader && !isLoading) {
        setIsRefreshing(true);
      }
      
      const filterParams: any = {};
      if (filters.status && filters.status !== 'all') {
        filterParams.status = filters.status;
      }
      if (filters.assigned === 'assigned') filterParams.assignedToId = true;
      if (filters.assigned === 'unassigned') filterParams.assignedToId = false;
      if (filters.priority !== 'all') filterParams.priority = filters.priority;

      const data = await chatAPI.getWorkspaceConversations(selectedWorkspace.id, filterParams);
      
      // Only update if there are actual changes
      const hasChanges = JSON.stringify(data) !== JSON.stringify(conversations);
      
      if (hasChanges) {
        setConversations(data || []);

        // Calculate stats
        const active = data?.filter((c: Conversation) => c.status === 'active').length || 0;
        const waiting = data?.filter((c: Conversation) => c.status === 'waiting').length || 0;
        const resolved = data?.filter((c: Conversation) => c.status === 'resolved').length || 0;
        const unassigned = data?.filter((c: Conversation) => !c.assignedToId).length || 0;

        setStats({ active, waiting, resolved, unassigned });
      }
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleCloseConversation = () => {
    setSelectedConversation(null);
  };

  const handleAssignConversation = async (conversationId: string, userId: string) => {
    try {
      await chatAPI.assignConversation(conversationId, userId);
      
      // Reload conversations to get updated data including assignedTo user info
      await loadConversations(true);
      
      // Reload the selected conversation details
      if (selectedConversation?.id === conversationId) {
        const updated = await chatAPI.getConversation(conversationId);
        if (updated) {
          setSelectedConversation(updated as any);
        }
      }
    } catch (err: any) {
      console.error('Failed to assign conversation:', err);
      alert(err.message || 'Failed to assign conversation');
    }
  };

  const handleResolveConversation = async (conversationId: string, rating?: number, feedback?: string) => {
    try {
      await chatAPI.resolveConversation(conversationId, rating, feedback);
      
      // Remove from list immediately for instant feedback
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      setSelectedConversation(null);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        resolved: prev.resolved + 1,
        active: prev.active - 1,
      }));
      
      // Reload from server in background
      setTimeout(() => loadConversations(false), 500);
    } catch (err: any) {
      console.error('Failed to resolve conversation:', err);
      alert(err.message || 'Failed to resolve conversation');
      // Reload on error
      await loadConversations(true);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <RiMessage2Line size={28} />
              Conversaties
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Beheer en beantwoord klantgesprekken vanuit één centrale inbox.
            </p>
          </div>
          <button
            onClick={loadConversations}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
          >
            <RiRefreshLine size={18} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <RiMessage2Line size={20} />
              <span className="text-sm font-medium">Actief</span>
            </div>
            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.active}</p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
              <RiTimeLine size={20} />
              <span className="text-sm font-medium">Aan het wachten</span>
            </div>
            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.waiting}</p>
          </div>

          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
              <RiUserLine size={20} />
              <span className="text-sm font-medium">niet toegewezen</span>
            </div>
            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.unassigned}</p>
          </div>

          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
              <RiCheckLine size={20} />
              <span className="text-sm font-medium">Opgelost</span>
            </div>
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.resolved}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Filters + Conversation List */}
        <div className={`${selectedConversation ? 'w-96' : 'flex-1'} border-r border-border flex flex-col transition-all`}>
          <ConversationFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
          <ConversationList
            conversations={conversations}
            selectedConversation={selectedConversation}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        {/* Right: Conversation Detail */}
        {selectedConversation ? (
          <div className="flex-1">
            <ConversationDetail
              conversation={selectedConversation}
              onClose={handleCloseConversation}
              onAssign={handleAssignConversation}
              onResolve={handleResolveConversation}
              currentUserId={currentUserId}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <RiMessage2Line size={64} className="text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Geen conversatie geselecteerd
              </h3>
              <p className="text-muted-foreground">
                Selecteer een conversatie uit de lijst om details te bekijken en te reageren.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
