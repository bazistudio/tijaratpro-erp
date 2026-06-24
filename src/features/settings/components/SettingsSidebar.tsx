'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Users, Shield, Palette, Printer, Database } from 'lucide-react';

const navItems = [
  { name: 'General', href: '/dashboard/shop-admin/settings', icon: Settings },
  { name: 'Workforce', href: '/dashboard/shop-admin/settings/users', icon: Users },
  { name: 'Roles & Access', href: '/dashboard/shop-admin/settings/roles', icon: Shield },
  { name: 'Appearance', href: '/dashboard/shop-admin/settings/appearance', icon: Palette },
  { name: 'Printer', href: '/dashboard/shop-admin/settings/printer', icon: Printer },
  { name: 'Backup & Restore', href: '/dashboard/shop-admin/settings/backup', icon: Database },
];

export const SettingsSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 flex-shrink-0">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' 
                  : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-500' : 'text-neutral-400'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
