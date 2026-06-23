import React from 'react';
import { LedgerTransaction, LineItem } from '../types/ledger.types';
import { Phone, FileText } from 'lucide-react';

interface Props {
  transaction: LedgerTransaction;
}

export const LedgerExpandedRow: React.FC<Props> = ({ transaction }) => {
  return (
    <tr className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700">
      <td colSpan={10} className="p-0">
        <div className="px-14 py-6 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column: Party Details & Meta */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                Transaction Details
              </h4>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="mb-2">
                  <span className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Party / Account</span>
                  <div className="font-medium text-gray-900 dark:text-white">{transaction.partyName}</div>
                </div>
                
                {transaction.partyPhone && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 mt-2">
                    <Phone className="h-3 w-3" />
                    <span>{transaction.partyPhone}</span>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs block">Date & Time</span>
                    <span className="text-gray-900 dark:text-gray-200">{transaction.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-xs block">Ref Number</span>
                    <span className="text-gray-900 dark:text-gray-200">{transaction.id}</span>
                  </div>
                </div>

                {transaction.notes && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded text-gray-600 dark:text-gray-300 italic">
                    "{transaction.notes}"
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Line Items & Totals */}
            <div>
              {transaction.items && transaction.items.length > 0 ? (
                <>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Line Items</h4>
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-4 py-1.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Item</th>
                          <th className="px-4 py-1.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Qty</th>
                          <th className="px-4 py-1.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Price</th>
                          <th className="px-4 py-1.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {transaction.items.map((item: LineItem) => (
                          <tr key={item.id}>
                            <td className="px-4 py-1.5 text-gray-900 dark:text-gray-200">{item.name}</td>
                            <td className="px-4 py-1.5 text-right text-gray-600 dark:text-gray-400">{item.quantity}</td>
                            <td className="px-4 py-1.5 text-right text-gray-600 dark:text-gray-400">{item.price.toLocaleString()}</td>
                            <td className="px-4 py-1.5 text-right text-gray-900 dark:text-gray-200 font-medium">{item.total.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500 dark:text-gray-400">Subtotal:</span>
                        <span className="text-gray-900 dark:text-white">Rs {transaction.subtotal?.toLocaleString() ?? 0}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-green-600 dark:text-green-400">Paid:</span>
                        <span className="text-green-600 dark:text-green-400">Rs {transaction.paidAmount?.toLocaleString() ?? 0}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white">Remaining Balance:</span>
                        <span className="text-red-600 dark:text-red-400">Rs {transaction.remainingAmount?.toLocaleString() ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                  No line items for this transaction
                </div>
              )}
            </div>

          </div>
        </div>
      </td>
    </tr>
  );
};
