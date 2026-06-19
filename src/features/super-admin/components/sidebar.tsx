'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Settings, 
  CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', href: '/dashboard/super-admin', icon: LayoutDashboard },
  { name: 'Tenant Approvals', href: '/dashboard/super-admin/tenants', icon: Building2 },
  { name: 'Shop Admin Approvals', href: '/dashboard/super-admin/users', icon: Users },
  { name: 'Organization Approvals', href: '/dashboard/super-admin/orgs', icon: Users },
  { name: 'Active Tenants', href: '/dashboard/super-admin/active-tenants', icon: CheckCircle2 },
  { name: 'Settings', href: '/dashboard/super-admin/settings', icon: Settings },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col h-full min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">Super Admin</h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon 
                className={clsx(
                  'mr-3 h-5 w-5',
                  isActive ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                )} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
