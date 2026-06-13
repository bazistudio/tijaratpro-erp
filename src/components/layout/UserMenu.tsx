'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/lib/auth/core/auth.store';

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative ml-3" ref={menuRef}>
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex max-w-xs items-center rounded-full bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#006970] focus:ring-offset-2 dark:focus:ring-offset-gray-900 p-1 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
          id="user-menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className="sr-only">Open user menu</span>
          <div className="h-8 w-8 rounded-full bg-[#006970]/10 flex items-center justify-center text-[#006970] dark:text-[#00B4BB] font-bold">
            SA
          </div>
          <span className="hidden md:block ml-2 mr-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Admin
          </span>
          <ChevronDown className="hidden md:block h-4 w-4 text-gray-400 mr-1" />
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-md py-1 shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-100 dark:border-gray-800 focus:outline-none transform opacity-100 scale-100 transition-all"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
          tabIndex={-1}
        >
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Shop Admin</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">admin@tijaratpro.com</p>
          </div>

          <a
            href="#"
            className="group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            role="menuitem"
            tabIndex={-1}
          >
            <User className="mr-3 h-4 w-4 text-gray-400 group-hover:text-[#006970] dark:group-hover:text-[#00B4BB]" />
            Your Profile
          </a>
          <a
            href="#"
            className="group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            role="menuitem"
            tabIndex={-1}
          >
            <Settings className="mr-3 h-4 w-4 text-gray-400 group-hover:text-[#006970] dark:group-hover:text-[#00B4BB]" />
            Settings
          </a>
          <div className="border-t border-gray-100 dark:border-gray-800 my-1"></div>
          <button
            onClick={() => {
              setIsOpen(false);
              logout();
            }}
            className="w-full text-left group flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            role="menuitem"
            tabIndex={-1}
          >
            <LogOut className="mr-3 h-4 w-4 text-red-500 dark:text-red-400" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
