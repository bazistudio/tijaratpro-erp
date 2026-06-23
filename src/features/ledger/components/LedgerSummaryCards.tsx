import React from 'react';
import { LedgerSummary } from '../types/ledger.types';
import { ArrowDownLeft, ArrowUpRight, Wallet, Landmark } from 'lucide-react';

interface Props {
  summary: LedgerSummary;
}

export const LedgerSummaryCards: React.FC<Props> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <Card 
        title="Total Receivable" 
        amount={summary.totalReceivable} 
        subtitle="Customers owe you"
        icon={<ArrowDownLeft className="h-6 w-6 text-green-600" />}
        colorClass="text-green-600"
      />
      <Card 
        title="Total Payable" 
        amount={summary.totalPayable} 
        subtitle="You owe suppliers"
        icon={<ArrowUpRight className="h-6 w-6 text-red-600" />}
        colorClass="text-red-600"
      />
      <Card 
        title="Cash In" 
        amount={summary.cashIn} 
        subtitle="Total cash received"
        icon={<Wallet className="h-6 w-6 text-[#006970]" />}
        colorClass="text-[#006970]"
      />
      <Card 
        title="Cash Out" 
        amount={summary.cashOut} 
        subtitle="Total cash paid"
        icon={<Landmark className="h-6 w-6 text-orange-600" />}
        colorClass="text-orange-600"
      />
    </div>
  );
};

function Card({ title, amount, subtitle, icon, colorClass }: { title: string, amount: number, subtitle: string, icon: React.ReactNode, colorClass: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className={`text-2xl font-bold mt-1 ${colorClass}`}>
            Rs {amount.toLocaleString()}
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
