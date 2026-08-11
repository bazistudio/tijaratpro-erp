'use client';

import React, { useState, useMemo } from 'react';
import { useProducts } from '@/features/inventory/hooks/useProducts';
import { StockStatus } from '@/features/inventory/types';
import { usePermissions } from '@/lib/auth/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { shopApi } from '@/services/shop.api';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { 
  BellAlertIcon, AlertTriangle, XCircle, Search, Filter, 
  Store, RefreshCw, Loader2, Shield, ArrowRight, PackageCheck 
} from 'lucide-react';

export default function OrganizationAlertsPage() {
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const [search, setSearch] = useState('');
  const [selectedShopId, setSelectedShopId] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');

  const { data: shopsRes } = useQuery({
    queryKey: ['shops'],
    queryFn: () => shopApi.getShops()
  });
  const shops = shopsRes?.data || [];

  const { products, isLoading, refetch } = useProducts({
    page: 1,
    limit: 150,
    search
  });

  // Filter low stock and out of stock items
  const alertProducts = useMemo(() => {
    return products.filter((p: any) => {
      const stock = p.stock || p.quantity || 0;
      const minThreshold = p.minQuantity || p.lowStockThreshold || 5;

      const isLowOrOut = stock <= minThreshold || p.status === StockStatus.LOW_STOCK || p.status === StockStatus.OUT_OF_STOCK;

      if (!isLowOrOut) return false;

      // Shop filter
      const matchesShop = selectedShopId === 'ALL' || p.shopId === selectedShopId || p.branchId === selectedShopId;

      // Severity filter
      const matchesSeverity = 
        severityFilter === 'ALL' ||
        (severityFilter === 'CRITICAL' && stock === 0) ||
        (severityFilter === 'WARNING' && stock > 0 && stock <= minThreshold);

      return matchesShop && matchesSeverity;
    });
  }, [products, selectedShopId, severityFilter]);

  // Alert Metrics
  const metrics = useMemo(() => {
    let outOfStockCount = 0;
    let lowStockCount = 0;

    products.forEach((p: any) => {
      const stock = p.stock || p.quantity || 0;
      const minThreshold = p.minQuantity || p.lowStockThreshold || 5;

      if (stock === 0) {
        outOfStockCount++;
      } else if (stock <= minThreshold || p.status === StockStatus.LOW_STOCK) {
        lowStockCount++;
      }
    });

    return {
      outOfStock: outOfStockCount,
      lowStock: lowStockCount,
      totalAlerts: outOfStockCount + lowStockCount
    };
  }, [products]);

  if (!hasPermission(PERMISSIONS.INVENTORY_VIEW)) {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-xl max-w-2xl mx-auto my-12">
        <Shield className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-text-primary">Access Restricted</h2>
        <p className="text-sm text-text-muted mt-2">
          You do not have permission to view inventory stock alerts.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 bg-background min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Low Stock & Reorder Alerts</h1>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Real-time alert center for items reaching critical reorder levels across all branches.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-text-primary hover:bg-surface-hover shadow-xs transition-all"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Alerts
        </button>
      </div>

      {/* Alert Severity KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Total Active Alerts</p>
            <h3 className="text-2xl font-bold text-text-primary mt-1">
              {metrics.totalAlerts}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Critical (Out of Stock)</p>
            <h3 className="text-2xl font-bold text-danger mt-1">
              {metrics.outOfStock}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-danger/10 text-danger flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Low Stock (Near Threshold)</p>
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {metrics.lowStock}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
            <input
              type="text"
              placeholder="Search alert items by product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-text-muted" />
            <select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Branch Locations</option>
              {shops.map((shop: any) => (
                <option key={shop._id || shop.id} value={shop._id || shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical (Out of Stock)</option>
              <option value="WARNING">Warning (Low Stock)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : alertProducts.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <PackageCheck className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-80" />
            <p className="font-semibold text-text-primary text-base">All stock levels are healthy!</p>
            <p className="text-sm mt-1">No low-stock or out-of-stock items require attention at this time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-text-muted text-xs uppercase font-semibold">
                  <th className="p-4">Product Name / SKU</th>
                  <th className="p-4">Shop Location</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-center">Current Qty</th>
                  <th className="p-4 text-center">Min Threshold</th>
                  <th className="p-4 text-center">Severity</th>
                  <th className="p-4 text-center">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {alertProducts.map((product: any, idx) => {
                  const stock = product.stock || product.quantity || 0;
                  const minThreshold = product.minQuantity || product.lowStockThreshold || 5;
                  const isOut = stock === 0;
                  const shopName = shops.find((s: any) => s._id === product.shopId || s.id === product.shopId)?.name || 'Main Branch';

                  return (
                    <tr key={product._id || idx} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-text-primary">{product.name}</div>
                        {product.sku && <div className="text-xs text-text-muted font-mono">{product.sku}</div>}
                      </td>
                      <td className="p-4 font-medium text-text-primary">{shopName}</td>
                      <td className="p-4 text-text-muted">{product.category || 'General'}</td>
                      <td className="p-4 text-center font-bold text-base">{stock}</td>
                      <td className="p-4 text-center text-text-muted">{minThreshold}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                          isOut 
                            ? 'bg-danger/10 text-danger border border-danger/20' 
                            : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}>
                          {isOut ? 'Critical (0 Units)' : 'Low Stock'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => router.push('/dashboard/organization/transfers')}
                          className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          Transfer / Restock <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

