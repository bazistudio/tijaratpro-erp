import React from 'react';
import { Sidebar } from '@/features/super-admin/components/sidebar';
import { Topbar } from '@/features/super-admin/components/topbar';
import { SuperAdminGuard } from '@/features/super-admin/components/SuperAdminGuard';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SuperAdminGuard>
      <div className="flex h-screen bg-gray-50 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SuperAdminGuard>
  );
}
