'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DollarSign, TrendingUp, CreditCard, Receipt, Plus, FileUp, RefreshCw } from 'lucide-react';
import { KPIGrid } from '@/components/kpi/KPIGrid';
import { KPIData } from '@/types/dashboard/kpi.types';
import { StockWidget } from '@/features/inventory/stock/StockWidget';
import { selectForceSync, selectStatus } from '@/features/inventory/core/inventory.selectors';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard.api';

export const ShopAdminDashboard = () => {
  const [filter, setFilter] = useState<'today' | 'week' | 'month'>('today');
  
  const { data: dashboardResponse, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => dashboardApi.getMetrics(),
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const metrics = dashboardResponse?.data;
  const forceSync = selectForceSync();
  const inventoryStatus = selectStatus();
  const isSyncing = inventoryStatus === 'loading';

  const getFilterValue = (field: 'revenue' | 'profit', currentFilter: 'today' | 'week' | 'month') => {
    if (!metrics) return 0;
    // Backend returns today, thisMonth, total
    const key = currentFilter === 'today' ? 'today' : 'thisMonth';
    return metrics.summary[field][key] || 0;
  };

  const kpiData: KPIData[] = [
    {
      title: 'Net Revenue',
      value: isLoading ? 'Loading...' : `₨ ${(getFilterValue('revenue', filter)).toLocaleString()}`,
      trend: 0,
      icon: <DollarSign className="h-5 w-5" />,
      format: 'currency',
    },
    {
      title: 'Net Profit',
      value: isLoading ? 'Loading...' : `₨ ${(getFilterValue('profit', filter)).toLocaleString()}`,
      trend: 0,
      icon: <TrendingUp className="h-5 w-5" />,
      format: 'currency',
    },
    {
      title: 'Pending Payments',
      value: isLoading ? 'Loading...' : `₨ ${(metrics?.summary.customers.pendingPayments || 0).toLocaleString()}`,
      trend: 0,
      icon: <CreditCard className="h-5 w-5" />,
      format: 'currency',
    },
    {
      title: 'Total Refunds',
      value: isLoading ? 'Loading...' : `₨ ${(metrics?.summary.customers.totalRefunds || 0).toLocaleString()}`,
      trend: 0,
      icon: <Receipt className="h-5 w-5" />,
      format: 'currency',
    },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here&apos;s what&apos;s happening in your shop today.
        </p>
      </div>

      {/* Quick Actions */}
      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="sr-only">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/shop-admin/products/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#006970] hover:bg-[#005a60] text-white text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
          <Link
            href="/dashboard/shop-admin/products/import"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
          >
            <FileUp className="h-4 w-4" />
            Import from PDF
          </Link>
          <button
            onClick={() => forceSync()}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Inventory
          </button>
        </div>
      </section>

      {/* KPI Section */}
      <section aria-labelledby="kpi-heading">
        <div className="flex justify-between items-center mb-4">
          <h2 id="kpi-heading" className="text-lg font-bold text-gray-900 dark:text-white">Key Performance Indicators</h2>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg text-sm font-medium"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        <KPIGrid data={kpiData} />
      </section>

      {/* Inventory Brain */}
      <section aria-labelledby="inventory-heading">
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 sm:p-6">
          <StockWidget />
        </div>
      </section>

      {/* Placeholders for Phase 4 + 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl min-h-[280px] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 text-sm">
          {/* Phase 4: AlertsPanel */}
          [Alerts Panel — Phase 4]
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl min-h-[280px] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400 text-sm">
          {/* Phase 5: OutstandingBalances */}
          [Outstanding Balances — Phase 5]
        </div>
      </div>
    </div>
  );
};

export default ShopAdminDashboard;
