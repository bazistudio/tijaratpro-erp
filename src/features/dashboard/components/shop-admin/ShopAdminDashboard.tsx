'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DollarSign, TrendingUp, CreditCard, Receipt, Plus } from 'lucide-react';
import { KPIGrid } from '@/components/kpi/KPIGrid';
import { KPIData } from '@/types/dashboard/kpi.types';
import { StockWidget } from '@/features/inventory/stock/StockWidget';
import { DailySalesModal } from './DailySalesModal';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard.api';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export const ShopAdminDashboard = () => {
  const [filter, setFilter] = useState<'today' | 'week' | 'month'>('today');
  const [isDailySalesModalOpen, setIsDailySalesModalOpen] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchInvoice = searchParams.get('invoice');

  React.useEffect(() => {
    if (searchInvoice) {
      setIsDailySalesModalOpen(true);
    }
  }, [searchInvoice]);

  const handleCloseModal = () => {
    setIsDailySalesModalOpen(false);
    if (searchInvoice) {
      router.replace(pathname, { scroll: false });
    }
  };
  
  const { data: dashboardResponse, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => dashboardApi.getMetrics(),
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const metrics = dashboardResponse?.data;

  const getFilterValue = (field: 'revenue' | 'profit', currentFilter: 'today' | 'week' | 'month') => {
    if (!metrics) return 0;
    // Backend returns today, thisMonth, total
    const key = currentFilter === 'today' ? 'today' : 'thisMonth';
    return metrics.summary[field][key] || 0;
  };

  const kpiData: KPIData[] = [
    {
      title: "Today's Sales",
      value: isLoading ? 'Loading...' : `${metrics?.summary.orders.today || 0} Sales`,
      trend: 0,
      icon: <Receipt className="h-5 w-5" />,
      format: 'number',
      timeframe: `₨ ${(metrics?.summary.revenue.today || 0).toLocaleString()}`,
      onClick: () => setIsDailySalesModalOpen(true),
    },
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




      {/* KPI Section */}
      <section aria-labelledby="kpi-heading">
        <div className="flex justify-end items-center mb-4">
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

      <DailySalesModal 
        isOpen={isDailySalesModalOpen} 
        onClose={handleCloseModal} 
      />
    </div>
  );
};

export default ShopAdminDashboard;
