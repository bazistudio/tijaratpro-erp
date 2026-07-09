import React from 'react';
import { ReportsOverview } from '../../../../../features/super-admin/subscriptions/components/reports/ReportsOverview';

export default function SubscriptionReportsPage() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Reports</h1>
      </div>
      <ReportsOverview />
    </div>
  );
}
