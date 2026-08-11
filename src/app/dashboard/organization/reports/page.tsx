'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/auth/core/auth.store';
import { useOrganizationStore } from '@/store/useOrganizationStore';
import { usePermissions } from '@/lib/auth/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { 
  BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, 
  TrendingUp, DollarSign, Calendar, Store, Download, Filter, Shield, 
  Layers, Package, ArrowUpRight, Percent, RefreshCw 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line 
} from 'recharts';

// Datasets for BI Visualizations
const salesTrendData = [
  { date: 'Week 1', revenue: 145000, orders: 320 },
  { date: 'Week 2', revenue: 198000, orders: 410 },
  { date: 'Week 3', revenue: 172000, orders: 380 },
  { date: 'Week 4', revenue: 245000, orders: 520 },
];

const salesByShopData = [
  { shop: 'Main Branch', sales: 340000, target: 300000 },
  { shop: 'North Mall', sales: 260000, target: 250000 },
  { shop: 'East Market', sales: 160000, target: 200000 },
];

const paymentMethodData = [
  { name: 'Cash', value: 450000, color: '#10B981' },
  { name: 'Card / POS', value: 210000, color: '#3B82F6' },
  { name: 'Online Transfer', value: 75000, color: '#8B5CF6' },
  { name: 'Customer Credit', value: 25000, color: '#F59E0B' },
];

const profitLossData = [
  { month: 'Jan', revenue: 220000, expenses: 140000, netProfit: 80000 },
  { month: 'Feb', revenue: 260000, expenses: 155000, netProfit: 105000 },
  { month: 'Mar', revenue: 310000, expenses: 175000, netProfit: 135000 },
  { month: 'Apr', revenue: 290000, expenses: 165000, netProfit: 125000 },
  { month: 'May', revenue: 350000, expenses: 190000, netProfit: 160000 },
  { month: 'Jun', revenue: 420000, expenses: 210000, netProfit: 210000 },
];

const inventoryValuationData = [
  { shop: 'Main Branch', stockValue: 850000, itemTypes: 420 },
  { shop: 'North Mall', stockValue: 620000, itemTypes: 310 },
  { shop: 'East Market', stockValue: 390000, itemTypes: 190 },
];

const stockStatusData = [
  { name: 'Healthy Stock', value: 780, color: '#10B981' },
  { name: 'Low Stock Alert', value: 45, color: '#F59E0B' },
  { name: 'Out of Stock', value: 18, color: '#EF4444' },
];

