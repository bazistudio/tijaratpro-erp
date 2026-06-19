'use client';

import React from 'react';
import { useAuthStore } from '@/lib/auth/core/auth.store';
import { LogOut, User } from 'lucide-react';

export const Header = () => {
  const { user, logoutAsync } = useAuthStore();

  const handleLogout = async () => {
    await logoutAsync();
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <div className="flex items-center flex-1">
        {/* Mobile menu button could go here */}
      </div>
      <div className="flex items-center gap-6">
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
          <div className="border-l border-gray-200 h-6 mx-2"></div>
          <button
            onClick={handleLogout}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
