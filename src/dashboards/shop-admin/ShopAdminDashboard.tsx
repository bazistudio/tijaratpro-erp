'use client';

import React from 'react';
import { DollarSign, TrendingUp, CreditCard, Receipt } from 'lucide-react';
import { KPIGrid } from '../../components/kpi/KPIGrid';
import { KPIData } from '../../types/dashboard/kpi.types';
import { InventoryWidget } from '../../components/inventory/InventoryWidget';

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
