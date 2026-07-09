import React from 'react';
import { TopStats } from '@/features/super-admin/components/TopStats';
import SuperAdminRequestsPage from './requests/page';

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

      <div className="space-y-6">
        <SuperAdminRequestsPage />
      </div>
    </div>
  );
}