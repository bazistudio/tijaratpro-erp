import React from 'react';
import { ActiveTenantsTable } from '@/features/super-admin/components/ActiveTenantsTable';

export default function OrganizationsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div>
        <nav className="flex text-sm text-gray-500 mb-4">
          <ol className="flex items-center space-x-2">
            <li><a href="/dashboard/super-admin" className="hover:text-gray-900">Dashboard</a></li>
            <li><span className="mx-2">/</span></li>
            <li><span className="text-gray-900 font-medium">Organizations</span></li>
          </ol>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">All Organizations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all active organizations in the system.
        </p>
      </div>

      <ActiveTenantsTable filterAccountType="ORGANIZATION" />
    </div>
  );
}
