import React from 'react';
import { LedgerTransaction } from '../types/ledger.types';
import { ChevronRight, ChevronDown, ExternalLink } from 'lucide-react';

interface Props {
  transaction: LedgerTransaction;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const LedgerRow: React.FC<Props> = ({ transaction, isExpanded, onToggleExpand }) => {
  const isNegative = transaction.balance < 0;
  
  return (
    <tr className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 ${isExpanded ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}>
      <td className="px-4 py-1.5 whitespace-nowrap">
        <button 
          onClick={onToggleExpand}
          className="p-1 rounded-md text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
      </td>
      <td className="px-4 py-1.5 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {transaction.date.split(',')[0]}
      </td>
      <td className="px-4 py-1.5 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
        {transaction.id}
      </td>
      <td className="px-4 py-1.5 whitespace-nowrap">
        <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">{transaction.partyName}</div>
      </td>
      <td className="px-4 py-1.5 whitespace-nowrap">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
          {transaction.type}
        </span>
      </td>
      <td className="px-4 py-1.5 whitespace-nowrap text-sm text-right text-red-600 dark:text-red-400">
        {transaction.debit ? transaction.debit.toLocaleString() : '-'}
      </td>
      <td className="px-4 py-1.5 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400">
        {transaction.credit ? transaction.credit.toLocaleString() : '-'}
      </td>
      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-bold ${isNegative ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
        {Math.abs(transaction.balance).toLocaleString()} {isNegative ? '(Cr)' : '(Dr)'}
      </td>
      <td className="px-4 py-1.5 whitespace-nowrap">
        <StatusBadge status={transaction.status} />
      </td>
      <td className="px-4 py-1.5 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-[#006970] dark:text-[#00B4BB] hover:text-[#005a60] dark:hover:text-[#009ca2] p-1 rounded transition-colors flex items-center gap-1 mx-auto">
          <ExternalLink className="h-4 w-4" />
          <span className="sr-only">View</span>
        </button>
      </td>
    </tr>
  );
};

function StatusBadge({ status }: { status: string }) {
  let colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  
  if (status === 'paid' || status === 'completed') {
    colorClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
  } else if (status === 'unpaid' || status === 'pending') {
    colorClass = 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  } else if (status === 'partial') {
    colorClass = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${colorClass}`}>
      {status}
    </span>
  );
}
