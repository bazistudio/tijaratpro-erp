'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { shopAdminNavigation } from '../../constants/navigation/shop-admin-navigation';
import { organizationNavigation } from '../../constants/navigation/organization-navigation';
import { validateRoute } from '../../lib/navigation/route-validator';
import { usePermissions } from '../../lib/auth/usePermissions';
import { useOrganizationStore } from '../../store/useOrganizationStore';

export const Sidebar = () => {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  const { viewMode } = useOrganizationStore();
  
  const currentNavigation = viewMode === 'organization' ? organizationNavigation : shopAdminNavigation;

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 flex-shrink-0 z-20 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <div className="flex-1 flex flex-col min-h-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
        <div className="flex items-center h-12 flex-shrink-0 px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="text-lg font-bold text-[#006970] dark:text-[#008990] flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-[#006970] text-white flex items-center justify-center font-black">T</span>
            TijaratPro
          </div>
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden pt-0 pb-2">
          <nav className="mt-1 flex-1 px-2 space-y-0">
            {currentNavigation.flatMap(group => group.items).map((item) => {
              // ENFORCE PERMISSIONS
              if (item.permission && !hasPermission(item.permission)) return null;

              validateRoute(item.href, item.name);
              const isActive =
                item.href === '/dashboard/shop-admin'
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#006970]/10 text-[#006970] dark:bg-[#006970]/20 dark:text-[#00B4BB]'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon
                    className={`flex-shrink-0 -ml-1 mr-3 h-4 w-4 transition-colors duration-200 ${
                      isActive ? 'text-[#006970] dark:text-[#00B4BB]' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
      </div>
    </div>
  );
};

export default Sidebar;
