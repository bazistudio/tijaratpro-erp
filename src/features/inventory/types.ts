// src/features/inventory/types.ts

export enum StockStatus {
  HEALTHY = 'HEALTHY',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK'
}

export type RequestStatus = 'idle' | 'loading' | 'success' | 'error';

export type InventoryFilterType = 'all' | 'low_stock' | 'out_of_stock';

export type SortField = 'name' | 'stock' | 'category' | 'price';
export type SortDirection = 'asc' | 'desc';

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  category?: string;
}

export enum InventoryAdjustmentType {
  INCREASE = 'INCREASE',
  DECREASE = 'DECREASE',
  DAMAGE = 'DAMAGE',
  RETURN = 'RETURN'
}

export interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStockThreshold: number;
  price: number;
  unit?: string;
  status: StockStatus;
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
