'use client';

import React from 'react';
import { useAuthStore } from '@/lib/auth/core/auth.store';
import { 
  Building2, Users, Package, TrendingUp, Store, 
  AlertTriangle, Receipt, Bell, Plus, FileBarChart,
  ArrowUpRight, ArrowDownRight, Clock, Box
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_SHOPS = [
  { id: 1, name: 'Main Downtown Branch', revenue: 'Rs. 1,245,000', orders: 1240, employees: 12, stockHealth: 92 },
  { id: 2, name: 'Northside Superstore', revenue: 'Rs. 832,500', orders: 890, employees: 8, stockHealth: 65 },
  { id: 3, name: 'Airport Express', revenue: 'Rs. 415,200', orders: 2105, employees: 5, stockHealth: 25 },
];

const MOCK_ACTIVITIES = [
  { id: 1, user: 'Ali Khan', action: 'Logged in from IP 192.168.x', time: '10 mins ago', role: 'Shop Admin' },
  { id: 2, user: 'Sarah Ahmed', action: 'Updated pricing for 15 items', time: '1 hour ago', role: 'Manager' },
  { id: 3, user: 'Zainab B.', action: 'Initiated stock transfer', time: '2 hours ago', role: 'Inventory Lead' },
  { id: 4, user: 'Usman R.', action: 'Generated Monthly Report', time: '5 hours ago', role: 'Accountant' },
];

const MOCK_ALERTS = [
  { id: 1, title: 'Low Stock: Premium Wireless Headphones', type: 'warning', time: '2m ago' },
  { id: 2, title: 'System Sync Completed', type: 'info', time: '1h ago' },
  { id: 3, title: 'New Shop "Eastside" Initialized', type: 'success', time: '4h ago' },
  { id: 4, title: 'Critical Stock Level: Branch 3', type: 'error', time: '1d ago' },
];

export default function OrganizationDashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="p-4 lg:p-8 max-w-[1600px] mx-auto space-y-6 bg-gray-50/50 dark:bg-gray-950/50 min-h-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Welcome back, {user?.name || 'Organization Owner'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Here's what's happening across your shops today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all">
            Download Report
          </button>
          <button className="px-4 py-2 bg-[#006970] hover:bg-[#00585e] dark:bg-[#008990] dark:hover:bg-[#00787e] text-white rounded-lg text-sm font-medium shadow-sm transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add New Shop
          </button>
        </div>
      </div>

      {/* SECTION 1: BUSINESS OVERVIEW KPI ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {[
          { label: 'Total Shops', value: '12', icon: Store, trend: '+2 this year', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'Total Employees', value: '148', icon: Users, trend: '+12 this month', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'Total Products', value: '8,430', icon: Package, trend: '+450 new', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Monthly Revenue', value: 'Rs. 4.2M', icon: TrendingUp, trend: '+15.2%', color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
          { label: 'Total Orders', value: '12,450', icon: Receipt, trend: '+5.4%', color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30' },
          { label: 'Active Suppliers', value: '45', icon: Building2, trend: 'Stable', color: 'text-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/30' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{kpi.value}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mt-1">{kpi.label}</p>
            </div>
            <div className="mt-3 flex items-center text-xs font-medium text-gray-500 dark:text-gray-400">
              <span className={kpi.trend.startsWith('+') ? 'text-emerald-500' : ''}>{kpi.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* MAIN COLUMN (8 cols on lg) */}
        <div className="col-span-12 lg:col-span-8 xl:col-span-8 space-y-6">
          
          {/* SECTION 2: SHOP PERFORMANCE */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Shop Performance</h2>
              <button className="text-sm font-medium text-[#006970] dark:text-[#00B4BB] hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">
                  <tr>
                    <th className="px-6 py-3 font-medium">Shop Name</th>
                    <th className="px-6 py-3 font-medium">Revenue</th>
                    <th className="px-6 py-3 font-medium">Orders</th>
                    <th className="px-6 py-3 font-medium">Staff</th>
                    <th className="px-6 py-3 font-medium w-48">Stock Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {MOCK_SHOPS.map((shop) => (
                    <tr key={shop.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <Store className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </div>
                        {shop.name}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 dark:text-gray-100">{shop.revenue}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{shop.orders}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{shop.employees}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${shop.stockHealth > 80 ? 'bg-emerald-500' : shop.stockHealth > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${shop.stockHealth}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 w-8">{shop.stockHealth}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SECTION 3: REVENUE TRENDS (MOCK CHART) */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Trends</h2>
                <select className="text-sm bg-transparent border-none text-gray-500 dark:text-gray-400 focus:ring-0 cursor-pointer">
                  <option>Last 7 Days</option>
                  <option>This Month</option>
                </select>
              </div>
              <div className="flex-1 flex items-end justify-between gap-2 h-40">
                {[40, 70, 45, 90, 65, 85, 100].map((height, i) => (
                  <div key={i} className="w-full flex flex-col items-center gap-2 group">
                    <div className="w-full bg-[#006970]/10 dark:bg-[#008990]/20 rounded-t-sm relative flex justify-end flex-col h-full">
                      <div 
                        className="w-full bg-[#006970] dark:bg-[#008990] rounded-t-sm transition-all duration-500 group-hover:bg-[#00585e]" 
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 uppercase">D{i+1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: INVENTORY SUMMARY */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Inventory Health</h2>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Active Items</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">8,430</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#006970] dark:bg-[#00B4BB] w-[85%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Low Stock Warnings</span>
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-500">145</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 w-[12%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Out of Stock</span>
                    <span className="text-sm font-semibold text-rose-600 dark:text-rose-500">32</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 w-[3%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {/* SIDE COLUMN (4 cols on lg) */}
        <div className="col-span-12 lg:col-span-4 xl:col-span-4 space-y-6">
          
          {/* SECTION 6: FINANCIAL SNAPSHOT */}
          <div className="bg-gradient-to-br from-[#006970] to-[#004e53] dark:from-[#008990] dark:to-[#004e53] rounded-xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
            <h2 className="text-sm font-medium text-white/80 uppercase tracking-wider mb-4">Financial Snapshot</h2>
            <div className="mb-6">
              <span className="block text-sm text-white/70 mb-1">Net Profit Estimate</span>
              <span className="text-4xl font-bold tracking-tight">Rs. 845K</span>
              <div className="flex items-center gap-1 mt-2 text-sm text-emerald-300">
                <ArrowUpRight className="w-4 h-4" />
                <span>+12.5% vs last month</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
              <div>
                <span className="block text-xs text-white/70 mb-1">Pending Payables</span>
                <span className="font-semibold text-lg text-white">Rs. 120K</span>
              </div>
              <div>
                <span className="block text-xs text-white/70 mb-1">Pending Receivables</span>
                <span className="font-semibold text-lg text-white">Rs. 340K</span>
              </div>
            </div>
          </div>

          {/* SECTION 8: QUICK ACTIONS */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'New Shop', icon: Store },
              { label: 'Add Staff', icon: Users },
              { label: 'Transfer', icon: Box },
              { label: 'Reports', icon: FileBarChart }
            ].map((action, idx) => (
              <button key={idx} className="flex flex-col items-center justify-center gap-2 p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors shadow-sm text-gray-700 dark:text-gray-300">
                <action.icon className="w-5 h-5 text-[#006970] dark:text-[#00B4BB]" />
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            ))}
          </div>

          {/* SECTION 7: NOTIFICATIONS PANEL */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Alerts</h2>
              <span className="flex w-5 h-5 bg-rose-100 text-rose-600 rounded-full items-center justify-center text-xs font-bold">2</span>
            </div>
            <div className="space-y-4">
              {MOCK_ALERTS.map((alert) => (
                <div key={alert.id} className="flex gap-3">
                  <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                    alert.type === 'warning' ? 'bg-amber-500' : 
                    alert.type === 'error' ? 'bg-rose-500' : 
                    alert.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">{alert.title}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: EMPLOYEE ACTIVITY */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Staff Activity</h2>
            <div className="space-y-4">
              {MOCK_ACTIVITIES.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{activity.user.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">{activity.user}</span> <span className="text-gray-500 dark:text-gray-400">{activity.action}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{activity.time} • {activity.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
