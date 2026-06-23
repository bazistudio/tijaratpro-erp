import { useState, useMemo } from 'react';
import { LedgerTransaction, LedgerTab } from '../types/ledger.types';
import { mockTransactions, mockLedgerSummary, mockLedgerQuickStats } from '../data/mockLedgerData';

export function useLedger() {
  const [activeTab, setActiveTab] = useState<LedgerTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use mock data for phase 1
  const transactions = mockTransactions;
  const summary = mockLedgerSummary;
  const quickStats = mockLedgerQuickStats;

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by tab
    if (activeTab === 'receivables') {
      filtered = filtered.filter(t => t.sourceType === 'sale' || t.sourceType === 'customer_payment');
    } else if (activeTab === 'payables') {
      filtered = filtered.filter(t => t.sourceType === 'purchase' || t.sourceType === 'supplier_payment');
    } else if (activeTab === 'cash' || activeTab === 'bank') {
      // Stub for cash/bank filtering later
    }

    // Filter by search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.id.toLowerCase().includes(lowerQuery) || 
        t.partyName?.toLowerCase().includes(lowerQuery)
      );
    }

    return filtered;
  }, [transactions, activeTab, searchQuery]);

  return {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    transactions: filteredTransactions,
    summary,
    quickStats,
  };
}
