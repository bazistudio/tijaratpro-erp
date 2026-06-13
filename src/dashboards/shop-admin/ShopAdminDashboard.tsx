'use client';

import React from 'react';
import { DollarSign, TrendingUp, CreditCard, Receipt } from 'lucide-react';
import { KPIGrid } from '../../components/kpi/KPIGrid';
import { KPIData } from '../../types/dashboard/kpi.types';

// Mock data for initial render
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
          Here's what's happening in your shop today.
        </p>
      </div>

      {/* KPI Section */}
      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">Key Performance Indicators</h2>
        <KPIGrid data={mockKpiData} />
      </section>

      {/* Placeholders for future sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl min-h-[400px] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400">
          {/* Phase 3: InventoryWidget will go here */}
          [Inventory Widget Placeholder]
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl min-h-[400px] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400">
          {/* Phase 4: AlertsPanel will go here */}
          [Alerts Panel Placeholder]
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-2xl min-h-[300px] border border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-400">
        {/* Phase 5: OutstandingBalances will go here */}
        [Outstanding Balances Placeholder]
      </div>
    </div>
  );
};

export default ShopAdminDashboard;
