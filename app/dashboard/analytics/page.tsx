'use client';

import { useState, useEffect } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { dashboardAPI } from '@/lib/api';
import { MetricsCards } from '@/components/analytics/MetricsCards';
import { ConversationsChart } from '@/components/analytics/ConversationsChart';
import { ResponseTimeChart } from '@/components/analytics/ResponseTimeChart';
import { SatisfactionChart } from '@/components/analytics/SatisfactionChart';
import { TopAgentsTable } from '@/components/analytics/TopAgentsTable';
import { RealtimeStats } from '@/components/analytics/RealtimeStats';
import { DateRangePicker } from '@/components/analytics/DateRangePicker';
import { 
  RiBarChartLine,
  RiRefreshLine,
} from '@remixicon/react';

export default function AnalyticsPage() {
  const { selectedWorkspace } = useWorkspace();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [realtimeStats, setRealtimeStats] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    startDate: getDefaultStartDate(),
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (selectedWorkspace) {
      loadData();
      // Refresh realtime stats every 10 seconds
      const interval = setInterval(loadRealtimeStats, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedWorkspace, dateRange]);

  function getDefaultStartDate() {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Last 30 days
    return date.toISOString().split('T')[0];
  }

  const loadData = async () => {
    if (!selectedWorkspace) return;

    try {
      if (!isLoading) setIsRefreshing(true);
      
      const [analyticsData, realtimeData] = await Promise.all([
        dashboardAPI.getAnalytics(
          selectedWorkspace.id,
          dateRange.startDate,
          dateRange.endDate
        ),
        dashboardAPI.getRealtimeStats(selectedWorkspace.id),
      ]);

      setAnalytics(analyticsData);
      setRealtimeStats(realtimeData);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadRealtimeStats = async () => {
    if (!selectedWorkspace) return;
    
    try {
      const data = await dashboardAPI.getRealtimeStats(selectedWorkspace.id);
      setRealtimeStats(data);
    } catch (err: any) {
      console.error('Failed to load realtime stats:', err);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <RiBarChartLine size={32} />
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor your platform performance and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onChange={setDateRange}
          />
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
          >
            <RiRefreshLine size={18} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Realtime Stats */}
      <RealtimeStats stats={realtimeStats} />

      {/* Key Metrics */}
      <MetricsCards metrics={analytics?.metrics} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversations Over Time */}
        <ConversationsChart data={analytics?.conversationsOverTime} />

        {/* Response Time Trend */}
        <ResponseTimeChart data={analytics?.responseTimeTrend} />

        {/* Satisfaction Distribution */}
        <SatisfactionChart data={analytics?.satisfactionDistribution} />

        {/* Top Agents */}
        <TopAgentsTable agents={analytics?.topAgents} />
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Peak Hours */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Peak Hours</h3>
          {analytics?.peakHours?.map((hour: any, index: number) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
              <span className="text-sm text-muted-foreground">{hour.time}</span>
              <span className="text-sm font-medium text-foreground">{hour.count} conversations</span>
            </div>
          ))}
        </div>

        {/* Popular Topics */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Popular Topics</h3>
          {analytics?.popularTopics?.map((topic: any, index: number) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
              <span className="text-sm text-muted-foreground">{topic.name}</span>
              <span className="text-sm font-medium text-foreground">{topic.count} mentions</span>
            </div>
          ))}
        </div>

        {/* Average Metrics */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Averages</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Avg Messages per Conversation</span>
              <span className="text-sm font-medium text-foreground">
                {analytics?.averages?.messagesPerConversation?.toFixed(1) || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Avg Conversation Duration</span>
              <span className="text-sm font-medium text-foreground">
                {analytics?.averages?.conversationDuration || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">First Response Time</span>
              <span className="text-sm font-medium text-foreground">
                {analytics?.averages?.firstResponseTime || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
