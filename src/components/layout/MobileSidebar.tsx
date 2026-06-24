'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { shopAdminNavigation } from '../../constants/navigation/shop-admin-navigation';
import { usePermissions } from '../../lib/auth/usePermissions';

interface MobileSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const MobileSidebar = ({ isOpen, setIsOpen }: MobileSidebarProps) => {
  const pathname = usePathname();
  const { hasPermission } = usePermissions();

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

          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <span className="text-xl font-bold text-[#006970] dark:text-[#00B4BB]">TijaratPro</span>
            </div>
            
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {shopAdminNavigation.flatMap(group => group.items).map((item) => {
                      if (item.permission && !hasPermission(item.permission)) return null;

                      const isActive =
                        item.href === '/dashboard/shop-admin'
                          ? pathname === item.href
                          : pathname.startsWith(item.href);
                      const Icon = item.icon;

                      return (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`group flex items-center px-2 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                              isActive
                                ? 'bg-[#006970]/10 text-[#006970] dark:bg-[#006970]/20 dark:text-[#00B4BB]'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                            }`}
                          >
                            <Icon
                              className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                                isActive ? 'text-[#006970] dark:text-[#00B4BB]' : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                              }`}
                              aria-hidden="true"
                            />
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
