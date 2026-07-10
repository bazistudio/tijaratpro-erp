import React from 'react';
import { OrganizationRequestsTable } from '@/features/super-admin/components/OrganizationRequestsTable';

export default function OrganizationRequestsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Organization Requests</h1>
      <OrganizationRequestsTable />
    </div>
  );
}
