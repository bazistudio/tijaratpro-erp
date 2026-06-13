// src/features/inventory/types.ts

export type StockStatus = 'HEALTHY' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export type InventoryFilterType = 'all' | 'low_stock' | 'out_of_stock';

export type SortField = 'name' | 'stock' | 'category' | 'price';
export type SortDirection = 'asc' | 'desc';

export interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStockThreshold: number;
  price: number;
  unit?: string;
  status: StockStatus; // auto-computed
}

export interface InventoryStats {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  healthyCount: number;
  healthPercentage: number;
}

export interface InventorySortConfig {
  field: SortField;
  direction: SortDirection;
}
