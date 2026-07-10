'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { SUPER_ADMIN_ROUTES } from '@/constants/navigation/super-admin-routes';

export const Sidebar = () => {
  const pathname = usePathname();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  React.useEffect(() => {
    const activeGroup = SUPER_ADMIN_ROUTES.find(g => g.routes.some(item => pathname === item.href));
    if (activeGroup) {
      setExpandedGroup(activeGroup.groupName);
    }
  }, [pathname]);

  const handleGroupClick = (title: string) => {
    setExpandedGroup(prev => prev === title ? null : title);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-full min-h-screen overflow-y-auto">
      <div className="p-6 sticky top-0 bg-white z-10 border-b border-gray-100 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-800">Super Admin</h2>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1">
        {SUPER_ADMIN_ROUTES.map((group) => {
          const visibleRoutes = group.routes.filter(r => r.visible);
          if (visibleRoutes.length === 0) return null;

          const isActiveGroup = visibleRoutes.some(item => pathname === item.href);

          if (visibleRoutes.length === 1 && group.groupName === 'Overview') {
            const item = visibleRoutes[0];
            const Icon = item.icon;
            return (
              <div key={group.groupName} className="flex flex-col">
                <Link
                  href={item.href}
                  className={clsx(
                    "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActiveGroup ? "text-gray-900 bg-gray-50" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <span className="flex items-center uppercase tracking-wider text-xs font-semibold">
                    <Icon className={clsx("mr-3 h-4 w-4", isActiveGroup ? 'text-blue-700' : 'text-gray-400')} />
                    {item.title}
                  </span>
                </Link>
              </div>
            );
          }

          const isExpanded = expandedGroup === group.groupName;

          return (
            <div key={group.groupName} className="flex flex-col">
              <button
                onClick={() => handleGroupClick(group.groupName)}
                className={clsx(
                  "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActiveGroup ? "text-gray-900 bg-gray-50" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
                aria-expanded={isExpanded}
              >
                <span className="flex items-center uppercase tracking-wider text-xs font-semibold">
                  {group.groupName}
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
                  isExpanded ? "max-h-[800px] opacity-100 mt-1 mb-2" : "max-h-0 opacity-0"
                )}
              >
                <div className="space-y-1 pl-4 border-l-2 border-gray-100 ml-3 py-1">
                  {visibleRoutes.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    
                    return (
                      <Link
                        key={item.id}
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
                        {item.title}
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
