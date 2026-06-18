import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ShopProfile } from './posMockData';
import toast from 'react-hot-toast';
import { DBInventory, db } from '@/lib/db';
import { ledgerService } from '../../ledger/services/ledger.service';
import { auditService } from '../../audit/services/audit.service';
import { useInventoryStore } from '../../inventory/store/useInventoryStore';
import { FinancialService } from '../services/financial.service';
import { FinancialMathEngine } from '../services/financialMath.engine';
import { InvoiceDocument } from '../services/document/document.service';

export interface CartItem {
  productId: string;
  sku: string;
  barcode: string;
  productName: string;
  unitPrice: number;
  costPrice: number;
  maxStock: number;
  quantity: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discount: number; // The computed discount amount
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
  invoiceDiscountType: 'percentage' | 'fixed';
  invoiceDiscountValue: number;
  invoiceDiscountAmount: number;
  grandTotal: number;
  
  paymentBreakdown: { method: string; amount: number }[];
  paymentStatus: 'PAID' | 'PARTIAL' | 'DUE';
  totalPaid: number;
  remainingDue: number;
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
  
  invoiceDiscountType: 'percentage' | 'fixed';
  invoiceDiscountValue: number;
  
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
  lastInvoice: InvoiceDocument | null;
  
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
  
  // Discount Engine
  setItemDiscount: (productId: string, discountType: 'percentage' | 'fixed', discountValue: number, isReturn?: boolean) => void;
  setInvoiceDiscount: (discountType: 'percentage' | 'fixed', discountValue: number) => void;

  // Transaction Lifecycle
  completeTransaction: (paymentBreakdown: { method: string; amount: number }[], customer: { id: string; name: string } | null) => Promise<any>;
  setLastInvoice: (invoice: InvoiceDocument | null) => void;

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
  invoiceDiscountType: 'fixed',
  invoiceDiscountValue: 0,
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
              const updatedList = targetList.map(item => {
                if (item.productId === product.id) {
                  const baseTotal = newQty * item.unitPrice;
                  const discountAmount = item.discountType === 'percentage' ? baseTotal * (item.discountValue / 100) : item.discountValue;
                  return { ...item, quantity: newQty, discount: discountAmount, subtotal: baseTotal - discountAmount };
                }
                return item;
              });
              
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
              discountType: 'fixed',
              discountValue: 0,
              discount: 0,
              subtotal: product.salePrice
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
                const baseTotal = quantity * item.unitPrice;
                const discountAmount = item.discountType === 'percentage' ? baseTotal * (item.discountValue / 100) : item.discountValue;
                return { ...item, quantity, discount: discountAmount, subtotal: baseTotal - discountAmount };
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

      setItemDiscount: (productId, discountType, discountValue, isReturn = false) => {
        const { saleTabs, activeTabId } = get();
        set({
          saleTabs: saleTabs.map(tab => {
            if (tab.id !== activeTabId) return tab;

            const targetList = isReturn ? tab.returnedItems : tab.cart;
            const updatedList = targetList.map(item => {
              if (item.productId === productId) {
                const baseTotal = item.quantity * item.unitPrice;
                const discountAmount = discountType === 'percentage' ? baseTotal * (discountValue / 100) : discountValue;
                return { ...item, discountType, discountValue, discount: discountAmount, subtotal: baseTotal - discountAmount };
              }
              return item;
            });

            return isReturn ? { ...tab, returnedItems: updatedList } : { ...tab, cart: updatedList };
          })
        });
      },

      setInvoiceDiscount: (discountType, discountValue) => {
        const { saleTabs, activeTabId } = get();
        set({
          saleTabs: saleTabs.map(tab => {
            if (tab.id !== activeTabId) return tab;
            return { ...tab, invoiceDiscountType: discountType, invoiceDiscountValue: discountValue };
          })
        });
      },

      completeTransaction: async (paymentBreakdown, customer) => {
        const session = get().getActiveSession();
        if (!session) return;

        try {
          const result = await FinancialService.processTransaction({
            session,
            paymentBreakdown,
            customer
          });

          // Ledger System (Double-Entry)
          await ledgerService.processTransaction(result.transaction as any);

          // Inventory flow (Update stock dynamically)
          const { decreaseStock, increaseStock } = useInventoryStore.getState();
          for (const item of result.transaction.items) {
            await decreaseStock(item.productId, item.quantity);
          }
          for (const retItem of result.transaction.returnedItems) {
            await increaseStock(retItem.productId, retItem.quantity);
          }

          // Audit Logging
          await auditService.logAction(
            'transaction', 
            'SALE', 
            session, 
            result.transaction, 
            'system'
          );

          // Update local UI state
          set(state => ({
            transactions: [...state.transactions, result.transaction as any]
          }));
          get().clearCart();
          
          return result;
        } catch (error) {
          console.error("Transaction failed", error);
          toast.error("Payment failed. Nothing was saved.");
          throw error;
        }
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

  // Pure Math Engine Integration (Zero-drift UI alignment)
  const math = FinancialMathEngine.calculateTotals(activeSession as any);

  return { 
    totalItems, 
    totalQuantity, 
    returnItemsCount,
    returnQuantity,
    subtotal: math.subtotal,
    newItemsTotal: math.newItemsTotal, 
    returnTotal: math.returnTotal,
    discountTotal: math.discountTotal, 
    invoiceDiscountAmount: math.invoiceDiscountAmount,
    grandTotal: math.finalAmount 
  };
};
