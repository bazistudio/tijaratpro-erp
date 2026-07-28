'use client';

import React from 'react';
import { useAuthStore } from '@/lib/auth/core/auth.store';
import { LogOut, Search, Bell } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui';

function getInitials(name?: string | null) {
  if (!name) return 'SA';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const Header = () => {
  const { user, logoutAsync } = useAuthStore();

  return (
    <header className="sticky top-0 z-[var(--z-fixed)] bg-surface/90 backdrop-blur-md border-b border-border h-12 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-colors">
      {/* Global Search */}
      <div className="flex items-center flex-1 gap-4">
        <div className="relative max-w-sm w-full hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-muted" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-12 py-1.5 border border-border rounded-lg bg-surface-hover text-sm text-text-primary placeholder-text-muted focus:outline-none focus:bg-surface focus:ring-2 focus:ring-focus-ring transition-all"
            placeholder="Search organizations, shops… (Ctrl+K)"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-text-muted text-[10px] border border-border rounded px-1.5 py-0.5 bg-surface font-mono">
              ⌘K
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <Link
          href="/dashboard/super-admin/activation"
          className="relative p-2 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          aria-label="View activation center"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-danger ring-2 ring-surface" />
        </Link>

        <div className="w-px h-5 bg-border" />

        {/* User info */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-semibold text-text-primary leading-tight">
            {(user as any)?.name || 'Super Admin'}
          </span>
          <span className="text-xs text-text-muted leading-tight">
            {(user as any)?.email || 'admin@tijaratpro.com'}
          </span>
        </div>

        {/* Role badge + avatar */}
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="sm">
            {(user as any)?.role || 'SUPER_ADMIN'}
          </Badge>
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-xs select-none">
            {getInitials((user as any)?.name)}
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={() => logoutAsync()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-text-secondary border border-border rounded-lg hover:bg-surface-hover hover:text-danger transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden lg:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
