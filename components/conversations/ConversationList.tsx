'use client';

import { RiUserLine, RiTimeLine, RiAlertLine, RiGlobalLine } from '@remixicon/react';
import { formatDistanceToNow } from '@/lib/date-utils';

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

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
}

const priorityColors = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const statusColors = {
  active: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  waiting: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
};

export function ConversationList({ 
  conversations, 
  selectedConversation, 
  onSelectConversation 
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <RiAlertLine size={48} className="text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Geen conversaties gevonden
          </h3>
          <p className="text-sm text-muted-foreground">
            Er zijn momenteel geen conversaties om weer te geven. Pas eventueel uw filters aan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => {
        const isSelected = selectedConversation?.id === conversation.id;
        
        return (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`w-full p-4 border-b border-border text-left transition-colors hover:bg-muted/50 ${
              isSelected ? 'bg-muted border-l-4 border-l-primary' : ''
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-sm font-medium text-foreground truncate">
                  {conversation.agent?.name || 'Unknown Agent'}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[conversation.priority]}`}>
                  {conversation.priority}
                </span>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[conversation.status]} ml-2`}>
                {conversation.status}
              </span>
            </div>

            {/* Current Page URL */}
            {conversation.currentPageUrl && (
              <div className="flex items-center gap-1 mb-2 text-xs text-muted-foreground">
                <RiGlobalLine size={12} />
                <span className="truncate" title={conversation.currentPageUrl}>
                  User on: {conversation.currentPageUrl}
                </span>
              </div>
            )}

            {/* Last Message */}
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {conversation.lastMessage?.content || 'No messages yet'}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <RiTimeLine size={14} />
                  <span>{formatDistanceToNow(conversation.lastMessageAt)}</span>
                </div>
                <span>{conversation.messageCount} Berichten</span>
              </div>
              {conversation.assignedTo ? (
                <div className="flex items-center gap-1">
                  <RiUserLine size={14} />
                  <span>{conversation.assignedTo.name}</span>
                </div>
              ) : (
                <span className="text-orange-600 dark:text-orange-400 font-medium">
                  Unassigned
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
