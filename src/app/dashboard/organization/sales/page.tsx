'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '@/lib/auth/core/auth.store';
import { useOrganizationStore } from '@/store/useOrganizationStore';
import { usePermissions } from '@/lib/auth/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { salesApi } from '@/services/sales.api';
import { shopApi } from '@/services/shop.api';
import { 
  ShoppingBag, Search, Filter, Calendar, DollarSign, 
  TrendingUp, CreditCard, Store, Eye, Download, RefreshCw, Loader2, Shield 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function OrganizationSalesPage() {
  const { user } = useAuthStore();
  const { activeOrganizationId } = useOrganizationStore();
  const { hasPermission } = usePermissions();

  const orgId = activeOrganizationId || user?.organizationId;

  const [orders, setOrders] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedShopId, setSelectedShopId] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<string>('30_DAYS');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, shopsRes] = await Promise.all([
        salesApi.getOrders({ limit: 200 }),
        shopApi.getShops()
      ]);

      if (ordersRes?.data) {
        setOrders(ordersRes.data);
      }
      if (shopsRes?.data) {
        setShops(shopsRes.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch sales data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search
      const matchesSearch = 
        !search || 
        order.orderNumber?.toLowerCase().includes(search.toLowerCase()) || 
        order.customerName?.toLowerCase().includes(search.toLowerCase());

      // Shop
      const matchesShop = 
        selectedShopId === 'ALL' || 
        order.shopId === selectedShopId || 
        order.branchId === selectedShopId;

      // Payment
      const matchesPayment = 
        paymentFilter === 'ALL' || 
        (order.paymentMethod || '').toUpperCase() === paymentFilter.toUpperCase();

      return matchesSearch && matchesShop && matchesPayment;
    });
  }, [orders, search, selectedShopId, paymentFilter]);

  // Calculated Stats
  const stats = useMemo(() => {
    const totalRev = filteredOrders.reduce((sum, o) => sum + (o.grandTotal || o.totalAmount || 0), 0);
    const totalOrdersCount = filteredOrders.length;
    const avgOrderVal = totalOrdersCount > 0 ? totalRev / totalOrdersCount : 0;
    
    // Count by payment method
    const paymentCounts: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const pm = o.paymentMethod || 'CASH';
      paymentCounts[pm] = (paymentCounts[pm] || 0) + 1;
    });
    const topPayment = Object.entries(paymentCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'CASH';

    return {
      totalRevenue: totalRev,
      totalOrders: totalOrdersCount,
      avgOrderValue: avgOrderVal,
      topPaymentMethod: topPayment
    };
  }, [filteredOrders]);

  // Chart Data Preparation (Group by Date)
  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent';
      grouped[dateStr] = (grouped[dateStr] || 0) + (o.grandTotal || o.totalAmount || 0);
    });

    return Object.entries(grouped).map(([date, amount]) => ({ date, amount })).reverse().slice(-14);
  }, [filteredOrders]);

  if (!hasPermission(PERMISSIONS.SALES_VIEW)) {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-xl max-w-2xl mx-auto my-12">
        <Shield className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-text-primary">Access Restricted</h2>
        <p className="text-sm text-text-muted mt-2">
          You do not have permission to view organization sales records.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 bg-background min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Organization Sales Audit</h1>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Consolidated cross-shop sales transactions, revenue performance, and audit trail.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-lg text-sm font-medium text-text-primary hover:bg-surface-hover shadow-xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Total Revenue</p>
            <h3 className="text-xl font-bold text-text-primary mt-1">
              Rs. {stats.totalRevenue.toLocaleString()}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Total Transactions</p>
            <h3 className="text-xl font-bold text-text-primary mt-1">
              {stats.totalOrders}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Avg Order Value</p>
            <h3 className="text-xl font-bold text-text-primary mt-1">
              Rs. {Math.round(stats.avgOrderValue).toLocaleString()}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Top Payment Mode</p>
            <h3 className="text-xl font-bold text-text-primary mt-1 uppercase">
              {stats.topPaymentMethod}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sales Trend Chart */}
      {chartData.length > 0 && (
        <div className="bg-surface p-6 rounded-xl border border-border shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-text-primary">Sales Trend</h3>
              <p className="text-xs text-text-muted">Revenue volume over recent sales dates</p>
            </div>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006970" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#006970" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
                <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(val) => `Rs.${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', borderRadius: '8px' }}
                  formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Daily Revenue']}
                />
                <Area type="monotone" dataKey="amount" stroke="#006970" fillOpacity={1} fill="url(#salesGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-surface border border-border rounded-xl p-4 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-3 text-text-muted" />
            <input
              type="text"
              placeholder="Search by order # or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
            />
          </div>

          {/* Shop Filter */}
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-text-muted" />
            <select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Shops</option>
              {shops.map((shop) => (
                <option key={shop._id || shop.id} value={shop._id || shop.id}>
                  {shop.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-text-muted" />
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Payments</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="ONLINE">Online Transfer</option>
              <option value="CREDIT">Customer Credit</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-text-muted">Loading sales records...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-semibold text-text-primary">No sales transactions found</p>
            <p className="text-sm mt-1">Try resetting filters or searching with a different keyword.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-text-muted text-xs uppercase font-semibold">
                  <th className="p-4">Order #</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Shop Location</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4 text-right">Items</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order, idx) => {
                  const shopName = shops.find(s => s._id === order.shopId || s.id === order.shopId)?.name || 'Branch Store';
                  return (
                    <tr key={order._id || idx} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-mono font-medium text-primary">
                        {order.orderNumber || `#ORD-${idx + 101}`}
                      </td>
                      <td className="p-4 text-text-muted text-xs">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="p-4 font-medium text-text-primary">
                        {shopName}
                      </td>
                      <td className="p-4 text-text-primary">
                        {order.customerName || order.customer?.name || 'Walk-in Customer'}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase bg-surface-hover border border-border text-text-primary">
                          {order.paymentMethod || 'CASH'}
                        </span>
                      </td>
                      <td className="p-4 text-right font-medium text-text-primary">
                        {order.items?.length || 1}
                      </td>
                      <td className="p-4 text-right font-bold text-text-primary">
                        Rs. {(order.grandTotal || order.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          order.status === 'completed' || !order.status 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {order.status || 'Completed'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 hover:bg-surface-hover text-text-muted hover:text-primary rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Sale Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-lg text-text-primary">
                  Order Details ({selectedOrder.orderNumber || 'Sale Item'})
                </h3>
                <p className="text-xs text-text-muted">
                  {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : ''}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-text-muted hover:text-text-primary font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-sm text-text-primary">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Payment Method:</span>
                <span className="font-semibold uppercase">{selectedOrder.paymentMethod || 'CASH'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Customer:</span>
                <span className="font-medium">{selectedOrder.customerName || 'Walk-in Customer'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-text-muted">Grand Total:</span>
                <span className="font-bold text-primary">
                  Rs. {(selectedOrder.grandTotal || selectedOrder.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
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

