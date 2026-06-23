'use client';

import React from 'react';
import { useLedger } from '../hooks/useLedger';
import { LedgerSummaryCards } from './LedgerSummaryCards';
import { LedgerQuickStats } from './LedgerQuickStats';
import { LedgerFilters } from './LedgerFilters';
import { LedgerTabs } from './LedgerTabs';
import { LedgerTable } from './LedgerTable';

export const LedgerDashboard: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    transactions,
    summary,
    quickStats,
  } = useLedger();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* Summary Cards & Quick Stats */}
      <div>
        <LedgerSummaryCards summary={summary} />
        <LedgerQuickStats stats={quickStats} />
      </div>

      {/* Main Ledger Area */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
        <LedgerFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <LedgerTabs activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="p-4">
          <LedgerTable transactions={transactions} />
        </div>
      </div>
      
    </div>
  );
};
