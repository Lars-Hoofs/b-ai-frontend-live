'use client';

import { useState, useRef, useEffect } from 'react';
import { RiSearchLine, RiArrowDownSLine, RiSettings3Line, RiLogoutBoxLine, RiUserLine, RiTeamLine, RiCheckboxCircleLine, RiShieldUserLine } from '@remixicon/react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Image from 'next/image';

export function Topbar() {
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userStatus, setUserStatus] = useState<'online' | 'offline' | 'away'>('offline');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const teamDropdownRef = useRef<HTMLDivElement | null>(null);
  const userDropdownRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const { user, logout } = useAuth();
  const { workspaces, selectedWorkspace, selectWorkspace, isLoading } = useWorkspace();
  const router = useRouter();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (teamDropdownRef.current && e.target instanceof Node && !teamDropdownRef.current.contains(e.target)) {
        setTeamDropdownOpen(false);
      }
      if (userDropdownRef.current && e.target instanceof Node && !userDropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const getUserInitial = () => {
    console.log('getUserInitial - user:', user);
    if (!user) {
      console.log('No user found, returning U');
      return 'U';
    }
    if (user.name) {
      console.log('Using name:', user.name);
      return user.name.charAt(0).toUpperCase();
    }
    if (user.email) {
      console.log('Using email:', user.email);
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Initialize Socket.io connection
  useEffect(() => {
    if (!user || !selectedWorkspace) return;

    // Connect to Socket.io met robuuste configuratie
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
      auth: {
        // ✅ Correcte cookie naam: enterprise.session_token (niet better-auth.session_token)
        token: document.cookie.split('; ').find(row => row.startsWith('enterprise.session_token'))?.split('=')[1]
      },
      transports: ['websocket', 'polling'],
      // ✅ Verbeterde reconnect configuratie
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket.io connected');

      // Join workspace room to receive notifications
      if (selectedWorkspace) {
        socket.emit('join:workspace', { workspaceId: selectedWorkspace.id });
      }
    });

    // ✅ Reconnect handler - rejoin workspace na reconnect
    socket.on('reconnect', () => {
      console.log('Socket.io reconnected');
      if (selectedWorkspace) {
        socket.emit('join:workspace', { workspaceId: selectedWorkspace.id });
      }
    });

    socket.on('conversation:human-requested', (data) => {
      console.log('Human agent requested:', data);
      // Show browser notification or toast
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Nieuwe chat wacht op u', {
          body: `${data.visitorName} vraagt om een medewerker`,
          icon: '/icon.png'
        });
      }

      // TODO: Update conversation list in sidebar
      // You can use a context or event emitter to notify the conversations component
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.io disconnected:', reason);
      // ✅ Alleen handmatig reconnecten als de server de verbinding heeft verbroken
      if (reason === 'io server disconnect') {
        // Server disconnected, probeer te reconnecten
        socket.connect();
      }
    });

    // ✅ Error handling
    socket.on('connect_error', (error) => {
      console.warn('Socket.io connection error:', error.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, selectedWorkspace]);

  // Fetch user status on mount
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const response = await fetch('/api/presence/status', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUserStatus(data.status || 'offline');
        }
      } catch (error) {
        console.error('Failed to fetch user status:', error);
      }
    };
    if (user) {
      fetchUserStatus();
    }
  }, [user]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const toggleUserStatus = async () => {
    setIsUpdatingStatus(true);
    try {
      const newStatus = userStatus === 'online' ? 'offline' : 'online';
      const response = await fetch('/api/presence/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setUserStatus(newStatus);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleLogout = async () => {
    // Set status to offline before logout
    try {
      await fetch('/api/presence/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'offline' }),
      });
    } catch (error) {
      console.error('Failed to set offline status:', error);
    }
    await logout();
    router.push('/login');
  };

  return (
    <div className="sticky top-0 z-10 h-16 border-b border-border bg-header/95 backdrop-blur-sm flex items-center px-6 justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl flex items-center gap-4">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks, workflows, widgets..."
            className="w-full pl-9 pr-4 h-9 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent transition-shadow"
          />
        </div>

        {/* Teams dropdown placed to the right of the search bar */}
        <div className="relative" ref={teamDropdownRef}>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={teamDropdownOpen}
            onClick={() => setTeamDropdownOpen((s) => !s)}
            disabled={isLoading || workspaces.length === 0}
            className="flex items-center gap-2 px-3 h-9 border border-border rounded-lg bg-card text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px] transition-colors"
          >
            <RiTeamLine className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm flex-1 text-left truncate font-medium">
              {isLoading ? 'Loading...' : selectedWorkspace ? selectedWorkspace.name : 'Select team'}
            </span>
            <RiArrowDownSLine className="w-4 h-4 text-muted-foreground" />
          </button>

          {teamDropdownOpen && workspaces.length > 0 && (
            <ul
              role="listbox"
              aria-label="Select team"
              className="absolute right-0 z-20 mt-2 w-64 bg-popover border border-border rounded-md shadow-lg py-1 max-h-80 overflow-y-auto"
            >
              {workspaces.map((workspace) => (
                <li
                  key={workspace.id}
                  role="option"
                  aria-selected={workspace.id === selectedWorkspace?.id}
                  onClick={() => {
                    selectWorkspace(workspace);
                    setTeamDropdownOpen(false);
                  }}
                  className={`px-3 py-2 cursor-pointer hover:bg-muted transition-colors ${workspace.id === selectedWorkspace?.id ? 'bg-primary/10' : ''
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <RiTeamLine className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm truncate ${workspace.id === selectedWorkspace?.id ? 'font-medium text-foreground' : 'text-foreground'
                        }`}>
                        {workspace.name}
                      </div>
                      {workspace.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {workspace.description}
                        </div>
                      )}
                    </div>
                    {workspace.id === selectedWorkspace?.id && (
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                    )}
                  </div>
                </li>
              ))}
              <div className="border-t border-border mt-1 pt-1">
                <button
                  onClick={() => {
                    router.push('/dashboard/teams');
                    setTeamDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-primary hover:bg-muted transition-colors text-left"
                >
                  + Nieuw Team Aanmaken
                </button>
              </div>
            </ul>
          )}
        </div>
      </div>

      {/* Right Side: Actions & Profile */}
      <div className="flex items-center gap-3 ml-6">

      </div>

      {/* Profile Dropdown */}
      <div className="relative" ref={userDropdownRef}>
        <button
          onClick={() => setUserDropdownOpen((s) => !s)}
          className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
        >
          <span className="text-sm">{getUserInitial()}</span>
        </button>

        {userDropdownOpen && (
          <div className="absolute right-0 z-20 mt-2 w-56 bg-popover border border-border rounded-md shadow-lg py-1">
            {/* Status Section */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${userStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  <span className="text-sm font-medium text-foreground">
                    {userStatus === 'online' ? 'Online' : 'Offline'}
                  </span>
                </div>
                <button
                  onClick={toggleUserStatus}
                  disabled={isUpdatingStatus}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${userStatus === 'online' ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userStatus === 'online' ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                  />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {userStatus === 'online'
                  ? 'U bent beschikbaar voor chats'
                  : 'U ontvangt geen nieuwe chats'
                }
              </p>
            </div>

            {/* Menu Items */}
            <button
              onClick={() => { router.push('/dashboard/settings'); setUserDropdownOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <RiSettings3Line size={18} />
              <span>Instellingen</span>
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => { router.push('/superadmin'); setUserDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <RiShieldUserLine size={18} />
                <span>Superadmin Dashboard</span>
              </button>
            )}
            <button
              onClick={() => { router.push('/dashboard/settings/profile'); setUserDropdownOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
            >
              <RiUserLine size={18} />
              <span>Profiel</span>
            </button>
            <div className="h-px bg-border my-1" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
            >
              <RiLogoutBoxLine size={18} />
              <span>Uitloggen</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
