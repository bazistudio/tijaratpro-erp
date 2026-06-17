import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

export const useDashboardAnalytics = (filter: 'today' | 'week' | 'month' | 'all' = 'today') => {
  return useLiveQuery(async () => {
    // 1. Determine Time Range
    const now = new Date();
    let startTime = 0;
    
    if (filter === 'today') {
      startTime = new Date(now.setHours(0, 0, 0, 0)).getTime();
    } else if (filter === 'week') {
      const first = now.getDate() - now.getDay();
      startTime = new Date(now.setDate(first)).setHours(0, 0, 0, 0);
    } else if (filter === 'month') {
      startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    }

    // 2. Fetch Relevant Ledger Entries
    const ledgerEntries = await db.ledgerEntries
      .where('timestamp')
      .aboveOrEqual(startTime)
      .toArray();

    // 3. Compute Today Sales (Cash + Credit - Returns)
    let totalRevenue = 0;
    let netProfit = 0;
    let pendingPayments = 0;
    let totalRefunds = 0;

    for (const entry of ledgerEntries) {
      if (entry.creditAccount === 'sales_revenue') {
        totalRevenue += entry.amount;
      }
      if (entry.debitAccount === 'receivable') {
        pendingPayments += entry.amount;
      }
      if (entry.type === 'PURCHASE_RETURN') {
        totalRefunds += entry.amount;
      }
      // Profit is Revenue - COGS
      if (entry.debitAccount === 'cogs') {
        // COGS reduces profit
        netProfit -= entry.amount;
      }
      if (entry.creditAccount === 'sales_revenue') {
        // Revenue increases profit
        netProfit += entry.amount;
      }
      if (entry.type === 'RETURN_COGS_ADJUSTMENT') {
        // Restoring COGS increases profit slightly back
        netProfit += entry.amount;
      }
    }

    // Adjust Revenue to account for refunds directly if needed, but normally sales_revenue is gross
    // So let's provide net revenue
    const netRevenue = totalRevenue - totalRefunds;

    return {
      totalRevenue: netRevenue,
      netProfit,
      pendingPayments,
      totalRefunds
    };
  }, [filter], {
    totalRevenue: 0,
    netProfit: 0,
    pendingPayments: 0,
    totalRefunds: 0
  });
};
