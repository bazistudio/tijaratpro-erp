'use client';

import React from 'react';
import { Building2, Building, AlertCircle, Users } from 'lucide-react';
import { StatsCard } from './StatsCard';
import { useDashboardStats } from '../hooks/useDashboardStats';

export const TopStats = () => {
  const { data: stats, isLoading, isError } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 h-28 animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
        Failed to load dashboard statistics.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Total Tenants"
        value={stats.totalTenants}
        icon={Building2}
      />
      <StatsCard
        title="Active Tenants"
        value={stats.activeTenants}
        icon={Building}
      />
      <StatsCard
        title="Pending Tenants"
        value={stats.pendingTenants}
        icon={AlertCircle}
      />
      <StatsCard
        title="Pending Admin Approvals"
        value={stats.pendingAdminApprovals}
        icon={Users}
      />
    </div>
  );
};
