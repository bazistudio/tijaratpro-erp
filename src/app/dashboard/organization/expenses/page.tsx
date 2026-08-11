'use client';

import React, { useEffect, useState } from 'react';
import { 
  ExpenseStatsCards, ExpensesTable, ExpenseCreateModal, 
  ExpenseFilters, useExpensesStore 
} from '@/features/expenses';
import { usePermissions } from '@/lib/auth/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { ReceiptText, Plus, PieChartIcon, Shield } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function OrganizationExpensesPage() {
  const { fetchExpenses, expenses } = useExpensesStore();
  const { hasPermission } = usePermissions();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Aggregate Category Data for Donut Chart
  const categoryChartData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    expenses.forEach((e: any) => {
      const cat = e.category || 'General Operations';
      counts[cat] = (counts[cat] || 0) + (e.amount || 0);
    });

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];
    return Object.entries(counts).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length]
    }));
  }, [expenses]);

  if (!hasPermission(PERMISSIONS.EXPENSES_VIEW) && !hasPermission(PERMISSIONS.FINANCE_VIEW)) {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-xl max-w-2xl mx-auto my-12">
        <Shield className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-text-primary">Access Restricted</h2>
        <p className="text-sm text-text-muted mt-2">
          You do not have permission to view organization expenses.
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
            <ReceiptText className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Organization Expenses</h1>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Monitor, log, and categorize operational expenditures across all organization branches.
          </p>
        </div>
        {hasPermission(PERMISSIONS.EXPENSES_MANAGE) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add Expense
          </button>
        )}
      </div>

      {/* KPI Stats */}
      <ExpenseStatsCards />

      {/* Analytics Chart & Expense Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (Donut Chart) */}
        <div className="lg:col-span-1 bg-surface p-6 rounded-xl border border-border shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieChartIcon className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-text-primary">Expense Categories</h3>
            </div>
            <p className="text-xs text-text-muted">Proportional breakdown by category</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => `Rs. ${Number(value).toLocaleString()}`}
                    contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-text-muted">No expense records found</p>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-border">
            {categoryChartData.slice(0, 4).map((item, i) => (
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

        {/* Expenses List & Filters */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-surface border border-border rounded-xl p-4 shadow-xs">
            <ExpenseFilters />
          </div>
          <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
            <ExpensesTable />
          </div>
        </div>
      </div>

      <ExpenseCreateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

