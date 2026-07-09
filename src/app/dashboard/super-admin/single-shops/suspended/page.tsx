import React from 'react';
import { SuspendedTenantsTable } from '@/features/super-admin/components/SuspendedTenantsTable';

export default function SuspendedSingleShopsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div>
        <nav className="flex text-sm text-gray-500 mb-4">
          <ol className="flex items-center space-x-2">
            <li><a href="/dashboard/super-admin" className="hover:text-gray-900">Dashboard</a></li>
            <li><span className="mx-2">/</span></li>
            <li><span className="text-gray-900 font-medium">Single Shops</span></li>
            <li><span className="mx-2">/</span></li>
            <li><span className="text-gray-900 font-medium">Suspended</span></li>
          </ol>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Suspended Single Shops</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all suspended single shops in the system.
        </p>
      </div>

      <SuspendedTenantsTable filterAccountType="SINGLE_SHOP" />
    </div>
  );
}
