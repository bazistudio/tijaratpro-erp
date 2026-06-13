// src/features/inventory/store.ts
// Zustand store — ready for offline-first / Electron sync

import { create } from 'zustand';
import { InventoryProduct, InventoryFilterType, InventorySortConfig } from './types';
import { computeStockStatus, enrichProducts } from './utils';

// ─── Mock seed data — replace with API/DB call ──────────────────────────────
const MOCK_PRODUCTS: Omit<InventoryProduct, 'status'>[] = [
  { id: '1', name: 'iPhone 13 Pro', sku: 'APL-IP13P', category: 'Mobile', stock: 3, minStockThreshold: 5, price: 150000, unit: 'pcs' },
  { id: '2', name: 'Samsung Galaxy A54', sku: 'SAM-A54', category: 'Mobile', stock: 0, minStockThreshold: 5, price: 65000, unit: 'pcs' },
  { id: '3', name: 'USB-C Cable 2m', sku: 'ACC-USBC2', category: 'Accessories', stock: 45, minStockThreshold: 10, price: 800, unit: 'pcs' },
  { id: '4', name: 'Screen Protector 6.7"', sku: 'ACC-SP67', category: 'Accessories', stock: 4, minStockThreshold: 10, price: 350, unit: 'pcs' },
  { id: '5', name: 'Wireless Charger 20W', sku: 'ACC-WC20', category: 'Accessories', stock: 12, minStockThreshold: 5, price: 2500, unit: 'pcs' },
  { id: '6', name: 'Redmi Note 12', sku: 'XMI-RN12', category: 'Mobile', stock: 8, minStockThreshold: 5, price: 35000, unit: 'pcs' },
  { id: '7', name: 'Earbuds Pro X', sku: 'AUD-EPX', category: 'Audio', stock: 0, minStockThreshold: 3, price: 5500, unit: 'pcs' },
  { id: '8', name: 'Phone Case – iPhone 14', sku: 'ACC-CSI14', category: 'Accessories', stock: 22, minStockThreshold: 5, price: 450, unit: 'pcs' },
  { id: '9', name: 'Power Bank 20000mAh', sku: 'ACC-PB20K', category: 'Accessories', stock: 2, minStockThreshold: 5, price: 4200, unit: 'pcs' },
  { id: '10', name: 'Bluetooth Speaker', sku: 'AUD-BTS1', category: 'Audio', stock: 17, minStockThreshold: 5, price: 3800, unit: 'pcs' },
];

interface InventoryState {
  products: InventoryProduct[];
  searchTerm: string;
  activeFilter: InventoryFilterType;
  sort: InventorySortConfig;
  isLoading: boolean;

  // actions
  setProducts: (products: Omit<InventoryProduct, 'status'>[]) => void;
  setSearch: (term: string) => void;
  setFilter: (filter: InventoryFilterType) => void;
  setSort: (sort: InventorySortConfig) => void;
  updateStock: (productId: string, newStock: number) => void;
  loadMockData: () => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  products: [],
  searchTerm: '',
  activeFilter: 'all',
  sort: { field: 'name', direction: 'asc' },
  isLoading: false,

  setProducts: (raw) =>
    set({ products: enrichProducts(raw) }),

  setSearch: (term) => set({ searchTerm: term }),

  setFilter: (filter) => set({ activeFilter: filter }),

  setSort: (sort) => set({ sort }),

  updateStock: (productId, newStock) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId
          ? { ...p, stock: newStock, status: computeStockStatus(newStock, p.minStockThreshold) }
          : p
      ),
    })),

  loadMockData: () => {
    set({ isLoading: true });
    // Simulate async fetch delay (replace with real API)
    setTimeout(() => {
      set({ products: enrichProducts(MOCK_PRODUCTS), isLoading: false });
    }, 300);
  },
}));
