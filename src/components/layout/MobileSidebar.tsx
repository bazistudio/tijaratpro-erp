'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ChevronRight } from 'lucide-react';
import { shopAdminNavigation } from '../../constants/navigation/shop-admin-navigation';
import { organizationNavigation } from '../../constants/navigation/organization-navigation';
import { usePermissions } from '../../lib/auth/usePermissions';
import { validateRoute } from '../../lib/navigation/route-validator';

interface MobileSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const MobileSidebar = ({ isOpen, setIsOpen }: MobileSidebarProps) => {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();
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

  if (!isOpen) return null;

  return (
    <div className="relative z-50 lg:hidden">
      <div 
        className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-0 flex">
        <div className="relative mr-16 flex w-full max-w-xs flex-1">
          <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
            <button type="button" className="-m-2.5 p-2.5" onClick={() => setIsOpen(false)}>
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>

          <div className="flex grow flex-col overflow-y-auto bg-white dark:bg-gray-900 pb-4">
            <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <span className="text-xl font-bold text-[#006970] dark:text-[#00B4BB]">TijaratPro</span>
            </div>
            
            <nav className="flex flex-1 flex-col pt-4 px-3">
              <div className="space-y-1">
                {currentNavigation.map((group, groupIdx) => {
                  const permittedItems = (group.items || []).filter(item => {
                    if (item.permission && !hasPermission(item.permission as any)) return false;
                    return true;
                  });

                  if (permittedItems.length === 0) return null;

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
                              onClick={() => setIsOpen(false)}
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
                                onClick={() => setIsOpen(false)}
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
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
