import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ShopProfile } from './posMockData';
import toast from 'react-hot-toast';
import { Invoice } from '../services/invoice.service';
import { DBInventory, db } from '@/lib/db';
import { ledgerService } from '../../ledger/services/ledger.service';
import { auditService } from '../../audit/services/audit.service';
import { generateSHA256 } from '@/lib/hash';
import { useInventoryStore } from '../../inventory/store/useInventoryStore';

export interface CartItem {
  productId: string;
  sku: string;
  barcode: string;
  productName: string;
  unitPrice: number;
  costPrice: number;
  maxStock: number;
  quantity: number;
  discount: number;
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'card' | 'bank' | 'easypaisa' | 'jazzcash' | 'credit';

export interface Transaction {
  transactionId: string;
  transactionType: 'sale' | 'replace_exchange' | 'return_only';
  status: 'pending' | 'completed' | 'void' | 'refunded' | 'locked';
  
  items: CartItem[]; // New items (for sales/exchanges)
  returnedItems: CartItem[]; // Returned items (for returns/exchanges)
  
  subtotal: number;
  discountTotal: number;
  grandTotal: number;
  
  paymentMethod: PaymentMethod;
  cashReceived: number;
  changeReturned: number;
  
  customer: {
    id: string;
    name: string;
  } | null;
  
  createdAt: number;

  // Locking Mechanics
  lockedAt?: number;
  hash?: string;
  version?: number;
  previousHash?: string;
}

export interface SaleSession {
  id: string;
  name: string;
  status: 'draft' | 'processing' | 'completed';
  mode: 'sale' | 'replace';
  transactionType: 'sale' | 'replace_exchange' | 'return_only';
  customer: {
    id: string;
    name: string;
  } | null;
  
  cart: CartItem[];
  returnedItems: CartItem[];
  
  isScanMode: boolean;
  transactionId: string;
  createdAt: number;
  updatedAt: number;
}

interface PosStore {
  activeTabId: string;
  saleTabs: SaleSession[];
  isWholesaleMode: boolean;
  transactions: Transaction[];
  lastInvoice: Invoice | null;
  
  // Tab Management Actions
  createSaleTab: () => void;
  closeSaleTab: (id: string) => void;
  switchSaleTab: (id: string) => void;
  clearAllSessions: () => void;
  
  // Settings
  setWholesaleMode: (isWholesale: boolean) => void;

  // Cart Actions (operates on active tab)
  setSessionMode: (mode: 'sale' | 'replace') => void;
  addToCart: (product: DBInventory, isReturn?: boolean) => void;
  updateQuantity: (productId: string, quantity: number, isReturn?: boolean) => void;
  removeFromCart: (productId: string, isReturn?: boolean) => void;
  clearCart: () => void;

  // Transaction Lifecycle
  completeTransaction: (transaction: Transaction, invoice: Invoice) => Promise<void>;
  setLastInvoice: (invoice: Invoice | null) => void;

