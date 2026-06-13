// src/features/inventory/store/inventory.store.ts

import { create } from 'zustand';
import { 
  InventoryProduct, 
  InventoryFilterType, 
  InventorySortConfig, 
  RequestStatus, 
  PaginationParams, 
  InventoryAdjustmentType 
} from '../types';
import { inventoryService } from '../services/inventory.service';
import { DEFAULT_PAGE_SIZE } from '../constants/inventory.constants';

interface InventoryState {
  products: InventoryProduct[];
  totalProducts: number;
  searchTerm: string;
  activeFilter: InventoryFilterType;
  sort: InventorySortConfig;
  status: RequestStatus;
  error: string | null;

  // actions
  setSearch: (term: string) => void;
  setFilter: (filter: InventoryFilterType) => void;
  setSort: (sort: InventorySortConfig) => void;
  
  // async thunks
  fetchProducts: (params?: Partial<PaginationParams>) => Promise<void>;
  updateStock: (productId: string, newStock: number) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  totalProducts: 0,
  searchTerm: '',
  activeFilter: 'all',
  sort: { field: 'name', direction: 'asc' },
  status: 'idle',
  error: null,

  setSearch: (term) => set({ searchTerm: term }),

  setFilter: (filter) => set({ activeFilter: filter }),

  setSort: (sort) => set({ sort }),

  fetchProducts: async (params) => {
    console.log("[DEBUG] FETCH PRODUCTS CALLED");
    try {
      set({ status: 'loading', error: null });
      
      const requestParams: PaginationParams = {
        page: params?.page || 1,
        limit: params?.limit || DEFAULT_PAGE_SIZE,
        search: params?.search || get().searchTerm,
      };
      
      const { products, total } = await inventoryService.getProducts(requestParams);
      
      set({ 
        products, 
        totalProducts: total,
        status: 'success',
        error: null
      });
    } catch (error: any) {
      set({ 
        status: 'error', 
        error: error.message || 'Failed to fetch inventory data' 
      });
    }
  },

  updateStock: async (productId, newStock) => {
    try {
      const currentProducts = get().products;
      const product = currentProducts.find(p => p.id === productId);
      if (!product) return;
      
      const oldStock = product.stock;
      if (oldStock === newStock) return;
      
      const type = newStock > oldStock ? InventoryAdjustmentType.INCREASE : InventoryAdjustmentType.DECREASE;
      const diff = Math.abs(newStock - oldStock);
      
      // Optimistic UI Update
      const updatedStatus = inventoryService.calculateStockStatus(newStock, product.minStockThreshold);
      set({
        products: currentProducts.map(p => 
          p.id === productId ? { ...p, stock: newStock, status: updatedStatus } : p
        )
      });
      
      // Execute Real Backend Request
      await inventoryService.adjustStock(productId, diff, type, 'Manual dashboard adjustment');
      
    } catch (error: any) {
      // Revert optimism by re-fetching (or manually reversing)
      get().fetchProducts();
      set({ error: error.message || 'Failed to sync stock update' });
    }
  }
}));
