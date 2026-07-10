import React from 'react';
import { TopStats } from '@/features/super-admin/components/TopStats';
import { OrganizationRequestsTable } from '@/features/super-admin/components/OrganizationRequestsTable';
import { ActiveTenantsTable } from '@/features/super-admin/components/ActiveTenantsTable';

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Monitor your system metrics and pending approvals.
        </p>
      </div>

      <TopStats />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Onboarding Requests</h2>
          <OrganizationRequestsTable />
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Organizations</h2>
          <ActiveTenantsTable />
        </div>
      </div>
    </div>
  );
}