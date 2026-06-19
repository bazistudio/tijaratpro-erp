import React from 'react';
import { SuspendedTenantsTable } from '@/features/super-admin/components/SuspendedTenantsTable';

export default function SuspendedTenantsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Suspended Tenants</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage tenants whose access has been temporarily blocked.
        </p>
      </div>

      <SuspendedTenantsTable />
    </div>
  );
}
