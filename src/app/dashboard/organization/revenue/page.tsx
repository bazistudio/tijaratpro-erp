'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/lib/auth/core/auth.store';
import { useOrganizationStore } from '@/store/useOrganizationStore';
import { usePermissions } from '@/lib/auth/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { 
  TrendingUp, DollarSign, Calendar, Store, CreditCard, 
  ArrowUpRight, BarChart3, PieChartIcon, Shield, RefreshCw 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';

const revenueTrendData = [
  { date: 'Jul 1', revenue: 142000, net: 98000 },
  { date: 'Jul 8', revenue: 185000, net: 132000 },
  { date: 'Jul 15', revenue: 168000, net: 115000 },
  { date: 'Jul 22', revenue: 225000, net: 164000 },
  { date: 'Jul 29', revenue: 290000, net: 215000 },
  { date: 'Aug 5', revenue: 310000, net: 235000 },
];

const shopRevenueData = [
  { shop: 'Main Branch', gross: 450000, net: 320000 },
  { shop: 'North Mall', gross: 320000, net: 230000 },
  { shop: 'East Market', gross: 190000, net: 135000 },
];

const paymentDistributionData = [
  { name: 'Cash POS', value: 520000, color: '#10B981' },
  { name: 'Card Terminal', value: 280000, color: '#3B82F6' },
  { name: 'Bank Transfer', value: 110000, color: '#8B5CF6' },
  { name: 'Customer Credit', value: 50000, color: '#F59E0B' },
];

export default function OrganizationRevenuePage() {
  const { user } = useAuthStore();
  const { activeOrganizationId } = useOrganizationStore();
  const { hasPermission } = usePermissions();

  const [timeframe, setTimeframe] = useState('30_DAYS');
  const [shopFilter, setShopFilter] = useState('ALL');

  if (!hasPermission(PERMISSIONS.REPORTS_VIEW) && !hasPermission(PERMISSIONS.FINANCE_VIEW)) {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-xl max-w-2xl mx-auto my-12">
        <Shield className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-text-primary">Access Restricted</h2>
        <p className="text-sm text-text-muted mt-2">
          You do not have permission to access organization revenue analytics.
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
            <TrendingUp className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Revenue & Financial Analytics</h1>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Dedicated intelligence workspace for revenue growth, branch sales performance, and payment breakdown.
          </p>
        </div>

        {/* Filters */}
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
              <option value="ALL">All Branch Locations</option>
              <option value="MAIN">Main Branch</option>
              <option value="NORTH">North Mall Branch</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Gross Revenue</p>
            <h3 className="text-xl font-bold text-text-primary mt-1">
              Rs. 1,320,000
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Net Revenue</p>
            <h3 className="text-xl font-bold text-primary mt-1">
              Rs. 959,000
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Avg Order Value</p>
            <h3 className="text-xl font-bold text-text-primary mt-1">
              Rs. 2,840
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase">Growth Trajectory</p>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-5 h-5" /> +21.4%
            </h3>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Growth Trajectory (Area Chart) */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-border shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-text-primary">Gross vs Net Revenue Trajectory</h3>
              <p className="text-xs text-text-muted">Weekly performance over active billing cycle</p>
            </div>
          </div>
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006970" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#006970" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
                <XAxis dataKey="date" stroke="var(--color-text-muted)" fontSize={12} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(val) => `Rs.${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                  formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, '']}
                />
                <Legend />
                <Area name="Gross Revenue" type="monotone" dataKey="revenue" stroke="#006970" fillOpacity={1} fill="url(#grossGrad)" strokeWidth={2} />
                <Area name="Net Revenue" type="monotone" dataKey="net" stroke="#10B981" fillOpacity={1} fill="url(#netGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Method Revenue Share */}
        <div className="lg:col-span-1 bg-surface p-6 rounded-xl border border-border shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-text-primary">Revenue by Channel</h3>
            <p className="text-xs text-text-muted">Payment method share</p>
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {paymentDistributionData.map((entry, index) => (
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
            {paymentDistributionData.map((item, i) => (
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

      {/* Shop Revenue Comparison Chart */}
      <div className="bg-surface p-6 rounded-xl border border-border shadow-xs space-y-4">
        <div>
          <h3 className="text-base font-bold text-text-primary">Branch Revenue Comparison</h3>
          <p className="text-xs text-text-muted">Gross vs Net Revenue breakdown by branch location</p>
        </div>
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shopRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
              <XAxis dataKey="shop" stroke="var(--color-text-muted)" fontSize={12} />
              <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(val) => `Rs.${val / 1000}k`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, '']}
              />
              <Legend />
              <Bar name="Gross Revenue" dataKey="gross" fill="#006970" radius={[6, 6, 0, 0]} />
              <Bar name="Net Profit" dataKey="net" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

