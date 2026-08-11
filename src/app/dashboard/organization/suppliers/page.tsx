'use client';

import React from 'react';
import { SuppliersTab } from '@/features/suppliers/components/SuppliersTab';
import { usePermissions } from '@/lib/auth/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { Truck, Shield } from 'lucide-react';

export default function OrganizationSuppliersPage() {
  const { hasPermission } = usePermissions();

  if (!hasPermission(PERMISSIONS.PARTIES_VIEW)) {
    return (
      <div className="p-8 text-center bg-surface border border-border rounded-xl max-w-2xl mx-auto my-12">
        <Shield className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-text-primary">Access Restricted</h2>
        <p className="text-sm text-text-muted mt-2">
          You do not have permission to view organization suppliers.
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
            <Truck className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Organization Suppliers</h1>
          </div>
          <p className="text-sm text-text-muted mt-1">
            Manage vendor & supplier accounts, purchase ledgers, and payables across all branches.
          </p>
        </div>
      </div>

      {/* Main Suppliers Feature Component */}
      <div className="bg-surface border border-border rounded-xl p-4 sm:p-6 shadow-xs">
        <SuppliersTab />
      </div>
    </div>
  );
}

