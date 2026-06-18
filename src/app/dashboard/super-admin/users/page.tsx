import React from 'react';
import { PendingUsersTable } from '@/features/super-admin/components/PendingUsersTable';

export default function AdminApprovalsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Approvals</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve new SHOP_ADMIN, ADMIN, and ORGANIZATION_ADMIN accounts.
        </p>
      </div>

      <PendingUsersTable />
    </div>
  );
}
