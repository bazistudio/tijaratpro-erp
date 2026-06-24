import { HistoryItem, HistoryStats, HistoryFilterParams, LedgerTraceItem } from '../types/history.types';

// Mock Data
const MOCK_HISTORY: HistoryItem[] = [
  {
    id: 'HIST-001',
    type: 'sale',
    referenceId: 'INV-2023-001',
    party: { id: 'CUST-1', name: 'John Doe', type: 'customer' },
    amount: 1500.00,
    status: 'paid',
    source: 'pos',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'HIST-002',
    type: 'purchase',
    referenceId: 'PROC-2023-088',
    party: { id: 'SUP-1', name: 'Tech Wholesalers', type: 'supplier' },
    amount: 45000.00,
    status: 'pending',
    source: 'import',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'HIST-003',
    type: 'payment',
    referenceId: 'PAY-2023-012',
    party: { id: 'CUST-2', name: 'Alice Smith', type: 'customer' },
    amount: 500.00,
    status: 'paid',
    source: 'manual',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  }
];

const MOCK_STATS: HistoryStats = {
  totalSales: 125000,
  totalInvoices: 45,
  totalExpenses: 8000,
  netRevenue: 117000,
  pendingPayments: 15000
};

export const historyApi = {
  getHistory: async (filters: HistoryFilterParams): Promise<{ data: HistoryItem[], total: number }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let filtered = [...MOCK_HISTORY];
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.referenceId.toLowerCase().includes(search) ||
        item.party.name.toLowerCase().includes(search)
      );
    }
    
    if (filters.type) {
      filtered = filtered.filter(item => item.type === filters.type);
    }
    
    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    return {
      data: filtered,
      total: filtered.length
    };
  },

  getStats: async (): Promise<HistoryStats> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return MOCK_STATS;
  },

  getLedgerTrace: async (id: string): Promise<LedgerTraceItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 't1', step: 'Invoice Created', description: 'Sale Invoice generated via POS', timestamp: new Date().toISOString(), amount: 1500, status: 'completed' },
      { id: 't2', step: 'Stock Movement', description: 'Inventory reduced by 2 items', timestamp: new Date().toISOString(), status: 'completed' },
      { id: 't3', step: 'Ledger Entry', description: 'Debited Cash, Credited Sales', timestamp: new Date().toISOString(), amount: 1500, status: 'completed' },
      { id: 't4', step: 'Payment', description: 'Cash payment received', timestamp: new Date().toISOString(), amount: 1500, status: 'completed' }
    ];
  }
};
