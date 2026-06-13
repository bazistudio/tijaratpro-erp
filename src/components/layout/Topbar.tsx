'use client';

import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { SearchInput } from '../common/SearchInput';
import { QuickActions } from '../common/QuickActions';

interface TopbarProps {
  setMobileMenuOpen: (isOpen: boolean) => void;
}

export const Topbar = ({ setMobileMenuOpen }: TopbarProps) => {
  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <button
        type="button"
        className="border-r border-gray-200 dark:border-gray-800 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#006970] lg:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1">
          <SearchInput placeholder="Search products, customers, invoices..." />
        </div>
        
        <div className="ml-4 flex items-center gap-2 md:gap-4">
          <QuickActions />
          
          <button
            type="button"
            className="relative rounded-full bg-white dark:bg-gray-900 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#006970] focus:ring-offset-2 transition-colors border border-transparent dark:border-gray-700"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
          </button>

          {/* User Profile Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
