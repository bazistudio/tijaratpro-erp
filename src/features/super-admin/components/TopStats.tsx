'use client';

import React from 'react';
import { Building2, Store, AlertCircle, CheckCircle, Clock, DollarSign, Users, CalendarX } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { useDashboardStats } from '../hooks/useDashboardStats';

export const TopStats = () => {
  const { data: stats, isLoading, isError } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        Failed to load dashboard statistics
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Total Organizations"
        value={stats.organizations.total}
        icon={Building2}
      />
      <StatsCard
        title="Total Shops"
        value={stats.shops.total}
        icon={Store}
      />
      <StatsCard
        title="Pending Requests"
        value={stats.requests.pending}
        icon={AlertCircle}
      />
      <StatsCard
        title="Active Subscriptions"
        value={stats.subscriptions.active}
        icon={CheckCircle}
      />
      <StatsCard
        title="Trial Accounts"
        value={stats.subscriptions.trial}
        icon={Clock}
      />
      
      {stats.revenue.monthly > 0 && (
        <StatsCard
          title="Monthly Revenue"
          value={`$${stats.revenue.monthly.toLocaleString()}`}
          icon={DollarSign}
        />
      )}
      
      <StatsCard
        title="Expired Subscriptions"
        value={stats.subscriptions.expired}
        icon={CalendarX}
      />
      <StatsCard
        title="Active Users"
        value={stats.users.active}
        icon={Users}
      />
    </div>
  );
};
