// src/features/inventory/utils.ts

import { InventoryProduct, InventoryStats, StockStatus } from './types';

/**
 * Automatically compute stock status from stock level and threshold.
 */
export function computeStockStatus(stock: number, minStockThreshold: number): StockStatus {
  if (stock === 0) return 'OUT_OF_STOCK';
  if (stock <= minStockThreshold) return 'LOW_STOCK';
  return 'HEALTHY';
}

/**
 * Enrich raw product data with computed status.
 */
export function enrichProducts(products: Omit<InventoryProduct, 'status'>[]): InventoryProduct[] {
  return products.map((p) => ({
    ...p,
    status: computeStockStatus(p.stock, p.minStockThreshold),
  }));
}

/**
 * Compute overall inventory stats from a product list.
 */
export function computeInventoryStats(products: InventoryProduct[]): InventoryStats {
  const total = products.length;
  const outOfStock = products.filter((p) => p.status === 'OUT_OF_STOCK').length;
  const lowStock = products.filter((p) => p.status === 'LOW_STOCK').length;
  const healthy = products.filter((p) => p.status === 'HEALTHY').length;

  return {
    totalProducts: total,
    lowStockCount: lowStock,
    outOfStockCount: outOfStock,
    healthyCount: healthy,
    healthPercentage: total > 0 ? Math.round((healthy / total) * 100) : 0,
  };
}

/**
 * Filter products by search term (name or SKU).
 */
export function filterBySearch(products: InventoryProduct[], term: string): InventoryProduct[] {
  if (!term.trim()) return products;
  const lower = term.toLowerCase();
  return products.filter(
    (p) => p.name.toLowerCase().includes(lower) || p.sku.toLowerCase().includes(lower)
  );
}
