'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/lib/auth/core/auth.store';
import { useOrganizationStore } from '@/store/useOrganizationStore';
import { usePermissions } from '@/lib/auth/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import axiosInstance from '@/lib/api/axios';
import { 
  History, Search, Filter, DollarSign, ShoppingBag, 
  ReceiptText, CreditCard, RefreshCw, Loader2, ArrowUpRight, 
  ArrowDownRight, Layers, FileText, CheckCircle2, Shield 
} from 'lucide-react';

interface HistoryRecord {
  id: string;
  type: 'sale' | 'purchase' | 'expense' | 'payment' | 'refund';
  referenceId: string;
  party?: {
    id?: string;
    name?: string;
    type?: string;
  };
  amount: number;
  status: string;
  source: string;
  createdAt: string;
}

interface HistoryStats {
  totalSales: number;
  totalInvoices: number;
  totalExpenses: number;
  netRevenue: number;
  pendingPayments: number;
}

export default function OrganizationHistoryPage() {
  const { user } = useAuthStore();
  const { activeOrganizationId } = useOrganizationStore();
  const { hasPermission } = usePermissions();

  const orgId = activeOrganizationId || user?.organizationId;

  const [historyItems, setHistoryItems] = useState<HistoryRecord[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [traceEntries, setTraceEntries] = useState<any[] | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const [historyRes, statsRes] = await Promise.all([
        axiosInstance.get('/api/v1/history', { params: { limit: 150 } }),
        axiosInstance.get('/api/v1/history/stats')
      ]);

      if (historyRes.data?.data) {
        setHistoryItems(historyRes.data.data);
      }
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err: any) {
      console.warn('Failed to load history items from backend:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [orgId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const handleFetchTrace = async (id: string) => {
    try {
      const res = await axiosInstance.get(`/api/v1/history/trace/${id}`);
      if (res.data) {
        setTraceEntries(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch ledger trace:', err);
    }
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return historyItems.filter((item) => {
      const ref = (item.referenceId || '').toLowerCase();
      const partyName = (item.party?.name || '').toLowerCase();
      
      const matchesSearch = 
        !search || 
        ref.includes(search.toLowerCase()) || 
        partyName.includes(search.toLowerCase());

      const matchesType = typeFilter === 'ALL' || item.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [historyItems, search, typeFilter]);

  if (!hasPermission(PERMISSIONS.REPORTS_VIEW) && !hasPermission(PERMISSIONS.SALES_VIEW)) {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-xl max-w-2xl mx-auto my-12">
        <Shield className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-text-primary">Access Restricted</h2>
        <p className="text-sm text-text-muted mt-2">
          You do not have permission to view organization activity history.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 bg-background min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Organization Activity History</h1>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Audit-ready chronological log of transactions, sales orders, expense receipts, and ledger entries.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-text-primary hover:bg-surface-hover shadow-xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Header Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase">Gross Sales</p>
              <h3 className="text-xl font-bold text-text-primary mt-1">
                Rs. {(stats.totalSales || 0).toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase">Total Expenses</p>
              <h3 className="text-xl font-bold text-text-primary mt-1">
                Rs. {(stats.totalExpenses || 0).toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ReceiptText className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase">Net Operating Revenue</p>
              <h3 className="text-xl font-bold text-primary mt-1">
                Rs. {(stats.netRevenue || 0).toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase">Total Invoices Logged</p>
              <h3 className="text-xl font-bold text-text-primary mt-1">
                {stats.totalInvoices || 0}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
            <input
              type="text"
              placeholder="Search history by reference # or party..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Activity Types</option>
              <option value="sale">Sales Transactions</option>
              <option value="expense">Expense Logs</option>
              <option value="payment">Ledger Payments</option>
              <option value="refund">Refunds</option>
            </select>
          </div>
        </div>
      </div>

      {/* Operations List Table */}
      <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-text-muted">Loading activity timeline...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <History className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-semibold text-text-primary">No activity records found</p>
            <p className="text-sm mt-1">Operational activities across POS, Expenses, and Ledger will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-text-muted text-xs uppercase font-semibold">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Operation Type</th>
                  <th className="p-4">Reference ID</th>
                  <th className="p-4">Party / Customer / Category</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Ledger Trace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item, idx) => {
                  const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Recent';
                  const isNegative = item.type === 'expense' || item.type === 'refund';

                  return (
                    <tr key={item.id || idx} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 text-text-muted text-xs whitespace-nowrap font-mono">{dateStr}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                          item.type === 'sale'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : item.type === 'expense'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-blue-500/10 text-blue-600'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-medium text-primary">{item.referenceId}</td>
                      <td className="p-4 font-medium text-text-primary">{item.party?.name || 'Walk-in Customer'}</td>
                      <td className={`p-4 text-right font-bold ${isNegative ? 'text-amber-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {isNegative ? '-' : '+'} Rs. {(item.amount || 0).toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-hover border border-border text-text-primary uppercase">
                          {item.status || 'Completed'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleFetchTrace(item.id)}
                          className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg hover:bg-primary/20 transition-colors"
                        >
                          Trace
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ledger Trace Modal */}
      {traceEntries && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg text-text-primary">Ledger Audit Trace</h3>
              <button
                onClick={() => setTraceEntries(null)}
                className="text-text-muted hover:text-text-primary font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {traceEntries.length === 0 ? (
                <p className="text-sm text-text-muted">No accounting ledger entries associated with this transaction.</p>
              ) : (
                traceEntries.map((step, idx) => (
                  <div key={idx} className="p-3 bg-background border border-border rounded-lg text-xs space-y-1">
                    <div className="flex justify-between font-semibold text-text-primary">
                      <span>{step.step}</span>
                      <span className="text-primary font-bold">Rs. {(step.amount || 0).toLocaleString()}</span>
                    </div>
                    <p className="text-text-muted">{step.description}</p>
                    <span className="text-[10px] text-text-muted block mt-1">
                      {new Date(step.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setTraceEntries(null)}
                className="px-4 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-text-primary hover:bg-surface-hover"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

