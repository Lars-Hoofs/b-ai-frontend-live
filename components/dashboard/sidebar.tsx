"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  RiDashboardLine, 
  RiTeamLine,
  RiRobotLine,
  RiDatabase2Line,
  RiFlowChart,
  RiLayoutGridLine,
  RiMessage2Line,
  RiBarChartLine,
  RiSettings3Line,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiUserLine,
  RiUserAddLine,
  RiFileTextLine,
  RiUploadLine,
  RiGlobalLine,
  RiCodeLine,
  RiEditLine,
} from "@remixicon/react";
import { useState } from "react";

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: RiDashboardLine,
  },
  {
    name: 'Teams',
    href: '/dashboard/teams',
    icon: RiTeamLine,
  },
  {
    name: 'Agents',
    href: '/dashboard/agents',
    icon: RiRobotLine,
  },
  {
    name: 'Knowledge Base',
    href: '/dashboard/knowledge',
    icon: RiDatabase2Line,
    children: [
      { name: 'Documents', href: '/dashboard/knowledge/documents', icon: RiFileTextLine },
      { name: 'Upload Files', href: '/dashboard/knowledge/upload', icon: RiUploadLine },
      { name: 'Scrape Website', href: '/dashboard/knowledge/scrape', icon: RiGlobalLine },
    ],
  },
  {
    name: 'Workflows',
    href: '/dashboard/workflows',
    icon: RiFlowChart,
  },
  {
    name: 'Widgets',
    href: '/dashboard/widgets',
    icon: RiLayoutGridLine,
    children: [
      { name: 'All Widgets', href: '/dashboard/widgets', icon: RiLayoutGridLine },
      { name: 'Embed Code', href: '/dashboard/widgets/embed', icon: RiCodeLine },
    ],
  },
  {
    name: 'Conversations',
    href: '/dashboard/conversations',
    icon: RiMessage2Line,
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: RiBarChartLine,
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: RiSettings3Line,
    children: [
      { name: 'Profile', href: '/dashboard/settings/profile', icon: RiUserLine },
    ],
  },
];

export function Sidebar({
  collapsed: collapsedProp,
  onToggle,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
}) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const isControlled = typeof collapsedProp !== "undefined";
  const collapsed = isControlled ? Boolean(collapsedProp) : internalCollapsed;

  const setCollapsed = (next?: boolean) => {
    if (isControlled) {
      onToggle && onToggle();
    } else {
      setInternalCollapsed((s) => (typeof next === 'boolean' ? next : !s));
    }
  };

  const width = collapsed ? 80 : 256; // px (matches w-20 / w-64)

  // no document-level side effects — layout controls spacing

  return (
    <aside
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200"
      style={{ width }}
      aria-expanded={!collapsed}
    >
      {/* Header: Logo + Toggle */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-foreground">
              Bonsai
            </span>
          )}
        </Link>

        {!collapsed && (
          <button
            aria-label="Collapse sidebar"
            title="Collapse"
            onClick={() => setCollapsed()}
            className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const isExpanded = expandedItems.includes(item.name);
          const hasChildren = item.children && item.children.length > 0;
          const Icon = item.icon;

          return (
            <div key={item.name}>
              {/* Main item */}
              {hasChildren ? (
                <div className="relative">
                  <Link href={item.href}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        isActive 
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      } ${collapsed ? 'justify-center' : ''}`}
                      role="link"
                      aria-current={isActive ? 'page' : undefined}
                      title={item.name}
                    >
                      <Icon size={20} className="flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{item.name}</span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setExpandedItems(prev => 
                                prev.includes(item.name) 
                                  ? prev.filter(n => n !== item.name)
                                  : [...prev, item.name]
                              );
                            }}
                            className="flex-shrink-0 p-1 hover:bg-sidebar-accent/50 rounded transition-colors"
                            aria-label={isExpanded ? 'Collapse submenu' : 'Expand submenu'}
                          >
                            {isExpanded ? <RiArrowDownSLine size={18} /> : <RiArrowRightSLine size={18} />}
                          </button>
                        </>
                      )}
                    </div>
                  </Link>
                </div>
              ) : (
                <Link href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                      isActive 
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' 
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    } ${collapsed ? 'justify-center' : ''}`}
                    role="link"
                    aria-current={isActive ? 'page' : undefined}
                    title={item.name}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {!collapsed && <span className="flex-1 text-left">{item.name}</span>}
                  </div>
                </Link>
              )}

              {/* Sub-items */}
              {hasChildren && isExpanded && !collapsed && (
                <div className="ml-7 mt-0.5 space-y-0.5 border-l-2 border-sidebar-border pl-3">
                  {item.children.map((child: any) => {
                    const isChildActive = pathname === child.href;
                    const ChildIcon = child.icon;
                    return (
                      <Link key={child.name} href={child.href}>
                        <div
                          className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all ${
                            isChildActive 
                              ? 'bg-sidebar-accent text-foreground font-medium' 
                              : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
                          }`}
                        >
                          <ChildIcon size={16} />
                          <span>{child.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* collapsed: no user info rendered by request */}
    </aside>
  );
}
