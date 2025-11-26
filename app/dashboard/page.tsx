'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  RiArrowRightLine,
  RiRobotLine,
  RiFlowChart,
  RiLayoutGridLine,
  RiTeamLine,
  RiDatabase2Line,
  RiMessage2Line,
  RiBarChartLine,
  RiSettings3Line,
  RiAddLine,
  RiPlayLine,
  RiEyeLine,
  RiLineChartLine,
  RiUserLine,
  RiGlobalLine,
} from '@remixicon/react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { agentAPI, workflowAPI, widgetAPI, chatAPI } from '@/lib/api';

const quickLinks = [
  {
    title: 'Agents',
    description: 'Beheer je AI-agents',
    href: '/dashboard/agents',
    icon: RiRobotLine,
    color: 'bg-blue-500',
    action: 'Nieuwe Agent',
    actionHref: '/dashboard/agents?create=true',
  },
  {
    title: 'Workflows',
    description: 'Automatiseer processen',
    href: '/dashboard/workflows',
    icon: RiFlowChart,
    color: 'bg-green-500',
    action: 'Nieuwe Workflow',
    actionHref: '/dashboard/workflows?create=true',
  },
  {
    title: 'Widgets',
    description: 'Embed chat widgets',
    href: '/dashboard/widgets',
    icon: RiLayoutGridLine,
    color: 'bg-purple-500',
    action: 'Widget Editor',
    actionHref: '/dashboard/widgets/editor',
  },
  {
    title: 'Teams',
    description: 'Organiseer je workspace',
    href: '/dashboard/teams',
    icon: RiTeamLine,
    color: 'bg-orange-500',
    action: 'Nieuw Team',
    actionHref: '/dashboard/teams?create=true',
  },
  {
    title: 'Knowledge Base',
    description: 'Beheer je kennisdatabase',
    href: '/dashboard/knowledge',
    icon: RiDatabase2Line,
    color: 'bg-indigo-500',
    action: 'Upload Files',
    actionHref: '/dashboard/knowledge/upload',
  },
  {
    title: 'Conversations',
    description: 'Bekijk chat gesprekken',
    href: '/dashboard/conversations',
    icon: RiMessage2Line,
    color: 'bg-teal-500',
    action: 'Bekijk Alle',
    actionHref: '/dashboard/conversations',
  },
];

const getStartedSteps = [
  {
    number: '01',
    title: 'Maak een Team',
    description: 'Start door een workspace/team aan te maken',
    href: '/dashboard/teams',
    icon: RiTeamLine,
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
  },
  {
    number: '02',
    title: 'Creëer een Agent',
    description: 'Configureer je eerste AI-agent',
    href: '/dashboard/agents',
    icon: RiRobotLine,
    color: 'bg-gradient-to-br from-green-500 to-green-600',
  },
  {
    number: '03',
    title: 'Bouw een Workflow',
    description: 'Automatiseer complexe conversaties',
    href: '/dashboard/workflows',
    icon: RiFlowChart,
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
  },
  {
    number: '04',
    title: 'Voeg een Widget toe',
    description: 'Embed op je website',
    href: '/dashboard/widgets/editor',
    icon: RiLayoutGridLine,
    color: 'bg-gradient-to-br from-orange-500 to-orange-600',
  },
];

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

