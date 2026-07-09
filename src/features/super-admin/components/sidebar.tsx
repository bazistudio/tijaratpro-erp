'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, Building2, Settings, Store, Building,
  CheckCircle2, Ban, Shield, Activity, CreditCard, Clock, XCircle,
  Flag, Briefcase, Settings2, Key, Lock, FileText, History, AlertTriangle,
  Bell, Cpu, Database, List, HardDrive, Mail, Sliders, Palette, Globe, Wrench,
  ChevronDown, ChevronRight, ClipboardList
} from 'lucide-react';
import clsx from 'clsx';

const navGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard/super-admin', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Requests',
    items: [
      { name: 'Approval Requests', href: '/dashboard/super-admin/requests/approvals', icon: ClipboardList },
      { name: 'Single Shop Requests', href: '/dashboard/super-admin/requests/single-shops', icon: Store },
      { name: 'Organization Requests', href: '/dashboard/super-admin/requests/organizations', icon: Building2 },
    ]
  },
  {
    title: 'Single Shops',
    items: [
      { name: 'All Single Shops', href: '/dashboard/super-admin/single-shops', icon: Store },
      { name: 'Suspended Single Shops', href: '/dashboard/super-admin/single-shops/suspended', icon: Ban },
    ]
  },
  {
    title: 'Organizations',
    items: [
      { name: 'All Organizations', href: '/dashboard/super-admin/organizations', icon: Building },
      { name: 'Suspended Organizations', href: '/dashboard/super-admin/organizations/suspended', icon: Ban },
    ]
  },
  {
    title: 'Users',
    items: [
      { name: 'All Users', href: '/dashboard/super-admin/users/all', icon: Users },
      { name: 'Active Sessions', href: '/dashboard/super-admin/users/sessions', icon: Activity },
      { name: 'Suspended Users', href: '/dashboard/super-admin/users/suspended', icon: Ban },
      { name: 'Super Admins', href: '/dashboard/super-admin/users/admins', icon: Shield },
    ]
  },
  {
    title: 'Subscription Management',
    items: [
      { name: 'Dashboard', href: '/dashboard/super-admin/subscriptions', icon: LayoutDashboard },
      { name: 'Packages', href: '/dashboard/super-admin/subscriptions/packages', icon: CreditCard },
      { name: 'Active Subscriptions', href: '/dashboard/super-admin/subscriptions/active', icon: CheckCircle2 },
      { name: 'Payment Requests', href: '/dashboard/super-admin/subscriptions/payments', icon: Clock },
      { name: 'Subscription History', href: '/dashboard/super-admin/subscriptions/history', icon: History },
      { name: 'Reports', href: '/dashboard/super-admin/subscriptions/reports', icon: FileText },
    ]
  },
  {
    title: 'Feature Management',
    items: [
      { name: 'Feature Flags', href: '/dashboard/super-admin/features/flags', icon: Flag },
      { name: 'Business Types', href: '/dashboard/super-admin/features/business-types', icon: Briefcase },
      { name: 'Default Features', href: '/dashboard/super-admin/features/defaults', icon: Settings2 },
      { name: 'Module Access', href: '/dashboard/super-admin/features/modules', icon: Key },
    ]
  },
  {
    title: 'Security',
    items: [
      { name: 'Roles & Permissions', href: '/dashboard/super-admin/security/roles', icon: Lock },
      { name: 'Audit Logs', href: '/dashboard/super-admin/security/audit', icon: FileText },
      { name: 'Login History', href: '/dashboard/super-admin/security/login-history', icon: History },
      { name: 'Security Events', href: '/dashboard/super-admin/security/events', icon: AlertTriangle },
    ]
  },
  {
    title: 'System',
    items: [
      { name: 'Monitoring', href: '/dashboard/super-admin/system/monitoring', icon: Activity },
      { name: 'Notifications', href: '/dashboard/super-admin/system/notifications', icon: Bell },
      { name: 'Background Jobs', href: '/dashboard/super-admin/system/jobs', icon: Cpu },
      { name: 'Cache Manager', href: '/dashboard/super-admin/system/cache', icon: Database },
      { name: 'Event Queue', href: '/dashboard/super-admin/system/events', icon: List },
      { name: 'Backups', href: '/dashboard/super-admin/system/backups', icon: HardDrive },
    ]
  },
  {
    title: 'Settings',
    items: [
      { name: 'General Settings', href: '/dashboard/super-admin/settings/general', icon: Settings },
      { name: 'Email & SMS', href: '/dashboard/super-admin/settings/email-sms', icon: Mail },
      { name: 'System Configuration', href: '/dashboard/super-admin/settings/config', icon: Sliders },
      { name: 'Branding', href: '/dashboard/super-admin/settings/branding', icon: Palette },
      { name: 'Localization', href: '/dashboard/super-admin/settings/localization', icon: Globe },
      { name: 'Maintenance Mode', href: '/dashboard/super-admin/settings/maintenance', icon: Wrench },
    ]
  }
];

export const Sidebar = () => {
  const pathname = usePathname();
  const [expandedGroup, setExpandedGroup] = React.useState<string | null>(null);

  React.useEffect(() => {
    const activeGroup = navGroups.find(g => g.items.some(item => pathname === item.href));
    if (activeGroup) {
      setExpandedGroup(activeGroup.title);
    }
  }, [pathname]);

  const handleGroupClick = (title: string) => {
    setExpandedGroup(prev => prev === title ? null : title);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-full min-h-screen overflow-y-auto">
      <div className="p-6 sticky top-0 bg-white z-10 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">Super Admin</h2>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navGroups.map((group) => {
          const isActiveGroup = group.items.some(item => pathname === item.href);

          if (group.items.length === 1) {
            const item = group.items[0];
            return (
              <div key={group.title} className="flex flex-col">
                <Link
                  href={item.href}
                  className={clsx(
                    "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActiveGroup ? "text-gray-900 bg-gray-50" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <span className="flex items-center uppercase tracking-wider text-xs font-semibold">
                    {item.name}
                  </span>
                </Link>
              </div>
            );
          }

          const isExpanded = expandedGroup === group.title;

          return (
            <div key={group.title} className="flex flex-col">
              <button
                onClick={() => handleGroupClick(group.title)}
                className={clsx(
                  "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActiveGroup ? "text-gray-900 bg-gray-50" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
                aria-expanded={isExpanded}
              >
                <span className="flex items-center uppercase tracking-wider text-xs font-semibold">
                  {group.title}
                </span>
                <ChevronRight 
                  className={clsx(
                    "h-4 w-4 text-gray-400 transition-transform duration-200",
                    isExpanded && "rotate-90"
                  )} 
                />
              </button>

              <div 
                className={clsx(
                  "overflow-hidden transition-all duration-200 ease-in-out",
                  isExpanded ? "max-h-[500px] opacity-100 mt-1 mb-2" : "max-h-0 opacity-0"
                )}
              >
                <div className="space-y-1 pl-4 border-l-2 border-gray-100 ml-3 py-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={clsx(
                          'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                          isActive 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        )}
                      >
                        <Icon 
                          className={clsx(
                            'mr-3 h-4 w-4',
                            isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                          )} 
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
