'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
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

  const currentNavigation = pathname.startsWith('/dashboard/organization') ? organizationNavigation : shopAdminNavigation;

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
            <div className="flex h-12 shrink-0 items-center px-6 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <span className="text-lg font-bold text-[#006970] dark:text-[#00B4BB]">TijaratPro</span>
            </div>
            
            <nav className="mt-1 flex flex-1 flex-col pt-0 px-2">
              <div className="space-y-0">
                {currentNavigation.map((group, groupIdx) => {
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
                            onClick={() => setIsOpen(false)}
                            className={`group flex items-center px-2 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                              isActive
                                ? 'bg-[#006970] text-white shadow-md shadow-[#006970]/20'
                                : 'text-gray-700 hover:bg-[#006970]/5 hover:text-[#006970] dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-[#00B4BB]'
                            }`}
                          >
                            <Icon
                              className={`flex-shrink-0 -ml-1 mr-3 h-4 w-4 transition-colors duration-200 ${
                                isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#006970] dark:group-hover:text-[#00B4BB]'
                              }`}
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        );
                      })}
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
