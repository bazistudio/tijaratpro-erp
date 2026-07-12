'use client';

import React, { useEffect, useState } from 'react';
import { Trash2, Banknote, Printer, UserCircle2, Repeat } from 'lucide-react';
import { usePosStore, PaymentMethod, Transaction } from '../store/usePosStore';
import { DocumentService } from '../services/document/document.service';
import toast from 'react-hot-toast';
import { CreditCustomerModal } from './modals/CreditCustomerModal';
import { LedgerSettlementModal } from './modals/LedgerSettlementModal';
import { PaymentModal } from './modals/PaymentModal';
import { DBCustomer } from '@/types/db.types';
import { CustomerSelector } from './CustomerSelector';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { customerApi } from '@/services/customer.api';
import { CreditLimitWarningModal } from './modals/CreditLimitWarningModal';
import { usePrintStore } from '@/lib/printer';
import { usePrinterStore } from '@/features/settings/printer/store/printer.store';
import { printFormatter } from '@/features/settings/printer/utils/printFormatter';
import { GlobalLoadingOverlay } from '@/components/ui/GlobalLoadingOverlay';

export const CartSummary = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const clearCart = usePosStore(state => state.clearCart);
  const activeSession = usePosStore(state => state.getActiveSession());
  const setSessionMode = usePosStore(state => state.setSessionMode);
  const setInvoiceDiscount = usePosStore(state => state.setInvoiceDiscount);
  const completeTransaction = usePosStore(state => state.completeTransaction);
  const removeFromCart = usePosStore(state => state.removeFromCart);

  const { openPreview } = usePrintStore();
  const { settings, shopHeader, fetchSettings } = usePrinterStore();

  useEffect(() => {
    if (!settings || !shopHeader) {
      fetchSettings();
    }
  }, [settings, shopHeader, fetchSettings]);

  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
  const [isLedgerModalOpen, setLedgerModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"sale" | "print" | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<DBCustomer | null>(null);
  const [pendingTransaction, setPendingTransaction] = useState<{
    paymentBreakdown: {method: string, amount: number}[];
    customerObj: {id: string, name: string} | null;
    shouldPrint: boolean;
    projectedBalance: number;
  } | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Editable Total Due States
  const [isEditingTotal, setIsEditingTotal] = useState(false);
  const [editedTotal, setEditedTotal] = useState('');

  const searchParams = useSearchParams();
  const preSelectedCustomerId = searchParams.get('customerId');

  useEffect(() => {
    if (preSelectedCustomerId) {
      customerApi.getCustomerDetail(preSelectedCustomerId)
        .then(res => {
          if (res.data?.customer) {
            setSelectedCustomer({
              ...res.data.customer,
              currentBalance: res.data.stats?.outstanding || 0
            });
          }
        })
        .catch(err => console.error("Failed to load preselected customer", err));
    }
  }, [preSelectedCustomerId]);

  // Sync session customer (from invoice load) into local selectedCustomer state
  useEffect(() => {
    const sessionId = activeSession?.customer?.id;
    if (sessionId && sessionId !== 'walk-in') {
      if (!selectedCustomer || selectedCustomer.id !== sessionId) {
        customerApi.getCustomerDetail(sessionId)
          .then(res => {
            if (res.data?.customer) {
              setSelectedCustomer({
                ...res.data.customer,
                currentBalance: res.data.stats?.outstanding || 0
              });
            }
          })
          .catch(err => console.error("Failed to sync session customer", err));
      }
    } else if (sessionId === 'walk-in' || !sessionId) {
      if (selectedCustomer) {
        setSelectedCustomer(null);
      }
    }
  }, [activeSession?.customer?.id]); // Intentionally omitting selectedCustomer to avoid loops

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Delete : Clear Cart
      if (e.ctrlKey && e.key === 'Delete') {
        e.preventDefault();
        handleClearCart();
      }
      // Ctrl + S : Cash Sale
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleCashSale();
      }
      // Ctrl + P : Pay & Print
      if (e.ctrlKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePayAndPrint();
      }
      // Ctrl + L : Credit Cart / Ledger (Fallbacks to Sale)
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        handleCashSale();
      }
      // F2 : Customer Search
      if (e.key === 'F2') {
        e.preventDefault();
        setCustomerModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeSession?.cart?.length, activeSession?.returnedItems?.length]);

  if (!activeSession) return null;

  const cart = activeSession.cart ?? [];
  const returnedItems = activeSession.returnedItems ?? [];
  const isCartEmpty = cart.length === 0 && returnedItems.length === 0;

  // Local render-time calculations (display previews only, not mutating business state)
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const returnTotal = returnedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  
  const preDiscountTotal = subtotal - returnTotal;
  let invoiceDiscountAmount = 0;
  if (activeSession.invoiceDiscountType === 'percentage') {
    invoiceDiscountAmount = Math.max(0, preDiscountTotal) * ((activeSession.invoiceDiscountValue || 0) / 100);
  } else {
    invoiceDiscountAmount = activeSession.invoiceDiscountValue || 0;
  }
  const grandTotal = preDiscountTotal - invoiceDiscountAmount;

  const handleClearCart = () => {
    if (isCartEmpty) return;
    if (window.confirm("Are you sure you want to clear the current sale tab?")) {
      clearCart();
      toast.success("Cart cleared");
    }
  };

  const handleCashSale = () => {
    if (isCartEmpty) {
      toast.error("Cart is empty");
      return;
    }

    if (selectedCustomer) {
      setPendingAction("sale");
      setLedgerModalOpen(true);
      return;
    }

    processTransaction([{ method: 'cash', amount: grandTotal > 0 ? grandTotal : 0 }], null, false);
  };

  const handlePayAndPrint = () => {
    if (isCartEmpty) {
      toast.error("Cart is empty");
      return;
    }
    
    if (selectedCustomer) {
      setPendingAction("print");
      setLedgerModalOpen(true);
      return;
    }

    processTransaction([{ method: 'cash', amount: grandTotal > 0 ? grandTotal : 0 }], null, true);
  };

  const handleLedgerSuccess = (receivedAmount: number) => {
    setLedgerModalOpen(false);
    const payments = receivedAmount > 0 ? [{ method: 'cash', amount: receivedAmount }] : [];
    processTransaction(
      payments, 
      { id: selectedCustomer!.id, name: selectedCustomer!.name }, 
      pendingAction === 'print'
    );
  };

  const processTransaction = async (paymentBreakdown: {method: string, amount: number}[] = [], customerObj: {id: string, name: string} | null = null, shouldPrint: boolean = false) => {
    if (!activeSession) return;
    
    // If we have a selected customer in the UI, use it if none was explicitly passed
    const targetCustomer = customerObj || (selectedCustomer ? { id: selectedCustomer.id, name: selectedCustomer.name } : null);

    // Warning override logic
    if (selectedCustomer) {
      const { currentBalance = 0, creditLimit = 0 } = selectedCustomer;
      const totalPaid = paymentBreakdown.reduce((sum, p) => sum + p.amount, 0);
      const dueAmount = grandTotal - totalPaid;
      
      // Only warn if they are increasing their debt and going over limit
      if (dueAmount > 0) {
        const projectedBalance = currentBalance + dueAmount;
        if (projectedBalance > creditLimit) {
          setPendingTransaction({ paymentBreakdown, customerObj: targetCustomer, shouldPrint, projectedBalance });
          return;
        }
      }
    }

    executeTransaction(paymentBreakdown, targetCustomer, shouldPrint);
  };

  const executeTransaction = async (paymentBreakdown: {method: string, amount: number}[], targetCustomer: {id: string, name: string} | null, shouldPrint: boolean) => {

    const isRefund = grandTotal < 0;
    setIsProcessing(true);
    
    // Generate an Idempotency Key unique to this specific click attempt
    // Using Date.now() + random string to ensure uniqueness even on rapid clicks
    const idempotencyKey = `pos_txn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      const result = await completeTransaction(paymentBreakdown, targetCustomer, idempotencyKey);
      
      if (result && (result.transaction || result.order)) {
        const orderData = result.transaction || result.order;
        // Build the invoice purely for print view rendering
        const dummyShopProfile = {
          name: 'Shop',
          address: 'Address',
          phone1: '123'
        };
        
        // Map backend order structure to the expected DBTransaction format for the invoice builder
        const mappedTransaction: any = {
          transactionId: orderData.orderNumber || orderData.transactionId || orderData._id || `TXN-${Date.now()}`,
          items: orderData.items?.map((i: any) => ({
            productName: i.name || i.productName || 'Item',
            quantity: i.quantity || 1,
            unitPrice: i.price || i.unitPrice || 0,
            discount: i.discount || 0,
            subtotal: (i.price || i.unitPrice || 0) * (i.quantity || 1)
          })) || [],
          subtotal: orderData.subtotal || 0,
          discountTotal: orderData.discountAmount || orderData.discountTotal || 0,
          grandTotal: orderData.totalAmount || orderData.grandTotal || 0,
          totalPaid: orderData.totalAmount || orderData.grandTotal || 0,
          remainingDue: 0,
          changeReturned: 0,
          paymentBreakdown: [{ method: orderData.paymentMethod || 'cash', amount: orderData.totalAmount || orderData.grandTotal || 0 }],
          createdAt: orderData.createdAt || Date.now()
        };

        if (shouldPrint) {
          const invoice = DocumentService.buildInvoice(mappedTransaction as any, dummyShopProfile as any);
          console.log("INVOICE GENERATED:", invoice);
          
          // Pass to store to trigger InvoiceReceipt render
          usePosStore.getState().setLastInvoice(invoice);
          
          await DocumentService.logPrint(invoice.invoiceId, 'PRINT');
          
          setTimeout(() => {
            window.print();
          }, 100);
        }
        
        toast.success(isRefund ? `Refund Processed. Paid: Rs ${Math.abs(grandTotal)}` : "Sale completed successfully");
        
        // Reset customer selection to prepare for next transaction
        setSelectedCustomer(null);
        // Reset the store's session customer back to walk-in
        const { saleTabs, activeTabId } = usePosStore.getState();
        usePosStore.setState({
          saleTabs: saleTabs.map(tab => {
            if (tab.id !== activeTabId) return tab;
            return {
              ...tab,
              customer: { id: 'walk-in', name: 'Walk-In Customer' }
            };
          })
        });
      }
    } catch (error) {
      // Error handled by store
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleReplaceMode = () => {
    const newMode = activeSession.mode === 'sale' ? 'replace' : 'sale';
    setSessionMode(newMode);
    toast.success(`Switched to ${newMode.toUpperCase()} mode`);
  };

  return (
    <div className="flex flex-col gap-2 h-full w-full ml-auto max-w-[320px] pl-2 min-h-0">
      <div className="border border-gray-200/60 dark:border-gray-700/60 rounded-xl p-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm flex-1 flex flex-col overflow-hidden min-h-0">
        
        {activeSession.mode === 'replace' && (
          <div className="flex justify-between items-center mb-2 text-xs">
            <span className="text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase text-[9px]">Returned Value</span>
            <span className="font-black text-orange-500 tabular-nums">- Rs {returnTotal.toLocaleString()}</span>
          </div>
        )}

        <div className="mb-2">
          <CustomerSelector 
            selectedCustomer={selectedCustomer} 
            onSelectCustomer={(customer) => {
              setSelectedCustomer(customer);
              const { saleTabs, activeTabId } = usePosStore.getState();
              usePosStore.setState({
                saleTabs: saleTabs.map(tab => {
                  if (tab.id !== activeTabId) return tab;
                  return {
                    ...tab,
                    customer: customer ? { id: customer.id, name: customer.name } : { id: 'walk-in', name: 'Walk-In Customer' }
                  };
                })
              });
            }} 
          />
        </div>

        {/* Customer Ledger Details */}
        {selectedCustomer && (
          <div className="flex flex-col gap-1 p-2 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-lg mb-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Previous Balance</span>
              <span className={`font-black tabular-nums ${selectedCustomer.currentBalance > 0 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                Rs {selectedCustomer.currentBalance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Credit Limit</span>
              <span className="font-black text-gray-700 dark:text-gray-300 tabular-nums">
                Rs {selectedCustomer.creditLimit.toLocaleString()}
              </span>
            </div>
            {selectedCustomer.currentBalance > selectedCustomer.creditLimit && (
              <div className="mt-0.5 text-[9px] font-black text-red-500 uppercase tracking-widest bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded text-center">
                Credit Limit Exceeded
              </div>
            )}
          </div>
        )}

        <div className="flex-1"></div>

        <div className="flex justify-between items-center mb-2 mt-auto pt-1 border-t border-gray-200 dark:border-gray-800 border-dashed">
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">New Items Subtotal</span>
          <span className="text-xs font-black text-gray-900 dark:text-gray-100 tabular-nums">Rs {subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200 dark:border-gray-800 border-dashed">
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Invoice Discount</span>
          <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
            <input 
              type="number"
              value={activeSession.invoiceDiscountValue || ''}
              placeholder="0"
              onChange={(e) => setInvoiceDiscount(activeSession.invoiceDiscountType, parseFloat(e.target.value) || 0)}
              className="w-14 text-xs font-black text-center py-1 bg-transparent focus:outline-none focus:bg-white dark:focus:bg-gray-700 no-spinners transition-colors"
            />
            <button 
              onClick={() => setInvoiceDiscount(activeSession.invoiceDiscountType === 'percentage' ? 'fixed' : 'percentage', activeSession.invoiceDiscountValue)}
              className="px-2 py-1 text-[10px] font-black bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {activeSession.invoiceDiscountType === 'percentage' ? '%' : 'Rs'}
            </button>
          </div>
        </div>

        {invoiceDiscountAmount > 0 && (
          <div className="flex justify-between items-center mb-3 text-xs font-black text-red-500 tabular-nums">
            <span className="text-[10px] uppercase tracking-widest">Bill Discount Applied</span>
            <span>- Rs {invoiceDiscountAmount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between items-end mt-1">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{grandTotal < 0 ? 'Refund Due' : 'Total Due'}</span>
          
          <div className={`flex items-center ${grandTotal < 0 ? 'text-red-500' : 'text-[#006970] dark:text-[#00B4BB]'}`}>
            <span className="text-sm mr-1 text-gray-400 dark:text-gray-500 font-bold mb-0.5">Rs</span>
            {isEditingTotal ? (
              <input 
                ref={(input) => input && input.select()}
                type="number"
                value={editedTotal}
                onChange={(e) => setEditedTotal(e.target.value)}
                onBlur={() => {
                  setIsEditingTotal(false);
                  if (editedTotal !== '') {
                    const newTotal = parseFloat(editedTotal) || 0;
                    const discount = Math.abs(preDiscountTotal) - newTotal;
                    setInvoiceDiscount('fixed', discount > 0 ? discount : 0);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className="text-xl lg:text-2xl font-black tabular-nums tracking-tight bg-transparent focus:outline-none w-28 text-right no-spinners border-b border-[#006970]/50"
              />
            ) : (
              <span 
                className="text-xl lg:text-2xl font-black tabular-nums tracking-tight cursor-pointer hover:opacity-80 transition-opacity border-b-2 border-dashed border-transparent hover:border-[#006970]/50 pb-0.5"
                onClick={() => {
                  setEditedTotal(Math.abs(grandTotal).toString());
                  setIsEditingTotal(true);
                }}
                title="Click to edit total due (auto-calculates discount)"
              >
                {Math.abs(grandTotal).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* POS Action Buttons Panel rendered to Bottom Bar */}
      {mounted && document.getElementById('pos-action-bar-portal') ? createPortal(
        <div className="flex items-center justify-between gap-6 p-2 border-t border-gray-200 dark:border-gray-800 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.5)] bg-white dark:bg-gray-900 w-full">
          <button 
            onClick={handleClearCart}
            disabled={isCartEmpty || isProcessing}
            title="Clear Cart (Ctrl+Delete)"
            className="w-40 h-12 flex items-center justify-center gap-2 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-600/50 rounded-lg text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/60 transition-all disabled:opacity-40 shadow-sm hover:shadow"
          >
            <Trash2 className="h-5 w-5" />
            <span className="text-[11px] font-black uppercase tracking-widest">Clear Cart</span>
          </button>
          
          <div className="flex-1" />

          <button 
            onClick={handlePayAndPrint}
            disabled={isCartEmpty || isProcessing}
            title="Pay & Print (Ctrl+P)"
            className="w-48 h-12 flex items-center justify-center gap-2 bg-gradient-to-br from-[#006970] to-[#008990] dark:from-[#008990] dark:to-[#00A4AB] rounded-lg text-white hover:opacity-90 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <Printer className="h-5 w-5" />
            <span className="text-[11px] font-black uppercase tracking-widest">Print</span>
          </button>
          
          <button 
            onClick={handleCashSale}
            disabled={isCartEmpty || isProcessing}
            title="Sale (Ctrl+S)"
            className="w-48 h-12 flex items-center justify-center gap-2 bg-teal-100 dark:bg-teal-900/40 border border-teal-300 dark:border-teal-600/50 rounded-lg text-teal-800 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800/60 transition-all shadow-sm hover:shadow disabled:opacity-40"
          >
            <Banknote className="h-5 w-5" />
            <span className="text-[11px] font-black uppercase tracking-widest">Sale</span>
          </button>
        </div>,
        document.getElementById('pos-action-bar-portal')!
      ) : null}



      {isCustomerModalOpen && (
        <CreditCustomerModal 
          onClose={() => setCustomerModalOpen(false)} 
          onSelect={(customer) => {
            setSelectedCustomer(customer);
            setCustomerModalOpen(false);
            setLedgerModalOpen(true);
          }} 
        />
      )}

      {isLedgerModalOpen && selectedCustomer && (
        <LedgerSettlementModal 
          customer={selectedCustomer} 
          invoiceTotal={grandTotal} // difference that needs to be paid via ledger
          onClose={() => setLedgerModalOpen(false)} 
          onSuccess={handleLedgerSuccess}
        />
      )}

      {pendingTransaction && selectedCustomer && (
        <CreditLimitWarningModal
          customer={selectedCustomer}
          projectedBalance={pendingTransaction.projectedBalance}
          onCancel={() => setPendingTransaction(null)}
          onProceed={() => {
            executeTransaction(pendingTransaction.paymentBreakdown, pendingTransaction.customerObj, pendingTransaction.shouldPrint);
            setPendingTransaction(null);
          }}
          onLimitUpdated={(updatedCustomer) => setSelectedCustomer(updatedCustomer)}
        />
      )}
      
      <GlobalLoadingOverlay isOpen={isProcessing} message="Processing Transaction..." />
    </div>
  );
};
