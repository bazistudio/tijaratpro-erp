'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { shopAdminNavigation } from '../../constants/navigation/shop-admin-navigation';
import { validateRoute } from '../../lib/navigation/route-validator';

interface MobileSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const MobileSidebar = ({ isOpen, setIsOpen }: MobileSidebarProps) => {
  const pathname = usePathname();
  
  // Future: const shop = useAuthStore();
  const shop = { name: 'Shop Admin', branchName: 'Main Branch' };

  if (!isOpen) return null;

  return (
    <div className="relative z-40 lg:hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-0 flex">
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white dark:bg-gray-900 pt-5 pb-4">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setIsOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-shrink-0 items-center px-4">
            <div className="text-xl font-bold text-[#006970] dark:text-[#008990] flex items-center gap-2">
              <span className="w-8 h-8 rounded bg-[#006970] text-white flex items-center justify-center font-black">T</span>
              TijaratPro
            </div>
          </div>
          
          <div className="mt-0 h-0 flex-1 overflow-hidden">
            <nav className="px-2 space-y-0">
              {shopAdminNavigation.flatMap(group => group.items).map((item) => {
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
                );
              })}
            </nav>
          </div>
          
        </div>
        
        <div className="w-14 flex-shrink-0" aria-hidden="true">
          {/* Dummy element to force sidebar to shrink to fit close icon */}
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
