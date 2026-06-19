import React from 'react';
import { ActiveTenantsTable } from '@/features/super-admin/components/ActiveTenantsTable';

export default function ActiveTenantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Active Tenants</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage all actively subscribed tenants in the system.
        </p>
      </div>

      <ActiveTenantsTable />
    </div>
  );
}
