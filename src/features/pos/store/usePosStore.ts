import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';
import { DBInventory } from '@/types/db.types';
import { salesApi } from '@/services/sales.api';
import { useInventoryStore } from '@/features/inventory/core/inventory.store';
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
  
  // Global Discount Action
  setInvoiceDiscount: (discountType: 'percentage' | 'fixed', discountValue: number) => void;

  // Transaction Lifecycle
  completeTransaction: (paymentBreakdown: { method: string; amount: number }[], customer: { id: string; name: string } | null) => Promise<any>;
  setLastInvoice: (invoice: InvoiceDocument | null) => void;

  // Status Message
  lastActionMessage: string | null;
  setLastActionMessage: (msg: string | null) => void;

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
      saleTabs: [
        createDefaultSession('sale-1', 'Sale #1'),
        createDefaultSession('sale-2', 'Sale #2'),
        createDefaultSession('sale-3', 'Sale #3')
      ],
      isWholesaleMode: false,
      transactions: [],
      lastInvoice: null,
      lastActionMessage: null,
      
      setLastActionMessage: (msg) => set({ lastActionMessage: msg }),

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
        set({
          saleTabs: [
            createDefaultSession('sale-1', 'Sale #1'),
            createDefaultSession('sale-2', 'Sale #2'),
            createDefaultSession('sale-3', 'Sale #3')
          ],
          activeTabId: 'sale-1',
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
              get().setLastActionMessage(`Increased ${existingItem.productName} quantity to ${newQty}`);
              const updatedList = targetList.map(item => {
                if (item.productId === product.id) {
                  return { ...item, quantity: newQty };
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
            get().setLastActionMessage(`Added ${product.name} to cart`);
            const newItem: CartItem = {
              productId: product.id,
              sku: product.sku,
              barcode: product.barcode,
              productName: product.name,
              unitPrice: product.salePrice,
              costPrice: product.costPrice,
              maxStock: product.stock,
              quantity: 1
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
                return { ...item, quantity };
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
          const payload = {
            items: session.cart.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.unitPrice
            })),
            customerId: customer?.id === 'walk-in' ? undefined : customer?.id,
            paymentMethod: paymentBreakdown[0]?.method?.toLowerCase() || 'cash',
            taxRate: 0,
            discount: session.invoiceDiscountValue || 0,
          };

          let result;
          const isDesktop = typeof window !== 'undefined' && (window as any).electron;

          try {
            // ALWAYS prioritize the cloud API to ensure stock is reduced and sale is created centrally
            result = await salesApi.createOrder(payload);
          } catch (apiError: any) {
            console.warn("Cloud API failed, checking for offline fallback...", apiError);
            
            if (isDesktop) {
              console.log("Using Electron SQLite Offline Fallback");
              // Calculate grandTotal for offline storage since it's not on the session object
              const subtotal = session.cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
              let discountAmt = 0;
              if (session.invoiceDiscountType === 'percentage') {
                discountAmt = subtotal * ((session.invoiceDiscountValue || 0) / 100);
              } else {
                discountAmt = session.invoiceDiscountValue || 0;
              }
              const offlineGrandTotal = subtotal - discountAmt;

              const saleId = `SALE-${Date.now()}`;
              const sqlitePayload = {
                id: saleId,
                customerId: payload.customerId || 'walk-in',
                total: offlineGrandTotal,
                status: 'completed',
                items: JSON.stringify(payload.items),
                paymentMethod: payload.paymentMethod,
                discount: payload.discount,
              };
              
              const mutateResult = await (window as any).electron.db.mutate('orders', 'CREATE', sqlitePayload);
              if (mutateResult.success) {
                result = { success: true, order: { ...sqlitePayload, _id: saleId } };
              } else {
                throw new Error("Failed to save to local offline queue. Order lost.");
              }
            } else {
              // If not desktop, we can't fall back. Throw the original API error.
              throw apiError;
            }
          }

          if (!result.success) {
            throw new Error(result.message || 'Transaction failed');
          }

          // Update local UI state
          set(state => ({
            transactions: [...state.transactions, result.order as any]
          }));
          get().clearCart();
          
          // Re-fetch inventory globally so the POS search reflects the newly reduced stock instantly
          try {
            useInventoryStore.getState().forceSync();
          } catch(e) {
            console.error("Failed to sync inventory after sale", e);
          }

          return result;
        } catch (error: any) {
          console.error("Transaction failed", error);
          toast.error(error.message || "Payment failed. Nothing was saved.");
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
