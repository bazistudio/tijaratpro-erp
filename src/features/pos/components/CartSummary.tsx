'use client';

import React, { useEffect, useState } from 'react';
import { Trash2, Banknote, Printer, UserCircle2, Repeat } from 'lucide-react';
import { useCartTotals, usePosStore, PaymentMethod, Transaction } from '../store/usePosStore';
import { mockShopProfile } from '../store/posMockData';
import { generateInvoice } from '../services/invoice.service';
import toast from 'react-hot-toast';
import { CreditCustomerModal } from './modals/CreditCustomerModal';
import { LedgerSettlementModal } from './modals/LedgerSettlementModal';
import { PaymentModal } from './modals/PaymentModal';
import { CreditCustomer } from '../store/posMockData';

export const CartSummary = () => {
  const { subtotal, discountTotal, grandTotal, newItemsTotal, returnTotal } = useCartTotals();
  const clearCart = usePosStore(state => state.clearCart);
  const activeSession = usePosStore(state => state.getActiveSession());
  const setSessionMode = usePosStore(state => state.setSessionMode);
  const completeTransaction = usePosStore(state => state.completeTransaction);

  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
  const [isLedgerModalOpen, setLedgerModalOpen] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CreditCustomer | null>(null);

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
      // Ctrl + L : Credit Cart / Ledger
      if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        handleCreditSale();
      }
      // F2 : Customer Search
      if (e.key === 'F2') {
        e.preventDefault();
        handleCreditSale(); // Opens same modal for Phase 3 mock
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeSession?.cart?.length, activeSession?.returnedItems?.length]);

  if (!activeSession) return null;
  const cart = activeSession.cart ?? [];
  const returnedItems = activeSession.returnedItems ?? [];
  const isCartEmpty = cart.length === 0 && returnedItems.length === 0;

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
    // Bypass modal for pure cash save
    processTransaction('cash', grandTotal > 0 ? grandTotal : 0);
  };

  const handlePayAndPrint = () => {
    if (isCartEmpty) {
      toast.error("Cart is empty");
      return;
    }
    setPaymentModalOpen(true);
  };

  const handleCreditSale = () => {
    if (isCartEmpty) {
      toast.error("Cart is empty. Add items before assigning to customer.");
      return;
    }
    setCustomerModalOpen(true);
  };

  const processTransaction = (method: PaymentMethod, cashReceived: number, customerObj: {id: string, name: string} | null = null) => {
    if (!activeSession) return;
    
    const isRefund = grandTotal < 0;
    
    const txn: Transaction = {
      transactionId: activeSession.transactionId,
      transactionType: activeSession.transactionType,
      status: 'completed',
      items: JSON.parse(JSON.stringify(activeSession.cart)),
      returnedItems: JSON.parse(JSON.stringify(activeSession.returnedItems)),
      subtotal: subtotal,
      discountTotal: discountTotal,
      grandTotal: grandTotal,
      paymentMethod: method,
      cashReceived: cashReceived,
      changeReturned: isRefund ? 0 : Math.max(cashReceived - grandTotal, 0),
      customer: customerObj,
      createdAt: Date.now()
    };

    // Build the invoice
    const invoice = generateInvoice(txn, mockShopProfile);
    
    // For now, log the invoice for verification
    console.log("INVOICE GENERATED:", invoice);

    toast.success(isRefund ? `Refund Processed. Paid: Rs ${Math.abs(grandTotal)}` : "Sale Saved & Receipt Printing...");
    
    // Save to store, which triggers rendering of InvoiceReceipt, then print
    completeTransaction(txn, invoice);
    
    setTimeout(() => {
      window.print();
    }, 100);
    
    setPaymentModalOpen(false);
  };

  const toggleReplaceMode = () => {
    const newMode = activeSession.mode === 'sale' ? 'replace' : 'sale';
    setSessionMode(newMode);
    toast.success(`Switched to ${newMode.toUpperCase()} mode`);
  };

  return (
    <div className="flex flex-col gap-3 shrink-0">
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-900 shadow-sm">
        
        {activeSession.mode === 'replace' && (
          <div className="flex justify-between items-center mb-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">Returned Value</span>
            <span className="font-semibold text-orange-500 tabular-nums">- Rs {returnTotal.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">New Items Subtotal</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">Rs {subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">Discount</span>
          <span className="text-sm font-semibold text-red-500 tabular-nums">- Rs {discountTotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-gray-900 dark:text-gray-100">{grandTotal < 0 ? 'Refund Due' : 'Total Due'}</span>
          <span className={`text-xl font-black tabular-nums ${grandTotal < 0 ? 'text-red-500' : 'text-[#006970] dark:text-[#00B4BB]'}`}>
            Rs {Math.abs(grandTotal).toLocaleString()}
          </span>
        </div>
      </div>

      {/* POS Action Buttons Panel */}
      <div className="grid grid-cols-5 gap-2 shrink-0">
        <button 
          onClick={handleClearCart}
          disabled={isCartEmpty}
          title="Clear Cart (Ctrl+Delete)"
          className="h-14 flex flex-col items-center justify-center gap-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50 disabled:hover:bg-white"
        >
          <Trash2 className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Clear</span>
        </button>
        
        <button 
          onClick={toggleReplaceMode}
          title="Toggle Replace/Exchange Mode"
          className={`h-14 flex flex-col items-center justify-center gap-1 border rounded-lg transition-colors ${activeSession.mode === 'replace' ? 'bg-orange-100 border-orange-300 text-orange-700 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-400' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200'}`}
        >
          <Repeat className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Replace</span>
        </button>
        
        <button 
          onClick={handleCashSale}
          disabled={isCartEmpty}
          title="Quick Cash Save (Ctrl+S)"
          className="h-14 flex flex-col items-center justify-center gap-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-[#006970]/10 hover:text-[#006970] hover:border-[#006970]/30 transition-colors disabled:opacity-50"
        >
          <Banknote className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Save</span>
        </button>
        
        <button 
          onClick={handleCreditSale}
          disabled={isCartEmpty}
          title="Credit Ledger (Ctrl+L)"
          className="h-14 flex flex-col items-center justify-center gap-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors disabled:opacity-50"
        >
          <UserCircle2 className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Credit</span>
        </button>
        
        <button 
          onClick={handlePayAndPrint}
          disabled={isCartEmpty}
          title="Pay & Print (Ctrl+P)"
          className="h-14 flex flex-col items-center justify-center gap-1 bg-[#006970] rounded-lg text-white hover:bg-[#005a60] transition-colors shadow-sm disabled:opacity-50"
        >
          <Printer className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Print</span>
        </button>
      </div>

      {isPaymentModalOpen && (
        <PaymentModal 
          grandTotal={grandTotal}
          onClose={() => setPaymentModalOpen(false)}
          onConfirm={(method, cash) => processTransaction(method, cash)}
          onCreditSelect={() => {
            setPaymentModalOpen(false);
            setCustomerModalOpen(true);
          }}
        />
      )}

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
          onSuccess={() => {
            setLedgerModalOpen(false);
            // Simulate 0 cash received for a pure credit transaction
            processTransaction('credit', 0, { id: selectedCustomer.id, name: selectedCustomer.name });
          }}
        />
      )}
    </div>
  );
};
