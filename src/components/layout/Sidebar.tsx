'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { shopAdminNavigation } from '../../constants/navigation/shop-admin-navigation';
import { organizationNavigation } from '../../constants/navigation/organization-navigation';
import { validateRoute } from '../../lib/navigation/route-validator';
import { usePermissions } from '../../lib/auth/usePermissions';
import { useOrganizationStore } from '../../store/useOrganizationStore';

export const Sidebar = () => {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  const { viewMode } = useOrganizationStore();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  
  const currentNavigation = pathname.startsWith('/dashboard/organization') ? organizationNavigation : shopAdminNavigation;

  useEffect(() => {
    // Auto-expand the group that contains the active route
    const activeGroup = currentNavigation.find(g => 
      g.items?.some(item => pathname === item.href || (item.href !== '/dashboard/shop-admin' && item.href !== '/dashboard/organization' && pathname.startsWith(item.href)))
    );
    if (activeGroup?.label) {
      setExpandedGroup(activeGroup.label);
    }
  }, [pathname, currentNavigation]);

  const handleGroupClick = (label: string) => {
    setExpandedGroup(prev => prev === label ? null : label);
  };

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 flex-shrink-0 z-20 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-colors duration-200 h-full min-h-screen overflow-y-auto">
      <div className="flex-1 flex flex-col min-h-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
        <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="text-xl font-bold text-[#006970] dark:text-[#008990] flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-[#006970] text-white flex items-center justify-center font-black">T</span>
            TijaratPro
          </div>
        </div>
        
        <div className="flex-1 flex flex-col pt-4 pb-4 overflow-y-auto">
          <nav className="flex-1 px-3 space-y-1">
            {currentNavigation.map((group, groupIdx) => {
              // Filter out items without permission
              const permittedItems = (group.items || []).filter(item => {
                if (item.permission && !hasPermission(item.permission as any)) return false;
                return true;
              });

              if (permittedItems.length === 0) return null;

              // If no label, just render flat items (like Dashboard usually)
              if (!group.label) {
                return (
                  <div key={`flat-${groupIdx}`} className="flex flex-col mb-2 space-y-1">
                    {permittedItems.map(item => {
                      validateRoute(item.href, item.name);
                      const isActive =
                        item.href === '/dashboard/shop-admin' || item.href === '/dashboard/organization'
                          ? pathname === item.href
                          : pathname.startsWith(item.href);
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-[#006970]/10 text-[#006970] dark:bg-[#006970]/20 dark:text-[#00B4BB]'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                          }`}
                        >
                          <Icon
                            className={`flex-shrink-0 mr-3 h-5 w-5 transition-colors duration-200 ${
                              isActive ? 'text-[#006970] dark:text-[#00B4BB]' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                            }`}
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                );
              }

              const isExpanded = expandedGroup === group.label;
              const isActiveGroup = permittedItems.some(item => pathname === item.href || (item.href !== '/dashboard/shop-admin' && item.href !== '/dashboard/organization' && pathname.startsWith(item.href)));

              return (
                <div key={group.label} className="flex flex-col mb-1">
                  <button
                    onClick={() => handleGroupClick(group.label!)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActiveGroup && !isExpanded
                        ? 'text-[#006970] dark:text-[#00B4BB] bg-[#006970]/5 dark:bg-[#006970]/10'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                    aria-expanded={isExpanded}
                  >
                    <span className="flex items-center tracking-wide text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                      {group.label}
                    </span>
                    <ChevronRight 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90 text-gray-500' : 'text-gray-400'
                      }`} 
                    />
                  </button>

                  <div 
                    className={`overflow-hidden transition-all duration-200 ease-in-out ${
                      isExpanded ? 'max-h-[500px] opacity-100 mt-1 mb-2' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="space-y-1 pl-4 border-l-2 border-gray-100 dark:border-gray-800 ml-3 py-1">
                      {permittedItems.map((item) => {
                        validateRoute(item.href, item.name);
                        const isActive =
                          item.href === '/dashboard/shop-admin' || item.href === '/dashboard/organization'
                            ? pathname === item.href
                            : pathname.startsWith(item.href);
                        const Icon = item.icon;
                        
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              isActive 
                                ? 'bg-[#006970]/10 text-[#006970] dark:bg-[#006970]/20 dark:text-[#00B4BB]' 
                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                            }`}
                          >
                            <Icon 
                              className={`mr-3 h-4 w-4 ${
                                isActive ? 'text-[#006970] dark:text-[#00B4BB]' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                              }`} 
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
        </div>
        
      </div>
    </div>
  );
};

export default Sidebar;
