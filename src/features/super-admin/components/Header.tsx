'use client';

import React from 'react';
import { useAuthStore } from '@/lib/auth/core/auth.store';
import { LogOut, User, Search, Bell } from 'lucide-react';
import Link from 'next/link';

export const Header = () => {
  const { user, logoutAsync } = useAuthStore();

  const handleLogout = async () => {
    await logoutAsync();
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center flex-1 gap-6">
        {/* Global Search Stub */}
        <div className="relative max-w-md w-full hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            placeholder="Search organizations, shops, users... (Ctrl+K)"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-white">⌘K</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {/* Activation Center Stub */}
        <Link href="/dashboard/super-admin/activation" className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-colors">
          <span className="sr-only">View activation center</span>
          <Bell className="h-6 w-6" />
          <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
        </Link>
        
        <div className="border-l border-gray-200 h-6"></div>

        <div className="flex flex-col items-end hidden sm:flex">
          <span className="text-sm font-semibold text-gray-900">{user?.name || 'Super Admin'}</span>
          <span className="text-xs text-gray-500">{user?.email || 'admin@tijaratpro.com'}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {user?.role || 'SUPER_ADMIN'}
          </span>
          <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-sm">
            {user?.name?.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-red-600 transition-colors ml-2"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
