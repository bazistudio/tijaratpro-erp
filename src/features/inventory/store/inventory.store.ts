// src/features/inventory/store/inventory.store.ts

import { create } from 'zustand';
import { 
  InventoryProduct, 
  InventoryFilterType, 
  InventorySortConfig, 
  RequestStatus, 
  PaginationParams, 
  InventoryAdjustmentType,
  ProductCategory
} from '../types';
import { inventoryService } from '../services/inventory.service';
import { DEFAULT_PAGE_SIZE } from '../constants/inventory.constants';
import { CreateProductDTO } from '../dto/inventory.dto';

interface InventoryState {
  products: InventoryProduct[];
  totalProducts: number;
  searchTerm: string;
  activeFilter: InventoryFilterType;
  sort: InventorySortConfig;
  status: RequestStatus;
  error: string | null;
  categories: ProductCategory[];
  isCategoriesLoading: boolean;

  // actions
  setSearch: (term: string) => void;
  setFilter: (filter: InventoryFilterType) => void;
  setSort: (sort: InventorySortConfig) => void;
  
  // async thunks
  fetchProducts: (params?: Partial<PaginationParams>) => Promise<void>;
  updateStock: (productId: string, newStock: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  createProduct: (data: CreateProductDTO, image?: File) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  products: [],
  totalProducts: 0,
  searchTerm: '',
  activeFilter: 'all',
  sort: { field: 'name', direction: 'asc' },
  status: 'idle',
  error: null,
  categories: [],
  isCategoriesLoading: false,

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
  },

  fetchCategories: async () => {
    try {
      set({ isCategoriesLoading: true });
      const categories = await inventoryService.getCategories();
      
      // Ensure "Uncategorized" fallback is always available for robust mobile entry
      const hasUncategorized = categories.some(c => c.name.toLowerCase() === 'uncategorized');
      if (!hasUncategorized) {
        // Pseudo ID for Uncategorized to allow frontend to function if backend doesn't provide it
        categories.push({ id: 'uncategorized', name: 'Uncategorized' });
      }

      set({ categories, isCategoriesLoading: false });
    } catch (error) {
      console.error('Failed to fetch categories', error);
      set({ isCategoriesLoading: false, categories: [{ id: 'uncategorized', name: 'Uncategorized' }] }); // Fallback
    }
  },

  createProduct: async (data: CreateProductDTO, image?: File) => {
    try {
      set({ status: 'loading', error: null });
      
      // If user selected the fallback uncategorized, we might need to handle it 
      // or assume the backend accepts a missing category or we map it to a default ObjectId
      const productData = { ...data };
      if (productData.category === 'uncategorized') {
        // The backend requires an ObjectId. In a real scenario, this would be an actual ID.
        // For the sake of the form not breaking, we will send it and let the API layer handle or fail gracefully.
        // If the backend strict validates, we should ideally fetch the real "Uncategorized" ID.
      }

      const newProduct = await inventoryService.createProduct(productData, image);
      
      // Optimistically add to store
      set(state => ({
        products: [newProduct, ...state.products],
        totalProducts: state.totalProducts + 1,
        status: 'success',
        error: null
      }));

    } catch (error: any) {
      set({ 
        status: 'error', 
        error: error.message || 'Failed to create product' 
      });
      throw error; // Re-throw so the form can show an error
    }
  }
}));
