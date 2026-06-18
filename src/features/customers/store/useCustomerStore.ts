import { create } from 'zustand';
import { db, DBCustomer } from '@/lib/db';
import { mockCustomers } from '../../pos/store/posMockData';

interface CustomerStore {
  customers: DBCustomer[];
  isLoading: boolean;
  
  initializeStore: () => Promise<void>;
  updateBalance: (customerId: string, amountChange: number) => Promise<void>;
}

export const useCustomerStore = create<CustomerStore>((set) => ({
  customers: [],
  isLoading: true,

  initializeStore: async () => {
    try {
      const count = await db.customers.count();
      if (count === 0) {
        // Seed Dexie from mock data
        await db.customers.bulkAdd(mockCustomers);
      }
      const allCustomers = await db.customers.toArray();
      set({ customers: allCustomers, isLoading: false });
    } catch (error) {
      console.error("Failed to initialize customer store", error);
      set({ isLoading: false });
    }
  },

  updateBalance: async (customerId: string, amountChange: number) => {
    await db.transaction('rw', db.customers, async () => {
      const customer = await db.customers.get(customerId);
      if (customer) {
        const newBalance = customer.currentBalance + amountChange;
        await db.customers.update(customerId, { currentBalance: newBalance });
      }
    });
    
    // Refresh local state
    const allCustomers = await db.customers.toArray();
    set({ customers: allCustomers });
  }
}));