export default function DashboardPage() {
  const { user } = useAuth();
  const { selectedWorkspace, workspaces } = useWorkspace();

  const [stats, setStats] = useState({
    totalAgents: 0,
    activeWorkflows: 0,
    totalWidgets: 0,
    totalConversations: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Gebruiker';
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Goedemorgen';
    if (hour < 18) return 'Goedemiddag';
    return 'Goedenavond';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Nu';
    if (diffInMinutes < 60) return `${diffInMinutes}m geleden`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}u geleden`;
    return `${Math.floor(diffInMinutes / 1440)}d geleden`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950';
      case 'waiting': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950';
      case 'resolved': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Actief';
      case 'waiting': return 'Wachtend';
      case 'resolved': return 'Opgelost';
      default: return status;
    }
  };

  // Load stats when workspace changes
  useEffect(() => {
    if (selectedWorkspace) {
      loadStats();
    } else {
      setStats({
        totalAgents: 0,
        activeWorkflows: 0,
        totalWidgets: 0,
        totalConversations: 0,
      });
    }
  }, [selectedWorkspace]);

  const loadStats = async () => {
    if (!selectedWorkspace) return;
    
    try {
      setIsLoadingStats(true);
      setIsLoadingActivity(true);
      
      // Load all data in parallel
      const [agents, workflows, widgets, conversations] = await Promise.allSettled([
        agentAPI.getWorkspaceAgents(selectedWorkspace.id),
        workflowAPI.getWorkspaceWorkflows(selectedWorkspace.id),
        widgetAPI.getWorkspaceWidgets(selectedWorkspace.id),
        chatAPI.getWorkspaceConversations(selectedWorkspace.id, {})
      ]);
      
      setStats({
        totalAgents: agents.status === 'fulfilled' ? agents.value?.length || 0 : 0,
        activeWorkflows: workflows.status === 'fulfilled' ? workflows.value?.filter(w => w.isActive).length || 0 : 0,
        totalWidgets: widgets.status === 'fulfilled' ? widgets.value?.length || 0 : 0,
        totalConversations: conversations.status === 'fulfilled' ? conversations.value?.length || 0 : 0,
      });
      
      // Set recent conversations (last 5, sorted by most recent message)
      if (conversations.status === 'fulfilled' && conversations.value) {
        const recent = conversations.value
          .sort((a: any, b: any) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())
          .slice(0, 5);
        setRecentConversations(recent);
      } else {
        setRecentConversations([]);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
      // Keep current stats on error
    } finally {
      setIsLoadingStats(false);
      setIsLoadingActivity(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 border border-border/50"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              {getTimeGreeting()}, {getUserDisplayName()}!
            </h1>
            <p className="text-muted-foreground text-lg mb-4">
              Welkom terug bij je Bonsai AI dashboard
              {selectedWorkspace && (
                <span className="ml-2 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                  {selectedWorkspace.name}
                </span>
              )}
            </p>
            {!selectedWorkspace && workspaces.length === 0 && (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard/teams"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  <RiTeamLine size={18} />
                  Maak je eerste team
                </Link>
              </div>
            )}
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{workspaces.length}</div>
              <div className="text-sm text-muted-foreground">Teams</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {isLoadingStats ? (
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  stats.totalAgents
                )}
              </div>
              <div className="text-sm text-muted-foreground">Agents</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {isLoadingStats ? (
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  stats.activeWorkflows
                )}
              </div>
              <div className="text-sm text-muted-foreground">Workflows</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Links Grid */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6">Snelle toegang</h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <motion.div key={link.title} variants={itemVariants}>
                <div className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/20">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${link.color} flex items-center justify-center`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <Link href={link.href}>
                      <RiArrowRightLine 
                        size={20} 
                        className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" 
                      />
                    </Link>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{link.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{link.description}</p>
                  <div className="flex items-center justify-between">
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Bekijk alle
                    </Link>
                    <Link
                      href={link.actionHref}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                    >
                      <RiAddLine size={14} />
                      {link.action}
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Get Started Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Aan de slag</h2>
            <p className="text-muted-foreground">Volg deze stappen om je eerste AI-agent te implementeren</p>
          </div>
          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-2 px-4 py-2 text-primary hover:text-primary/80 transition-colors"
          >
            <RiBarChartLine size={18} />
            Analytics bekijken
          </Link>
        </div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {getStartedSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.number} variants={itemVariants}>
                <Link href={step.href}>
                  <div className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-primary/20 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-muted-foreground/50">{step.number}</span>
                      <div className={`w-10 h-10 rounded-lg ${step.color} flex items-center justify-center`}>
                        <Icon size={20} className="text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">{step.description}</p>
                    <div className="mt-4 flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                      Start nu <RiArrowRightLine size={16} className="ml-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Additional Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Recente activiteit</h3>
              <Link
                href="/dashboard/conversations"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Bekijk alles
              </Link>
            </div>
            <div className="space-y-3">
              {isLoadingActivity ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Laden van recente activiteit...</p>
                </div>
              ) : !selectedWorkspace ? (
                <div className="text-center py-8 text-muted-foreground">
                  <RiTeamLine size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Selecteer een workspace om activiteit te bekijken</p>
                </div>
              ) : recentConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <RiMessage2Line size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Nog geen recente activiteit</p>
                  <p className="text-sm">Start een conversatie om activiteit te zien</p>
                </div>
              ) : (
                recentConversations.map((conversation, index) => (
                  <Link
                    key={conversation.id}
                    href="/dashboard/conversations"
                    className="block p-4 rounded-lg border border-border hover:border-primary/20 hover:bg-muted/50 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                            {getStatusText(conversation.status)}
                          </div>
                          {conversation.agent?.name && (
                            <span className="text-xs text-muted-foreground truncate">
                              via {conversation.agent.name}
                            </span>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-sm text-foreground line-clamp-2 mb-2">
                            <span className="font-medium">
                              {conversation.lastMessage.sender === 'user' ? 'Gebruiker' : 
                               conversation.lastMessage.sender === 'agent' ? 'Agent' : 'Systeem'}:
                            </span>{' '}
                            {conversation.lastMessage.content}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{formatTimeAgo(conversation.lastMessageAt)}</span>
                          <span>•</span>
                          <span>{conversation.messageCount} berichten</span>
                          {conversation.assignedTo && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <RiUserLine size={12} />
                                {conversation.assignedTo.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <RiArrowRightLine size={16} className="text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats & Actions */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Overzicht</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 flex items-center justify-center">
                    <RiRobotLine size={16} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm text-foreground">Agents</span>
                </div>
                <span className="text-lg font-semibold text-blue-700 dark:text-blue-300">
                  {isLoadingStats ? (
                    <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    stats.totalAgents
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 flex items-center justify-center">
                    <RiFlowChart size={16} className="text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-foreground">Workflows</span>
                </div>
                <span className="text-lg font-semibold text-green-700 dark:text-green-300">
                  {isLoadingStats ? (
                    <div className="w-4 h-4 border-2 border-green-600 dark:border-green-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    stats.activeWorkflows
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 flex items-center justify-center">
                    <RiLayoutGridLine size={16} className="text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-sm text-foreground">Widgets</span>
                </div>
                <span className="text-lg font-semibold text-orange-700 dark:text-orange-300">
                  {isLoadingStats ? (
                    <div className="w-4 h-4 border-2 border-orange-600 dark:border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    stats.totalWidgets
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 flex items-center justify-center">
                    <RiMessage2Line size={16} className="text-red-600 dark:text-red-400" />
                  </div>
                  <span className="text-sm text-foreground">Conversations</span>
                </div>
                <span className="text-lg font-semibold text-red-700 dark:text-red-300">
                  {isLoadingStats ? (
                    <div className="w-4 h-4 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    stats.totalConversations
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Snelle acties</h3>
            <div className="space-y-3">
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <RiSettings3Line size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Instellingen</span>
                <RiArrowRightLine size={16} className="ml-auto text-muted-foreground" />
              </Link>
              <Link
                href="/dashboard/analytics"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <RiLineChartLine size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Analytics</span>
                <RiArrowRightLine size={16} className="ml-auto text-muted-foreground" />
              </Link>
              <Link
                href="/dashboard/knowledge/upload"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <RiGlobalLine size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Upload Data</span>
                <RiArrowRightLine size={16} className="ml-auto text-muted-foreground" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
