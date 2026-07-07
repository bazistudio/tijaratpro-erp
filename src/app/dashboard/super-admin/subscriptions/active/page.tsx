import React from 'react';
import { SubscriptionsTable } from '../../../../../features/super-admin/subscriptions/components/subscriptions/SubscriptionsTable';

export default function ActiveSubscriptionsPage() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <SubscriptionsTable />
    </div>
  );
}
