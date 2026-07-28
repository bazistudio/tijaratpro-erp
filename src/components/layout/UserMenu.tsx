'use client';

import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/lib/auth/core/auth.store';

export const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const logoutAsync = useAuthStore((s) => s.logoutAsync);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
          className="flex max-w-xs items-center rounded-full bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 p-1 transition-colors hover:bg-surface-hover border border-border"
          id="user-menu-button"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <span className="sr-only">Open user menu</span>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            SA
          </div>
          <span className="hidden md:block ml-2 mr-1 text-sm font-medium text-text-secondary">
            Admin
          </span>
          <ChevronDown className="hidden md:block h-4 w-4 text-text-muted mr-1" />
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute right-0 z-[var(--z-dropdown)] mt-2 w-48 origin-top-right rounded-md bg-surface/90 backdrop-blur-md py-1 shadow-dropdown border border-border focus:outline-none transform opacity-100 scale-100 transition-all duration-fast"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-menu-button"
          tabIndex={-1}
        >
          <div className="px-4 py-2 border-b border-border">
            <p className="text-sm font-medium text-text-primary">Shop Admin</p>
            <p className="text-xs text-text-muted truncate">admin@tijaratpro.com</p>
          </div>

          <a
            href="#"
            className="group flex items-center px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover transition-colors"
            role="menuitem"
            tabIndex={-1}
          >
            <User className="mr-3 h-4 w-4 text-text-muted group-hover:text-primary" />
            Your Profile
          </a>
          <a
            href="#"
            className="group flex items-center px-4 py-2 text-sm text-text-secondary hover:bg-surface-hover transition-colors"
            role="menuitem"
            tabIndex={-1}
          >
            <Settings className="mr-3 h-4 w-4 text-text-muted group-hover:text-primary" />
            Settings
          </a>
          <div className="border-t border-border my-1"></div>
          <button
            onClick={async () => {
              if (isLoggingOut) return;
              setIsOpen(false);
              setIsLoggingOut(true);
              await logoutAsync();
            }}
            className="w-full text-left group flex items-center px-4 py-2 text-sm text-danger hover:bg-surface-hover transition-colors"
            role="menuitem"
            tabIndex={-1}
          >
            <LogOut className="mr-3 h-4 w-4 text-danger" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
