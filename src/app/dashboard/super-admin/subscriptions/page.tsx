'use client';
import React from 'react';
import { useSubscriptionDashboard } from '../../../../../features/super-admin/subscriptions/hooks/useSubscriptions';
import { SubscriptionKPICards } from '../../../../../features/super-admin/subscriptions/components/dashboard/SubscriptionKPICards';
import { PackageDistributionChart, SubscriptionGrowthChart } from '../../../../../features/super-admin/subscriptions/components/dashboard/Charts';
import { ExpiryAlertWidget, RecentActivityFeed } from '../../../../../features/super-admin/subscriptions/components/dashboard/Widgets';

export default function SubscriptionDashboard() {
  const { data, isLoading, isError } = useSubscriptionDashboard();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">Failed to load dashboard.</div>
      </div>
    );
  }

  const stats = data.data;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Subscription Overview</h1>
      </div>

      <SubscriptionKPICards stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SubscriptionGrowthChart data={stats.growth} />
        <PackageDistributionChart data={stats.packageDistribution} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <RecentActivityFeed data={stats.recentActivity} />
        </div>
        <div className="md:col-span-1">
          <ExpiryAlertWidget data={stats.expiringDetails} />
        </div>
      </div>
    </div>
  );
}
