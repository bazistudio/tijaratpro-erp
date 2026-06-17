import { create } from 'zustand';
import { db, DBInventory } from '@/lib/db';
import { mockProducts } from '../../pos/store/posMockData';

interface InventoryStore {
  products: DBInventory[];
  isLoading: boolean;
  
  initializeStore: () => Promise<void>;
  decreaseStock: (productId: string, qty: number) => Promise<void>;
  increaseStock: (productId: string, qty: number) => Promise<void>;
  adjustStock: (productId: string, qty: number) => Promise<void>;
  reserveStock: (productId: string, qty: number) => Promise<void>;
  releaseReservedStock: (productId: string, qty: number) => Promise<void>;
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  products: [],
  isLoading: true,

  initializeStore: async () => {
    try {
      const count = await db.inventory.count();
      if (count === 0) {
        // Seed Dexie from mock data
        const seedData = mockProducts.map(p => ({
          ...p,
          lastUpdated: Date.now()
        }));
        await db.inventory.bulkAdd(seedData);
      }
      const allProducts = await db.inventory.toArray();
      set({ products: allProducts, isLoading: false });
    } catch (error) {
      console.error("Failed to initialize inventory store", error);
      set({ isLoading: false });
    }
  },

  decreaseStock: async (productId: string, qty: number) => {
    await db.transaction('rw', db.inventory, async () => {
      const product = await db.inventory.get(productId);
      if (product) {
        const newStock = Math.max(0, product.stock - qty);
        await db.inventory.update(productId, { stock: newStock, lastUpdated: Date.now() });
      }
    });
    // Refresh local state
    const allProducts = await db.inventory.toArray();
    set({ products: allProducts });
  },

  increaseStock: async (productId: string, qty: number) => {
    await db.transaction('rw', db.inventory, async () => {
      const product = await db.inventory.get(productId);
      if (product) {
        await db.inventory.update(productId, { stock: product.stock + qty, lastUpdated: Date.now() });
      }
    });
    const allProducts = await db.inventory.toArray();
    set({ products: allProducts });
  },

  adjustStock: async (productId: string, qty: number) => {
    await db.transaction('rw', db.inventory, async () => {
      const product = await db.inventory.get(productId);
      if (product) {
        await db.inventory.update(productId, { stock: qty, lastUpdated: Date.now() });
      }
    });
    const allProducts = await db.inventory.toArray();
    set({ products: allProducts });
  },

  reserveStock: async (productId: string, qty: number) => {
    await db.transaction('rw', db.inventory, async () => {
      const product = await db.inventory.get(productId);
      if (product) {
        await db.inventory.update(productId, { reservedStock: product.reservedStock + qty, lastUpdated: Date.now() });
      }
    });
    const allProducts = await db.inventory.toArray();
    set({ products: allProducts });
  },

  releaseReservedStock: async (productId: string, qty: number) => {
    await db.transaction('rw', db.inventory, async () => {
      const product = await db.inventory.get(productId);
      if (product) {
        const newReserved = Math.max(0, product.reservedStock - qty);
        await db.inventory.update(productId, { reservedStock: newReserved, lastUpdated: Date.now() });
      }
    });
    const allProducts = await db.inventory.toArray();
    set({ products: allProducts });
  }
}));
