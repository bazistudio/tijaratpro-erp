import React, { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { CustomerListPanel } from './ledger/CustomerListPanel';
import { CustomerDetailPanel } from './ledger/CustomerDetailPanel';
import { MonthSelector } from './ledger/MonthSelector';
import { LedgerTable } from './ledger/LedgerTable';
import { ReceivePaymentModal } from './ledger/ReceivePaymentModal';
import { MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

export const CreditLedgerTab = () => {
  const [selectedMonth, setSelectedMonth] = useState('All Time'); // Simplified for V1
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // 1. Fetch Customers
  const customers = useLiveQuery(() => db.customers.toArray()) || [];
  
  // Set default selection if none selected and customers are loaded
  useEffect(() => {
    if (!selectedCustomerId && customers.length > 0) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  const selectedCustomer = useMemo(() => 
    customers.find(c => c.id === selectedCustomerId) || null
  , [customers, selectedCustomerId]);

  // 2. Fetch Ledger Entries for selected customer
  const ledgerEntries = useLiveQuery(
    () => selectedCustomerId 
      ? db.ledgerEntries.where({ customerId: selectedCustomerId }).toArray() 
      : Promise.resolve([]),
    [selectedCustomerId]
  ) || [];

  // 3. Fetch Transaction count for Quick Stats
  const totalInvoices = useLiveQuery(
    async () => {
      if (!selectedCustomerId) return 0;
      // TODO(V2): db.transactions does not index by customerId out of the box in this schema
      // Add `customerId` to DBTransaction index in V2 and use `.where('customerId')`.
      // For V1, a full scan is acceptable.
      const txs = await db.transactions.toArray();
      return txs.filter(t => t.customer?.id === selectedCustomerId).length;
    },
    [selectedCustomerId]
  ) || 0;

  // 4. Compute Last Payment and Last Invoice dates
  const lastPayment = useMemo(() => {
    const payments = ledgerEntries.filter(e => e.type === 'payment');
    if (payments.length === 0) return 'Never';
    const latest = payments.reduce((a, b) => a.timestamp > b.timestamp ? a : b);
    return format(latest.timestamp, 'dd MMM yyyy');
  }, [ledgerEntries]);

  const lastInvoice = useMemo(() => {
    const invoices = ledgerEntries.filter(e => e.type !== 'payment');
    if (invoices.length === 0) return 'Never';
    const latest = invoices.reduce((a, b) => a.timestamp > b.timestamp ? a : b);
    return format(latest.timestamp, 'dd MMM yyyy');
  }, [ledgerEntries]);

  const handleSendReminders = () => {
    alert('Bulk reminders feature via WhatsApp Cloud API will be available in V2.');
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-200 dark:border-gray-800 shadow-sm gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <span className="font-semibold text-gray-700 dark:text-gray-200 hidden sm:inline-block">Filter Ledger:</span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <MonthSelector 
            selectedMonth={selectedMonth} 
            onSelect={setSelectedMonth} 
          />
          <button 
            onClick={handleSendReminders}
            className="flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] dark:bg-[#25D366]/20 dark:hover:bg-[#25D366]/30 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Bulk Reminders</span>
          </button>
        </div>
      </div>

      {/* Main 30/70 Layout */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
        {/* Left Panel (30%) */}
        <div className="w-full md:w-[30%] min-w-[280px] h-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
          <CustomerListPanel 
            customers={customers} 
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={setSelectedCustomerId}
          />
        </div>

        {/* Right Panel (70%) */}
        <div className="w-full md:w-[70%] h-full flex flex-col overflow-y-auto no-scrollbar">
          <CustomerDetailPanel 
            customer={selectedCustomer} 
            totalInvoices={totalInvoices}
            lastPayment={lastPayment}
            lastInvoice={lastInvoice}
            onReceivePayment={() => setIsPaymentModalOpen(true)}
          />
          {selectedCustomer && (
            <LedgerTable entries={ledgerEntries} />
          )}
        </div>
      </div>

      <ReceivePaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        customer={selectedCustomer} 
      />
    </div>
  );
};
