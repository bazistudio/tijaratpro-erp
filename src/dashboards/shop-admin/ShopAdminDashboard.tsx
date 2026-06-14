'use client';

import React from 'react';
import Link from 'next/link';
import { DollarSign, TrendingUp, CreditCard, Receipt, Plus, FileUp, RefreshCw } from 'lucide-react';
import { KPIGrid } from '../../components/kpi/KPIGrid';
import { KPIData } from '../../types/dashboard/kpi.types';
import { InventoryWidget } from '../../components/inventory/InventoryWidget';
import { selectForceSync, selectStatus } from '../../features/inventory/store/inventory.selectors';

const mockKpiData: KPIData[] = [
  {
    title: 'Total Revenue',
    value: '₨ 4,250,000',
    trend: 12.5,
    icon: <DollarSign className="h-5 w-5" />,
    format: 'currency',
  },
  {
    title: 'Net Profit',
    value: '₨ 850,000',
    trend: 8.2,
    icon: <TrendingUp className="h-5 w-5" />,
    format: 'currency',
  },
  {
    title: 'Pending Payments',
    value: '₨ 125,000',
    trend: -2.4,
    icon: <CreditCard className="h-5 w-5" />,
    format: 'currency',
  },
  {
    title: 'Expenses',
    value: '₨ 320,000',
    trend: 4.1,
    icon: <Receipt className="h-5 w-5" />,
    format: 'currency',
  },
];

export const ShopAdminDashboard = () => {
  const forceSync = selectForceSync();
  const inventoryStatus = selectStatus();
  const isSyncing = inventoryStatus === 'loading';

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
        <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
        <KPIGrid data={mockKpiData} />
      </section>

      {/* Inventory Brain */}
      <section aria-labelledby="inventory-heading">
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm p-5 sm:p-6">
          <InventoryWidget />
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
