'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { shopAdminNavigation } from '../../constants/navigation/shop-admin-navigation';
import { validateRoute } from '../../lib/navigation/route-validator';

export const Sidebar = () => {
  const pathname = usePathname();
  
  // Future: const shop = useAuthStore();
  const shop = { name: 'Shop Admin', branchName: 'Main Branch' };

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-20 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <div className="flex-1 flex flex-col min-h-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
        <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="text-xl font-bold text-[#006970] dark:text-[#008990] flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-[#006970] text-white flex items-center justify-center font-black">T</span>
            TijaratPro
          </div>
        </div>
        
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pt-5 pb-4">
          <nav className="mt-2 flex-1 px-3 space-y-4">
            {shopAdminNavigation.map((group, idx) => (
              <div key={idx}>
                {group.label && (
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 dark:text-gray-400">
                    {group.label}
                  </h3>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
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
                        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-[#006970]/10 text-[#006970] dark:bg-[#006970]/20 dark:text-[#00B4BB]'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon
                          className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 transition-colors duration-200 ${
                            isActive ? 'text-[#006970] dark:text-[#00B4BB]' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
        
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="w-full flex items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="h-8 w-8 rounded-full bg-[#006970]/20 flex items-center justify-center text-[#006970] dark:text-[#00B4BB] font-bold">
              SA
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{shop.name}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 text-ellipsis overflow-hidden">{shop.branchName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