export default function OrganizationReportsPage() {
  const { user } = useAuthStore();
  const { activeOrganizationId } = useOrganizationStore();
  const { hasPermission } = usePermissions();

  const [activeTab, setActiveTab] = useState<'SALES' | 'EXPENSE' | 'PROFIT' | 'INVENTORY'>('SALES');
  const [timeframe, setTimeframe] = useState('30_DAYS');
  const [shopFilter, setShopFilter] = useState('ALL');

  if (!hasPermission(PERMISSIONS.REPORTS_VIEW) && !hasPermission(PERMISSIONS.REPORTS_VIEW_ALL)) {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-xl max-w-2xl mx-auto my-12">
        <Shield className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-text-primary">Access Restricted</h2>
        <p className="text-sm text-text-muted mt-2">
          You do not have permission to access organization BI reports.
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
            <BarChart3 className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Business Intelligence & Reports
            </h1>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Executive analytics dashboard for sales trends, profit margins, operational costs, and inventory valuation.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary">
            <Calendar className="w-4 h-4 text-text-muted" />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-text-primary font-medium"
            >
              <option value="7_DAYS">Last 7 Days</option>
              <option value="30_DAYS">Last 30 Days</option>
              <option value="THIS_QUARTER">This Quarter</option>
              <option value="YEAR_TO_DATE">Year to Date (YTD)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5 text-xs text-text-primary">
            <Store className="w-4 h-4 text-text-muted" />
            <select
              value={shopFilter}
              onChange={(e) => setShopFilter(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-text-primary font-medium"
            >
              <option value="ALL">All Active Shops</option>
              <option value="MAIN">Main Branch</option>
              <option value="NORTH">North Mall Branch</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('SALES')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'SALES'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Sales Analytics
        </button>
        <button
          onClick={() => setActiveTab('PROFIT')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'PROFIT'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Profit & Loss
        </button>
        <button
          onClick={() => setActiveTab('EXPENSE')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'EXPENSE'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Expense Analytics
        </button>
        <button
          onClick={() => setActiveTab('INVENTORY')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'INVENTORY'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          Inventory Intelligence
        </button>
      </div>

      {/* TAB CONTENT */}

      {/* 1. SALES ANALYTICS TAB */}
      {activeTab === 'SALES' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Growth Trend */}
            <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-border shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-text-primary">Weekly Revenue Trend</h3>
                  <p className="text-xs text-text-muted">Total gross sales volume</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +18.2%
                </span>
              </div>
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesRevGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#006970" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#006970" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
                    <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} />
                    <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(val) => `Rs.${val / 1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                      formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#006970" fillOpacity={1} fill="url(#salesRevGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Method Distribution */}
            <div className="lg:col-span-1 bg-surface p-6 rounded-xl border border-border shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-text-primary">Sales by Payment Mode</h3>
                <p className="text-xs text-text-muted">Proportional breakdown of payment methods</p>
              </div>
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => `Rs. ${Number(value).toLocaleString()}`}
                      contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 pt-2 border-t border-border">
                {paymentMethodData.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-2 text-text-muted">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-semibold text-text-primary">
                      Rs. {item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shop Comparison Bar Chart */}
          <div className="bg-surface p-6 rounded-xl border border-border shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-text-primary">Shop-to-Shop Sales vs Target</h3>
              <p className="text-xs text-text-muted">Comparison of sales achievement against targets across branches</p>
            </div>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByShopData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
                  <XAxis dataKey="shop" stroke="var(--color-text-muted)" fontSize={12} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(val) => `Rs.${val / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                    formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, '']}
                  />
                  <Legend />
                  <Bar name="Actual Sales" dataKey="sales" fill="#006970" radius={[6, 6, 0, 0]} />
                  <Bar name="Target Goal" dataKey="target" fill="#94A3B8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROFIT & LOSS TAB */}
      {activeTab === 'PROFIT' && (
        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-xl border border-border shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-text-primary">Gross Revenue vs Operating Expenses & Net Profit</h3>
                <p className="text-xs text-text-muted">Monthly comparative audit</p>
              </div>
            </div>
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitLossData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
                  <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={12} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(val) => `Rs.${val / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                    formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, '']}
                  />
                  <Legend />
                  <Bar name="Gross Revenue" dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar name="Total Expenses" dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar name="Net Profit" dataKey="netProfit" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 3. EXPENSE ANALYTICS TAB */}
      {activeTab === 'EXPENSE' && (
        <div className="space-y-6">
          <div className="bg-surface p-6 rounded-xl border border-border shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-text-primary">Expense Trajectory</h3>
              <p className="text-xs text-text-muted">Monthly expense accumulation</p>
            </div>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitLossData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
                  <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={12} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(val) => `Rs.${val / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                    formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Expenses']}
                  />
                  <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 4. INVENTORY INTELLIGENCE TAB */}
      {activeTab === 'INVENTORY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-border shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-bold text-text-primary">Stock Valuation by Shop Location</h3>
              <p className="text-xs text-text-muted">Total inventory capital tied in stock across branches</p>
            </div>
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryValuationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
                  <XAxis dataKey="shop" stroke="var(--color-text-muted)" fontSize={12} />
                  <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(val) => `Rs.${val / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                    formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Stock Asset Value']}
                  />
                  <Bar dataKey="stockValue" fill="#006970" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-1 bg-surface p-6 rounded-xl border border-border shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-text-primary">Inventory Health Ratio</h3>
              <p className="text-xs text-text-muted">Breakdown of product stock statuses</p>
            </div>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stockStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} items`, 'Count']}
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-border">
              {stockStatusData.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-2 text-text-muted">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-semibold text-text-primary">
                    {item.value} Products
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

