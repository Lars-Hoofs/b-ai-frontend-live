'use client';

import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '@/lib/api';
import { formatTime } from '@/lib/date-utils';
import { AssignModal } from './AssignModal';
import {
  RiCloseLine,
  RiSendPlaneLine,
  RiUserLine,
  RiRobotLine,
  RiCheckLine,
  RiStarLine,
  RiStarFill,
  RiUserAddLine,
  RiGlobalLine
} from '@remixicon/react';

interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: 'USER' | 'AGENT' | 'ASSISTANT' | 'SYSTEM';
  createdAt: string;
  metadata?: any;
  senderId?: string | null;
}

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
}

interface ConversationDetailProps {
  conversation: Conversation;
  onClose: () => void;
  onAssign: (conversationId: string, userId: string) => Promise<void>;
  onResolve: (conversationId: string, rating?: number, feedback?: string) => Promise<void>;
  currentUserId: string | null;
}

export function ConversationDetail({
  conversation,
  onClose,
  onAssign,
  onResolve,
  currentUserId,
}: ConversationDetailProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [resolveRating, setResolveRating] = useState(0);
  const [resolveFeedback, setResolveFeedback] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef<number>(0);

  useEffect(() => {
    // Initial load with loader
    loadMessages(true);

    // Poll for new messages every 2 seconds without showing loader
    const interval = setInterval(() => loadMessages(false), 2000);

    return () => clearInterval(interval);
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async (showLoader = true) => {
    try {
      if (showLoader) {
        setIsLoadingMessages(true);
      }

      const data = await chatAPI.getMessages(conversation.id);

      if (data) {
        // Handle both array and object with messages property
        const messagesList = Array.isArray(data) ? data : (data.messages || []);

        // Only update if there are actually changes
        if (messagesList.length !== lastMessageCountRef.current) {
          setMessages(messagesList);
          lastMessageCountRef.current = messagesList.length;
        } else if (messagesList.length > 0) {
          // Check if content has changed (compare last message)
          const lastNewMsg = messagesList[messagesList.length - 1];
          const lastOldMsg = messages[messages.length - 1];

          if (!lastOldMsg || lastNewMsg.id !== lastOldMsg.id || lastNewMsg.content !== lastOldMsg.content) {
            setMessages(messagesList);
          }
        }
      } else if (messages.length > 0) {
        // Only clear if we had messages before
        setMessages([]);
        lastMessageCountRef.current = 0;
      }
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      // Don't clear messages on error, keep existing ones
    } finally {
      if (showLoader) {
        setIsLoadingMessages(false);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    try {
      setIsSending(true);

      const tempId = 'temp-' + Date.now();

      // Optimistically add message to UI
      const tempMessage: Message = {
        id: tempId,
        conversationId: conversation.id,
        content: newMessage.trim(),
        role: 'AGENT',
        createdAt: new Date().toISOString(),
        senderId: currentUserId,
      };
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');

      // We manually increment the count so the next loadMessages doesn't ignore the updated real message
      lastMessageCountRef.current += 1;

      // Send to server
      const result = await chatAPI.sendMessage({
        conversationId: conversation.id,
        content: tempMessage.content,
        role: 'AGENT',
      });

      // If result contains the real message, replace the temp one immediately
      if (result && result.id) {
        setMessages(prev => prev.map(msg => msg.id === tempId ? result : msg));
      } else {
        // Otherwise, reload to get real message with ID
        await loadMessages(false);
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert(err.message || 'Failed to send message');
      // Reload to remove temp message
      await loadMessages();
    } finally {
      setIsSending(false);
    }
  };

  const handleResolve = async () => {
    try {
      await onResolve(
        conversation.id,
        resolveRating > 0 ? resolveRating : undefined,
        resolveFeedback.trim() || undefined
      );
      setShowResolveModal(false);
    } catch (err: any) {
      console.error('Failed to resolve:', err);
    }
  };

  const getSenderIcon = (role: string) => {
    const r = role.toUpperCase();
    if (r === 'USER') return <RiUserLine size={16} />;
    if (r === 'AGENT' || r === 'ASSISTANT') return <RiRobotLine size={16} />;
    return null;
  };

  const getSenderLabel = (role: string, senderId?: string | null) => {
    const r = role.toUpperCase();
    if (r === 'USER') return 'Customer';
    if (r === 'AGENT') {
      // If there's a senderId and it matches assignedTo, show user name
      if (senderId && conversation.assignedTo?.name) {
        return conversation.assignedTo.name;
      }
      return 'Support Agent';
    }
    if (r === 'ASSISTANT') return conversation.agent?.name || 'AI Agent';
    return 'System';
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">
              Conversation #{conversation.id.slice(0, 8)}
            </h2>
            <span className={`text-xs px-2 py-1 rounded-full ${conversation.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                conversation.status === 'waiting' ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300' :
                  'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
              }`}>
              {conversation.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Info & Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Agent: {conversation.agent?.name || 'Unknown'}</p>
            <p>Started: {new Date(conversation.startedAt).toLocaleString()}</p>
            {conversation.currentPageUrl && (
              <div className="flex items-center gap-1 text-xs">
                <RiGlobalLine size={14} />
                <span className="text-blue-600 dark:text-blue-400" title={conversation.currentPageUrl}>
                  User on: {conversation.currentPageUrl}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!conversation.assignedToId && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                <RiUserAddLine size={16} />
                Assign
              </button>
            )}
            {conversation.status !== 'resolved' && (
              <button
                onClick={() => setShowResolveModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
              >
                <RiCheckLine size={16} />
                Resolve
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const role = message.role.toUpperCase();
              const isUser = role === 'USER';
              const isSystem = role === 'SYSTEM';
              const isAgent = role === 'AGENT';
              const isAssistant = role === 'ASSISTANT';

              if (isSystem) {
                return (
                  <div key={message.id} className="flex justify-center">
                    <div className="bg-muted px-4 py-2 rounded-lg text-sm text-muted-foreground">
                      {message.content}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[70%] ${isUser ? '' : 'items-end'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {getSenderIcon(message.role)}
                      <span className="text-xs text-muted-foreground">
                        {getSenderLabel(message.role, message.senderId)} · {formatTime(message.createdAt)}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-3 rounded-lg ${isUser
                          ? 'bg-muted text-foreground'
                          : isAgent
                            ? 'bg-green-500 text-white'
                            : 'bg-primary text-primary-foreground'
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      {conversation.status !== 'resolved' && (
        <div className="bg-card border-t border-border p-4">
          {/* Check if current user is assigned to this conversation */}
          {conversation.assignedToId && conversation.assignedToId !== currentUserId ? (
            <div className="flex items-center justify-center py-4 text-center">
              <div className="text-muted-foreground">
                <p className="text-sm font-medium mb-1">This conversation is assigned to {conversation.assignedTo?.name || 'another agent'}</p>
                <p className="text-xs">Only the assigned agent can reply to this conversation</p>
              </div>
            </div>
          ) : !conversation.assignedToId ? (
            <div className="flex items-center justify-center py-4 text-center">
              <div className="text-muted-foreground">
                <p className="text-sm font-medium mb-2">⚠️ Not assigned yet</p>
                <p className="text-xs mb-3">You need to assign this conversation before you can reply</p>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium mx-auto"
                >
                  <RiUserAddLine size={16} />
                  Assign to me
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="flex items-end gap-3">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type your message... (Shift+Enter for new line)"
                className="flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                rows={2}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <RiSendPlaneLine size={18} />
                Send
              </button>
            </form>
          )}
        </div>
      )}

      {/* Assign Modal */}
      <AssignModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        workspaceId={conversation.workspaceId}
        currentUserId={currentUserId}
        onAssign={(userId) => onAssign(conversation.id, userId)}
      />

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Resolve Conversation
            </h3>

            <div className="space-y-4">
              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Customer Satisfaction (Optional)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setResolveRating(star)}
                      className="text-yellow-500 hover:scale-110 transition-transform"
                    >
                      {star <= resolveRating ? (
                        <RiStarFill size={32} />
                      ) : (
                        <RiStarLine size={32} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Internal Notes (Optional)
                </label>
                <textarea
                  value={resolveFeedback}
                  onChange={(e) => setResolveFeedback(e.target.value)}
                  placeholder="Add any internal notes about this conversation..."
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none"
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowResolveModal(false)}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolve}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Resolve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
