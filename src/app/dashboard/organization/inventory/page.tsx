'use client';

import React, { useState, useMemo } from 'react';
import { useProducts } from '@/features/inventory/hooks/useProducts';
import { InventoryProduct, StockStatus } from '@/features/inventory/types';
import { InventoryTable, TableColumn } from '@/components/inventory/InventoryTable';
import { usePermissions } from '@/lib/auth/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { shopApi } from '@/services/shop.api';
import { 
  Package, Search, Filter, Store, AlertTriangle, 
  CheckCircle2, DollarSign, Layers, Loader2, Shield 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function OrganizationInventoryPage() {
  const { hasPermission } = usePermissions();

  const [search, setSearch] = useState('');
  const [selectedShopId, setSelectedShopId] = useState('ALL');

  const { data: shopsRes } = useQuery({
    queryKey: ['shops'],
    queryFn: () => shopApi.getShops()
  });
  const shops = shopsRes?.data || [];

  const { products, isLoading, error } = useProducts({
    page: 1,
    limit: 100,
    search
  });

  // Filter by Shop Location
  const filteredProducts = useMemo(() => {
    if (selectedShopId === 'ALL') return products;
    return products.filter((p: any) => p.shopId === selectedShopId || p.branchId === selectedShopId);
  }, [products, selectedShopId]);

  // Inventory KPI Totals
  const kpis = useMemo(() => {
    let totalVal = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    filteredProducts.forEach((p) => {
      const stock = p.stock || p.quantity || 0;
      const cost = p.purchasePrice || p.costPrice || 0;
      totalVal += stock * cost;

      if (stock === 0) {
        outOfStockCount++;
      } else if (p.status === StockStatus.LOW_STOCK || stock <= (p.minQuantity || 5)) {
        lowStockCount++;
      }
    });

    return {
      totalValue: totalVal,
      totalCount: filteredProducts.length,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount
    };
  }, [filteredProducts]);

  const columns: TableColumn<InventoryProduct>[] = [
    { 
      key: 'name', 
      label: 'Product Name / SKU', 
      render: (row) => (
        <div>
          <div className="font-medium text-text-primary">{row.name}</div>
          {row.sku && <div className="text-xs text-text-muted font-mono">{row.sku}</div>}
        </div>
      )
    },
    { key: 'category', label: 'Category' },
    { 
      key: 'shop', 
      label: 'Shop Location',
      render: (row: any) => {
        const shop = shops.find((s: any) => s._id === row.shopId || s.id === row.shopId);
        return <span className="font-medium text-text-primary">{shop?.name || 'Main Branch'}</span>;
      }
    },
    { 
      key: 'stock', 
      label: 'Stock Qty', 
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${
            row.stock === 0 ? 'bg-red-500' :
            row.status === StockStatus.LOW_STOCK ? 'bg-amber-500' : 'bg-emerald-500'
          }`}></span>
          <span className="font-semibold">{row.stock}</span>
        </div>
      )
    },
    { key: 'purchasePrice', label: 'Unit Cost', render: (row) => `Rs. ${(row.purchasePrice || 0).toLocaleString()}` },
    { key: 'price', label: 'Sale Price', render: (row) => `Rs. ${(row.price || 0).toLocaleString()}` },
    { 
      key: 'totalValue', 
      label: 'Inventory Value', 
      render: (row) => (
        <span className="font-bold text-primary">
          Rs. {((row.stock || 0) * (row.purchasePrice || 0)).toLocaleString()}
        </span>
      )
    },
  ];

  if (!hasPermission(PERMISSIONS.INVENTORY_VIEW) && !hasPermission(PERMISSIONS.PRODUCTS_VIEW)) {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-xl max-w-2xl mx-auto my-12">
        <Shield className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-text-primary">Access Restricted</h2>
        <p className="text-sm text-text-muted mt-2">
          You do not have permission to view organization inventory stock.
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
            <Package className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Organization Inventory Workspace</h1>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Unified multi-branch inventory valuation, stock counts, and reorder tracking.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Total Inventory Value</p>
            <h3 className="text-xl font-bold text-text-primary mt-1">
              Rs. {kpis.totalValue.toLocaleString()}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Total Products</p>
            <h3 className="text-xl font-bold text-text-primary mt-1">
              {kpis.totalCount}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Low Stock Warnings</p>
            <h3 className="text-xl font-bold text-text-primary mt-1">
              {kpis.lowStock}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Out of Stock</p>
            <h3 className="text-xl font-bold text-text-primary mt-1 text-danger">
              {kpis.outOfStock}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-danger/10 text-danger flex items-center justify-center">
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
              placeholder="Search products by name or SKU..."
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
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden p-4">
        {isLoading ? (
          <div className="py-12 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <InventoryTable columns={columns} data={filteredProducts} />
        )}
      </div>
    </div>
  );
}

