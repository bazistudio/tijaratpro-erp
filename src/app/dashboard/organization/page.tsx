'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth/core/auth.store';
import { useOrganizationStore } from '@/store/useOrganizationStore';
import { usePermissions } from '@/lib/auth/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { getOrganizationDashboard, DashboardData } from '@/lib/api/organization.api';
import { CreateShopWizard } from '@/features/organization/components/onboarding/CreateShopWizard';
import { SubscriptionCard } from '@/features/organization/components/dashboard/SubscriptionCard';
import { ShopUsageCard } from '@/features/organization/components/dashboard/ShopUsageCard';
import { SalesSummaryCard } from '@/features/organization/components/dashboard/SalesSummaryCard';
import { InventoryAlertCard, RecentActivity } from '@/features/organization/components/dashboard/OverviewCards';
import { 
  Loader2, TrendingUp, DollarSign, Store, Users, Package, 
  ArrowUpRight, ArrowDownRight, Layers, ShieldCheck, RefreshCw, BarChart3, PieChartIcon 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';

// Data adapters / sample fallback metrics when detailed trends endpoint is building up
const sampleMonthlyTrend = [
  { month: 'Jan', revenue: 124000, expenses: 82000, profit: 42000 },
  { month: 'Feb', revenue: 158000, expenses: 91000, profit: 67000 },
  { month: 'Mar', revenue: 182000, expenses: 104000, profit: 78000 },
  { month: 'Apr', revenue: 215000, expenses: 112000, profit: 103000 },
  { month: 'May', revenue: 194000, expenses: 108000, profit: 86000 },
  { month: 'Jun', revenue: 261000, expenses: 135000, profit: 126000 },
];

const sampleExpenseCategoryData = [
  { name: 'Rent & Utilities', value: 45000, color: '#3B82F6' },
  { name: 'Salaries & Payroll', value: 65000, color: '#10B981' },
  { name: 'Inventory Purchase', value: 85000, color: '#F59E0B' },
  { name: 'Marketing & Ads', value: 15000, color: '#8B5CF6' },
  { name: 'Logistics & Taxes', value: 12000, color: '#EC4899' },
];

const sampleShopPerformance = [
  { shopName: 'Main Branch', sales: 124000, orders: 412 },
  { shopName: 'North Mall Branch', sales: 89000, orders: 284 },
  { shopName: 'East Market Branch', sales: 48000, orders: 165 },
];

export default function OrganizationDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const { activeOrganization, activeOrganizationId } = useOrganizationStore();
  const { hasPermission } = usePermissions();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const orgId = activeOrganizationId || user?.organizationId;

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!orgId) throw new Error('No organization context active');
      
      const dashboardData = await getOrganizationDashboard(orgId);
      setData(dashboardData);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load organization overview');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (orgId) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [orgId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-text-muted">Loading Organization Overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-danger bg-danger/10 rounded-lg m-6 border border-danger/20 flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Error Loading Organization Dashboard</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <button 
          onClick={fetchDashboard}
          className="px-4 py-2 bg-danger text-white rounded-lg text-sm font-medium hover:bg-danger/90 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  if (data.shops.current === 0) {
    return (
      <div className="p-4 lg:p-8 bg-background min-h-full">
        <CreateShopWizard 
          organizationId={orgId!} 
          onSuccess={() => fetchDashboard()} 
        />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 bg-background min-h-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {data.organization.name} Overview
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
              Code: {data.organization.code || 'ORG'}
            </span>
          </div>
          <p className="text-text-muted text-sm mt-1">
            Consolidated financial & operational analytics across all active branches.
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
          {hasPermission(PERMISSIONS.ORG_SETTINGS_MANAGE) && (
            <button 
              onClick={() => router.push('/dashboard/organization/settings')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 shadow-xs transition-all"
            >
              Org Settings
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SubscriptionCard subscription={data.subscription} />
        <ShopUsageCard shops={data.shops} employees={data.employees} />
        <SalesSummaryCard sales={data.sales} />
        <InventoryAlertCard inventory={data.inventory} />
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Profit Trends (Area Chart) */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-border shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-text-primary">Financial Trends</h3>
              </div>
              <p className="text-xs text-text-muted">Monthly Revenue, Expenses & Net Profit</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> +16.4% YoY
            </span>
          </div>

          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sampleMonthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#006970" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#006970" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
                <XAxis dataKey="month" stroke="var(--color-text-muted)" fontSize={12} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(val) => `Rs.${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-surface)', 
                    borderColor: 'var(--color-border)', 
                    color: 'var(--color-text-primary)', 
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} 
                  formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, '']}
                />
                <Legend />
                <Area type="monotone" name="Revenue" dataKey="revenue" stroke="#006970" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                <Area type="monotone" name="Net Profit" dataKey="profit" stroke="#10B981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown (Donut Chart) */}
        <div className="lg:col-span-1 bg-surface p-6 rounded-xl border border-border shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieChartIcon className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-text-primary">Expense Distribution</h3>
            </div>
            <p className="text-xs text-text-muted">Proportional operational expenditures</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sampleExpenseCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {sampleExpenseCategoryData.map((entry, index) => (
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
            {sampleExpenseCategoryData.slice(0, 3).map((item, i) => (
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

      {/* Second Analytics Row: Shop Comparison & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shop-to-Shop Sales Comparison (Bar Chart) */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-border shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-text-primary">Sales by Shop Location</h3>
              <p className="text-xs text-text-muted">Branch-wise comparison of total sales revenue</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/organization/sales')}
              className="text-xs text-primary hover:underline font-medium"
            >
              View Full Sales Audit →
            </button>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleShopPerformance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.6} />
                <XAxis dataKey="shopName" stroke="var(--color-text-muted)" fontSize={12} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickFormatter={(val) => `Rs.${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)', borderRadius: '8px' }}
                  formatter={(val: any) => [`Rs. ${Number(val).toLocaleString()}`, 'Sales Revenue']}
                />
                <Bar dataKey="sales" fill="#006970" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Organization Activity */}
        <div className="lg:col-span-1">
          <RecentActivity activity={data.recentActivity} />
        </div>
      </div>
    </div>
  );
}

