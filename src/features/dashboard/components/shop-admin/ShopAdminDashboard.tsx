'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, Receipt, Package, RefreshCw } from 'lucide-react';
import { KPIGrid } from '@/components/kpi/KPIGrid';
import { KPIData } from '@/types/dashboard/kpi.types';
import { HourlySalesChart, HourlySalesData } from '../HourlySalesChart';
import { CategorySalesDistribution, CategorySalesData } from '../CategorySalesDistribution';
import { AiRecommendations } from '../AiRecommendations';
import { StockWidget } from '@/features/inventory/stock/StockWidget';
import { DailySalesModal } from './DailySalesModal';

import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/dashboard.api';
import { salesApi } from '@/services/sales.api';
import { useInventoryStore } from '@/features/inventory/core/inventory.store';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTenantQueryKeys } from '@/lib/react-query/useTenantQueryKeys';

export const ShopAdminDashboard = () => {
  const keys = useTenantQueryKeys();
  const [filter, setFilter] = useState<'today' | 'week' | 'month'>('today');
  const [isDailySalesModalOpen, setIsDailySalesModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchInvoice = searchParams.get('invoice');

  // Inventory store for low stock items and categories
  const { products, fetchProducts } = useInventoryStore();

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [fetchProducts, products.length]);

  useEffect(() => {
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

  // 1. Authoritative Metrics Query
  const {
    data: dashboardResponse,
    isLoading: isMetricsLoading,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: keys.dashboard,
    queryFn: () => dashboardApi.getMetrics(),
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // 2. Authoritative Orders Query for Today's Hourly and Category Aggregation
  const todayStartISO = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, []);

  const {
    data: ordersResponse,
    isLoading: isOrdersLoading,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['sales', 'today-orders', todayStartISO],
    queryFn: () => salesApi.getOrders({ startDate: todayStartISO, limit: 500 }),
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const metrics = dashboardResponse?.data;

  // 3. Hourly Sales Aggregation (24 buckets: 00:00 to 23:00)
  const hourlySalesData = useMemo<HourlySalesData[]>(() => {
    const buckets: HourlySalesData[] = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      sales: 0,
      ordersCount: 0,
    }));

    const orders = ordersResponse?.data || [];
    if (!orders || orders.length === 0) return buckets;

    orders.forEach((order: any) => {
      if (order.status === 'cancelled' || order.status === 'void') return;

      const date = order.createdAt ? new Date(order.createdAt) : null;
      if (!date || isNaN(date.getTime())) return;

      const hour = date.getHours();
      if (hour >= 0 && hour < 24) {
        const amount = order.totalAmount ?? order.grandTotal ?? order.total ?? 0;
        buckets[hour].sales += amount;
        buckets[hour].ordersCount += 1;
      }
    });

    return buckets;
  }, [ordersResponse?.data]);

  // 4. Category Sales Distribution Aggregation
  const categorySalesData = useMemo<CategorySalesData[]>(() => {
    const orders = ordersResponse?.data || [];
    if (!orders || orders.length === 0) return [];

    const map = new Map<string, { categoryName: string; salesAmount: number; itemsSold: number }>();
    let totalSales = 0;

    orders.forEach((order: any) => {
      if (order.status === 'cancelled' || order.status === 'void') return;

      (order.items || []).forEach((item: any) => {
        const itemPrice = item.price ?? item.unitPrice ?? 0;
        const itemQty = item.quantity ?? 1;
        const itemTotal = itemPrice * itemQty;

        // Match product category
        const prod = products.find((p) => p.id === (item.productId || item._id));
        const catName = prod?.category || item.category || 'General';

        const existing = map.get(catName) || {
          categoryName: catName,
          salesAmount: 0,
          itemsSold: 0,
        };
        existing.salesAmount += itemTotal;
        existing.itemsSold += itemQty;
        map.set(catName, existing);
        totalSales += itemTotal;
      });
    });

    return Array.from(map.values())
      .map((c) => ({
        ...c,
        percentage: totalSales > 0 ? (c.salesAmount / totalSales) * 100 : 0,
      }))
      .sort((a, b) => b.salesAmount - a.salesAmount);
  }, [ordersResponse?.data, products]);

  // 5. Top Product derivation from today's orders
  const computedTopProduct = useMemo(() => {
    const orders = ordersResponse?.data || [];
    if (!orders || orders.length === 0) return undefined;

    const map = new Map<string, { name: string; quantitySold: number; revenue: number }>();
    orders.forEach((order: any) => {
      if (order.status === 'cancelled' || order.status === 'void') return;

      (order.items || []).forEach((item: any) => {
        const id = item.productId || item.name;
        const name = item.productName || item.name || 'Product';
        const qty = item.quantity || 1;
        const rev = (item.price || item.unitPrice || 0) * qty;

        const existing = map.get(id) || { name, quantitySold: 0, revenue: 0 };
        existing.quantitySold += qty;
        existing.revenue += rev;
        map.set(id, existing);
      });
    });

    const sorted = Array.from(map.values()).sort((a, b) => b.quantitySold - a.quantitySold);
    return sorted[0];
  }, [ordersResponse?.data]);

  // Low stock products from inventory store
  const lowStockItems = useMemo(() => {
    return products
      .filter((p) => (p.stock || 0) <= (p.minStockThreshold || 3))
      .map((p) => ({ name: p.name, stock: p.stock || 0 }));
  }, [products]);

  const getFilterValue = (field: 'revenue' | 'profit', currentFilter: 'today' | 'week' | 'month') => {
    if (!metrics) return 0;
    const key = currentFilter === 'today' ? 'today' : 'thisMonth';
    return metrics.summary[field][key] || 0;
  };

  const kpiData: KPIData[] = [
    {
      title: "Today's Sales",
      value: isMetricsLoading ? 'Loading...' : `${metrics?.summary.orders.today || 0} Sales`,
      trend: 0,
      icon: <Receipt className="h-5 w-5" />,
      format: 'number',
      timeframe: `₨ ${(metrics?.summary.revenue.today || 0).toLocaleString()}`,
      onClick: () => setIsDailySalesModalOpen(true),
    },
    {
      title: 'Net Revenue',
      value: isMetricsLoading ? 'Loading...' : `₨ ${getFilterValue('revenue', filter).toLocaleString()}`,
      trend: 0,
      icon: <DollarSign className="h-5 w-5" />,
      format: 'currency',
    },
    {
      title: 'Net Profit',
      value: isMetricsLoading ? 'Loading...' : `₨ ${getFilterValue('profit', filter).toLocaleString()}`,
      trend: 0,
      icon: <TrendingUp className="h-5 w-5" />,
      format: 'currency',
    },
    {
      title: 'Pending Payments',
      value: isMetricsLoading ? 'Loading...' : `₨ ${(metrics?.summary.customers.pendingPayments || 0).toLocaleString()}`,
      trend: 0,
      icon: <CreditCard className="h-5 w-5" />,
      format: 'currency',
    },
    {
      title: 'Inventory Alert',
      value: isMetricsLoading ? 'Loading...' : `${lowStockItems.length} Low Stock`,
      trend: 0,
      icon: <Package className="h-5 w-5" />,
      format: 'number',
      timeframe: `${products.length} Total SKUs`,
    },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full select-none">
      {/* Top Controls: Filter & Refresh */}
      <section aria-labelledby="kpi-heading" className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 id="kpi-heading" className="text-lg font-bold text-text-primary">
              Overview & Performance
            </h2>
            <p className="text-xs text-text-muted">Real-time sales, profitability, and stock health</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                refetchMetrics();
                refetchOrders();
              }}
              title="Refresh Dashboard"
              className="p-2 rounded-lg bg-surface border border-border text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1.5 border border-border bg-surface rounded-lg text-xs font-bold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring cursor-pointer transition-colors hover:bg-surface-hover shadow-xs"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* 1. KPI Cards Row */}
        <KPIGrid data={kpiData} isLoading={isMetricsLoading} />
      </section>

      {/* 2. Hourly Sales Progression Chart */}
      <section aria-labelledby="hourly-sales-heading">
        <HourlySalesChart
          data={hourlySalesData}
          isLoading={isOrdersLoading}
          onRetry={refetchOrders}
        />
      </section>

      {/* 3. Mid Analytics Grid: Category Distribution & AI Recommendations */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 flex flex-col min-h-0">
          <CategorySalesDistribution
            data={categorySalesData}
            isLoading={isOrdersLoading}
          />
        </div>

        <div className="lg:col-span-6 flex flex-col min-h-0">
          <AiRecommendations
            lowStockCount={lowStockItems.length}
            lowStockItems={lowStockItems}
            topProduct={computedTopProduct}
            pendingPaymentsAmount={metrics?.summary.customers.pendingPayments || 0}
            isLoading={isMetricsLoading || isOrdersLoading}
          />
        </div>
      </section>

      {/* 4. Inventory Brain Section */}
      <section aria-labelledby="inventory-heading">
        <div className="rounded-2xl bg-surface border border-border shadow-card p-5 sm:p-6">
          <StockWidget />
        </div>
      </section>

      {/* Daily Sales Modal */}
      <DailySalesModal
        isOpen={isDailySalesModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ShopAdminDashboard;
