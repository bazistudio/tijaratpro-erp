import React from 'react';
import { SubscriptionDetailCard } from '../../../../../features/super-admin/subscriptions/components/subscriptions/SubscriptionDetailCard';

export default function SubscriptionDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <nav className="flex text-sm text-gray-500 mb-6">
        <ol className="flex items-center space-x-2">
          <li><a href="/dashboard/super-admin/subscriptions" className="hover:text-gray-900">Subscriptions</a></li>
          <li><span className="mx-2">/</span></li>
          <li><span className="text-gray-900 font-medium">Details</span></li>
        </ol>
      </nav>
      <SubscriptionDetailCard subscriptionId={params.id} />
    </div>
  );
}