  // Selectors
  getActiveSession: () => SaleSession | undefined;
}

const createDefaultSession = (id: string, name: string): SaleSession => ({
  id,
  name,
  status: 'draft',
  mode: 'sale',
  transactionType: 'sale',
  cart: [],
  returnedItems: [],
  customer: {
    id: 'walk-in',
    name: 'Walk-In Customer'
  },
  isScanMode: false,
  transactionId: `TXN-${Date.now()}`,
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const usePosStore = create<PosStore>()(
  persist(
    (set, get) => ({
      activeTabId: 'sale-1',
      saleTabs: [createDefaultSession('sale-1', 'Sale #1')],
      isWholesaleMode: false,
      transactions: [],
      lastInvoice: null,
      
      createSaleTab: () => {
        const { saleTabs } = get();
        if (saleTabs.length >= 3) {
          toast.error("Maximum 3 tabs allowed");
          return;
        }
        
        const usedNumbers = saleTabs.map(t => parseInt(t.name.replace('Sale #', ''), 10));
        let nextNum = 1;
        while (usedNumbers.includes(nextNum)) {
          nextNum++;
        }
        
        const newId = `sale-${Date.now()}`;
        const newTab = createDefaultSession(newId, `Sale #${nextNum}`);
        
        set({
          saleTabs: [...saleTabs, newTab],
          activeTabId: newId,
        });
      },
      
      closeSaleTab: (id) => {
        const { saleTabs, activeTabId } = get();
        
        const tabToClose = saleTabs.find(t => t.id === id);
        if (tabToClose?.status === 'processing') {
          toast.error("Cannot close a tab that is currently processing.");
          return;
        }

        if (saleTabs.length <= 1) return; 
        
        const newTabs = saleTabs.filter(t => t.id !== id);
        let newActiveId = activeTabId;
        
        if (activeTabId === id) {
          newActiveId = newTabs[newTabs.length - 1].id;
        }
        
        set({
          saleTabs: newTabs,
          activeTabId: newActiveId,
        });
      },
      
      switchSaleTab: (id) => {
        set({ activeTabId: id });
      },

      clearAllSessions: () => {
        const resetId = `sale-${Date.now()}`;
        set({
          saleTabs: [createDefaultSession(resetId, 'Sale #1')],
          activeTabId: resetId,
        });
      },

      setWholesaleMode: (isWholesale) => {
        set({ isWholesaleMode: isWholesale });
      },

      setSessionMode: (mode) => {
        const { saleTabs, activeTabId } = get();
        set({
          saleTabs: saleTabs.map(tab => {
            if (tab.id !== activeTabId) return tab;
            return {
              ...tab,
              mode,
              transactionType: mode === 'replace' ? 'replace_exchange' : 'sale'
            };
          })
        });
      },

      // -- Cart Logic --
      getActiveSession: () => {
        const { saleTabs, activeTabId } = get();
        return saleTabs.find(t => t.id === activeTabId);
      },

      addToCart: (product: DBInventory, isReturn = false) => {
        const { saleTabs, activeTabId } = get();
        
        set({
          saleTabs: saleTabs.map(tab => {
            if (tab.id !== activeTabId) return tab;

            const targetList = isReturn ? tab.returnedItems : tab.cart;
            const existingItem = targetList.find(item => item.productId === product.id);
            
            if (existingItem) {
              const newQty = existingItem.quantity + 1;
              if (!isReturn && newQty > existingItem.maxStock) {
                toast.error(`Only ${existingItem.maxStock} items in stock for ${existingItem.productName}`);
                return tab;
              }
              
              toast.success(`Increased ${existingItem.productName} quantity`);
              const updatedList = targetList.map(item => 
                item.productId === product.id 
                  ? { ...item, quantity: newQty, subtotal: newQty * item.unitPrice } 
                  : item
              );
              
              return isReturn ? { ...tab, returnedItems: updatedList } : { ...tab, cart: updatedList };
            }

            if (!isReturn && product.stock < 1) {
              toast.error(`${product.name} is out of stock`);
              return tab;
            }

            toast.success(`Added ${product.name} to ${isReturn ? 'returns' : 'cart'}`);
            const newItem: CartItem = {
              productId: product.id,
              sku: product.sku,
              barcode: product.barcode,
              productName: product.name,
              unitPrice: product.salePrice,
              costPrice: product.costPrice,
              maxStock: product.stock, // Original stock limit, for returns we usually don't care about max stock limits strictly during entry
              quantity: 1,
              discount: 0,
              subtotal: product.price
            };
            
            return isReturn 
              ? { ...tab, returnedItems: [...tab.returnedItems, newItem] }
              : { ...tab, cart: [...tab.cart, newItem] };
          })
        });
      },

      updateQuantity: (productId: string, quantity: number, isReturn = false) => {
        const { saleTabs, activeTabId } = get();
        
        if (quantity < 1) return;

        set({
          saleTabs: saleTabs.map(tab => {
            if (tab.id !== activeTabId) return tab;

            const targetList = isReturn ? tab.returnedItems : tab.cart;
            const updatedList = targetList.map(item => {
              if (item.productId === productId) {
                if (!isReturn && quantity > item.maxStock) {
                  toast.error(`Only ${item.maxStock} items in stock`);
                  return item;
                }
                return { ...item, quantity, subtotal: quantity * item.unitPrice };
              }
              return item;
            });
            
            return isReturn ? { ...tab, returnedItems: updatedList } : { ...tab, cart: updatedList };
          })
        });
      },

      removeFromCart: (productId: string, isReturn = false) => {
        const { saleTabs, activeTabId } = get();
        set({
          saleTabs: saleTabs.map(tab => {
            if (tab.id !== activeTabId) return tab;
            if (isReturn) {
              return { ...tab, returnedItems: tab.returnedItems.filter(item => item.productId !== productId) };
            }
            return { ...tab, cart: tab.cart.filter(item => item.productId !== productId) };
          })
        });
      },

      clearCart: () => {
        const { saleTabs, activeTabId } = get();
        set({
          saleTabs: saleTabs.map(tab => {
            if (tab.id !== activeTabId) return tab;
            return { 
              ...tab, 
              cart: [], 
              returnedItems: [],
              mode: 'sale',
              transactionType: 'sale',
              transactionId: `TXN-${Date.now()}` // Reset TXN id for next sale
            };
          })
        });
      },

      completeTransaction: async (transaction: Transaction, invoice: Invoice) => {
        const { transactions } = get();
        if (transactions.some(t => t.transactionId === transaction.transactionId)) {
          console.warn(`Transaction ${transaction.transactionId} already exists. Skipping duplicate save.`);
          return;
        }

        // 1. Transaction Locking (Tamper-proof hash)
        const lockedAt = Date.now();
        const hashPayload = { ...transaction, lockedAt };
        const hash = await generateSHA256(hashPayload);
        
        const lockedTransaction: Transaction = {
          ...transaction,
          status: 'locked',
          lockedAt,
          version: 1,
          hash
        };

        // 2. Persist to Dexie (DBTransaction maps exactly to our lockedTransaction structure)
        await db.transactions.add(lockedTransaction as any);

        // 3. Ledger System (Double-Entry)
        await ledgerService.processTransaction(lockedTransaction as any);

        // 4. Inventory flow (Update stock dynamically)
        const { decreaseStock, increaseStock } = useInventoryStore.getState();
        for (const item of lockedTransaction.items) {
          await decreaseStock(item.productId, item.quantity);
        }
        for (const retItem of lockedTransaction.returnedItems) {
          await increaseStock(retItem.productId, retItem.quantity);
        }

        // 5. Audit Logging
        await auditService.logAction(
          'transaction', 
          'SALE', 
          transaction, 
          lockedTransaction, 
          'system'
        );

        // 6. Update local UI state
        set({
          transactions: [...transactions, lockedTransaction],
          lastInvoice: invoice
        });
        get().clearCart();
      },

      setLastInvoice: (invoice) => set({ lastInvoice: invoice })
    }),
    {
      name: 'tijaratpro-pos',
      partialize: (state) => ({
        isWholesaleMode: state.isWholesaleMode,
        // Ideally we only persist offline transactions or handle them with IndexedDB
        // We'll leave it out of localstorage for now, to keep it light.
      }),
    }
  )
);

// Derived state helpers (computed values)
export const useCartTotals = () => {
  const activeSession = usePosStore(state => state.getActiveSession());
  const cart = activeSession?.cart || [];
  const returnedItems = activeSession?.returnedItems || [];
  
  const totalItems = cart.length; 
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  
  const returnItemsCount = returnedItems.length;
  const returnQuantity = returnedItems.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const discountTotal = cart.reduce((acc, item) => acc + item.discount, 0);
  const newItemsTotal = subtotal - discountTotal;

  const returnTotal = returnedItems.reduce((acc, item) => acc + item.subtotal, 0);
  
  // Grand total represents the DIFFERENCE that the customer must pay (or be refunded)
  const grandTotal = newItemsTotal - returnTotal;

  return { 
    totalItems, 
    totalQuantity, 
    returnItemsCount,
    returnQuantity,
    subtotal,
    newItemsTotal, 
    returnTotal,
    discountTotal, 
    grandTotal 
  };
};
