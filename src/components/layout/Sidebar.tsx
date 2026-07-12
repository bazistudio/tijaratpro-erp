'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { shopAdminNavigation } from '../../constants/navigation/shop-admin-navigation';
import { organizationNavigation } from '../../constants/navigation/organization-navigation';
import { validateRoute } from '../../lib/navigation/route-validator';
import { usePermissions } from '../../lib/auth/usePermissions';
import { Menu, ChevronLeft } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const currentNavigation = pathname.startsWith('/dashboard/organization') ? organizationNavigation : shopAdminNavigation;

  return (
    <div 
      className={`hidden lg:flex lg:flex-col flex-shrink-0 z-20 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out h-full min-h-screen overflow-y-auto ${
        isCollapsed ? 'lg:w-16' : 'lg:w-64'
      }`}
    >
      <div className="flex-1 flex flex-col min-h-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
        <div className={`flex items-center h-12 flex-shrink-0 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
          
          <div className={`text-lg font-bold text-[#006970] dark:text-[#008990] flex items-center gap-2 overflow-hidden transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}`}>
            <span className="w-8 h-8 rounded bg-[#006970] text-white flex items-center justify-center font-black flex-shrink-0">T</span>
            <span className="whitespace-nowrap">TijaratPro</span>
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden pt-0 pb-2">
          <nav className="mt-1 flex-1 px-2 space-y-0">
            {currentNavigation.map((group, groupIdx) => {
              // Filter out items without permission
              const permittedItems = (group.items || []).filter(item => {
                if (item.permission && !hasPermission(item.permission as any)) return false;
                return true;
              });

              if (permittedItems.length === 0) return null;

              return (
                <div key={`group-${groupIdx}`} className="flex flex-col mb-0 space-y-0">
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
                        className={`group relative flex items-center py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-[#006970] text-white shadow-md shadow-[#006970]/20'
                            : 'text-gray-700 hover:bg-[#006970]/5 hover:text-[#006970] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[#00B4BB]'
                        } ${isCollapsed ? 'justify-center px-0' : 'px-2'}`}
                      >
                        <Icon
                          className={`flex-shrink-0 transition-all duration-200 ${
                            isCollapsed ? 'h-5 w-5 m-0' : '-ml-1 mr-3 h-4 w-4'
                          } ${
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#006970] dark:group-hover:text-[#00B4BB]'
                          }`}
                          aria-hidden="true"
                        />
                        
                        {!isCollapsed && (
                          <span className="truncate transition-opacity duration-300">{item.name}</span>
                        )}

                        {/* Custom Tooltip for Collapsed State */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 w-max px-2.5 py-1.5 bg-gray-900 dark:bg-gray-800 text-white text-xs font-semibold rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 border border-gray-700">
                            {item.name}
                          </div>
                        )}
                      </Link>
                    );
                  })}
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
