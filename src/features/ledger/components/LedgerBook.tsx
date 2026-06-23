import React, { useState } from 'react';
import { useLedger } from '../hooks/useLedger';
import { Download, FileText, ArrowDownRight, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const LedgerBook: React.FC = () => {
  const { 
    selectedParty, 
    activeTab, 
    setActiveTab, 
    searchQuery, 
    setSearchQuery, 
    timeline, 
    openInvoices, 
    allocations,
    isLedgerLoading 
  } = useLedger();

  const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({});

  const togglePayment = (id: string) => {
    setExpandedPayments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!selectedParty) return null;

  const isCredit = selectedParty.balance < 0;
  const balanceStr = Math.abs(selectedParty.balance).toLocaleString();
  const balanceLabel = isCredit ? 'Advance (CR)' : (selectedParty.balance > 0 ? 'Outstanding (DR)' : 'Settled');
  
  const outstandingInvoicesTotal = openInvoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">{selectedParty.name}</h2>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{selectedParty.type} LEDGER</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-700 min-w-[140px]">
            <p className="text-xs text-gray-500 font-bold mb-1">Current Balance</p>
            <p className={`text-xl font-black ${isCredit ? 'text-green-600 dark:text-green-400' : selectedParty.balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              Rs {balanceStr}
            </p>
            <p className="text-[10px] font-bold text-gray-400">{balanceLabel}</p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-100 dark:border-gray-700 min-w-[140px]">
            <p className="text-xs text-gray-500 font-bold mb-1">Open Invoices Due</p>
            <p className="text-xl font-black text-orange-600 dark:text-orange-400">
              Rs {outstandingInvoicesTotal.toLocaleString()}
            </p>
            <p className="text-[10px] font-bold text-gray-400">{openInvoices.length} Active Invoice(s)</p>
          </div>

          <button className="h-full px-6 bg-[#006970] hover:bg-[#005a60] text-white font-bold rounded-lg shadow-md transition-colors flex flex-col items-center justify-center gap-1">
            <span className="text-lg">Record</span>
            <span className="text-sm">Payment</span>
          </button>
        </div>
      </div>

      {/* Ledger UI Container */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Tabs & Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-1 overflow-x-auto">
            {['all', 'invoices', 'payments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-bold rounded-lg capitalize transition-colors whitespace-nowrap ${
                  activeTab === tab 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Search reference..."
              value={searchQuery}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
            <button className="p-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Unified Table */}
        <div className="overflow-x-auto relative min-h-[400px]">
          {isLedgerLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 font-semibold">Reference</th>
                  <th className="px-6 py-3 font-semibold">Details</th>
                  <th className="px-6 py-3 font-semibold text-right">Debit</th>
                  <th className="px-6 py-3 font-semibold text-right">Credit</th>
                  <th className="px-6 py-3 font-semibold text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {timeline.map((entry) => {
                  const isPayment = entry.type === 'payment';
                  const isDebit = entry.debitAccount === 'receivable' || entry.debitAccount === 'payable'; // simplified
                  const amount = entry.amount;
                  const bal = entry.runningBalance;
                  
                  // For UI: Let's show Debits (charges to party) and Credits (payments from party)
                  // If it's a customer, invoice is a debit to them, payment is a credit.
                  const isCustomer = selectedParty.type === 'CUSTOMER';
                  const showDebit = isCustomer ? !isPayment : isPayment;
                  const showCredit = isCustomer ? isPayment : !isPayment;

                  const entryAllocations = isPayment ? allocations.filter(a => a.paymentEntryId === entry.id) : [];

                  return (
                    <React.Fragment key={entry.id}>
                      <tr 
                        className={`hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors ${isPayment ? 'cursor-pointer' : ''}`}
                        onClick={() => isPayment && togglePayment(entry.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {format(new Date(entry.timestamp), 'dd MMM yyyy, hh:mm a')}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            {isPayment ? <ArrowDownRight className="w-4 h-4 text-green-500" /> : <FileText className="w-4 h-4 text-orange-500" />}
                            {entry.transactionId}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-900 dark:text-gray-200">{entry.description}</span>
                          {isPayment && entryAllocations.length > 0 && (
                            <span className="ml-2 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                              Settled {entryAllocations.length} Invoices
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                          {showDebit ? `Rs ${amount.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                          {showCredit ? `Rs ${amount.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-bold ${bal < 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                            {Math.abs(bal).toLocaleString()} {bal < 0 ? 'CR' : 'DR'}
                          </span>
                        </td>
                      </tr>

                      {/* Payment Allocation Breakdown */}
                      {isPayment && expandedPayments[entry.id] && entryAllocations.length > 0 && (
                        <tr className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="pl-8 border-l-2 border-green-500 ml-4 space-y-2">
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Payment Allocation Breakdown</h4>
                              {entryAllocations.map(alloc => {
                                // Find invoice details from openInvoices (or we'd need them in payload)
                                // Since we might only have open invoices in payload, closed ones might not be there.
                                // But we know the allocation amount.
                                return (
                                  <div key={alloc._id} className="flex justify-between items-center text-sm max-w-lg bg-white dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                      <span className="font-semibold text-gray-700 dark:text-gray-300">Invoice Ref: {alloc.invoiceId.substring(0,8)}...</span>
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white">Rs {alloc.amountAllocated.toLocaleString()}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
                {timeline.length === 0 && !isLedgerLoading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No transactions found for this party.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
