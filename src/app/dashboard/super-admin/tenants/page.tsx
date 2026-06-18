import React from 'react';
import { PendingTenantsTable } from '@/features/super-admin/components/PendingTenantsTable';

export default function PendingTenantsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Tenants</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve new business registrations to grant them platform access.
        </p>
      </div>

      <PendingTenantsTable />
    </div>
  );
}
