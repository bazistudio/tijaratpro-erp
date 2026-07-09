import React from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2, Clock, CreditCard, AlertCircle } from 'lucide-react';

interface Props {
  stats: any;
}

export const SubscriptionKPICards: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      
      {/* Organizations */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Total Organizations</h3>
          <Building2 className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">{stats.totalOrganizations}</span>
        </div>
      </div>

      {/* Active Subscriptions */}
      <div className="bg-white rounded-lg shadow p-5 border-t-4 border-green-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Active Subscriptions</h3>
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">{stats.activeSubscriptions}</span>
          <span className="text-xs text-gray-500">
            {stats.totalOrganizations > 0 ? Math.round((stats.activeSubscriptions / stats.totalOrganizations) * 100) : 0}% active
          </span>
        </div>
      </div>

      {/* Expiring Soon */}
      <div className="bg-white rounded-lg shadow p-5 border-t-4 border-yellow-400">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Expiring Soon</h3>
          <Clock className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">{stats.expiringSoon}</span>
          <span className="text-xs text-gray-500">Next 7 Days</span>
        </div>
      </div>

      {/* MRR */}
      <div className="bg-white rounded-lg shadow p-5 border-t-4 ">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Monthly Revenue</h3>
          <CreditCard className="h-5 w-5 text-blue-500" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">
            {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(stats.revenue)}
          </span>
        </div>
      </div>

      {/* Pending Payments */}
      <Link href="/dashboard/super-admin/subscriptions/payments" className="bg-white rounded-lg shadow p-5 border-t-4  hover:bg-gray-50 transition block cursor-pointer">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">Pending Payments</h3>
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</span>
          <span className="text-xs text-red-600 font-medium">Need Review →</span>
        </div>
      </Link>

    </div>
  );
};
