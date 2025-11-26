"use client";

import { Sidebar } from '@/components/dashboard/sidebar';
import { Topbar } from '@/components/dashboard/topbar';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated after loading
    if (!loading && !user) {
      router.push('/login?redirect=/dashboard');
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!user) {
    return null;
  }

  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Subtle blue gradient glow from bottom */}
        <div 
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: 'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(0, 26, 255, 0.15) 0%, rgba(0, 26, 255, 0.05) 40%, transparent 70%)'
          }}
        />
        
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((s) => !s)} />
        <div
          className="transition-all duration-200 relative z-10"
          style={{ 
            marginLeft: collapsed ? '80px' : '256px',
            '--sidebar-width': collapsed ? '80px' : '256px'
          } as React.CSSProperties}
        >
          <Topbar />
          <main className="min-h-[calc(100vh-4rem)] p-6">
            <div className="max-w-[1600px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
