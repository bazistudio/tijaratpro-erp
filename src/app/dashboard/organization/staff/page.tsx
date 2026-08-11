'use client';

import React from 'react';
import { UserManagement } from '@/features/settings/components/UserManagement';
import { usePermissions } from '@/lib/auth/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { ShieldAlert } from 'lucide-react';

export default function OrganizationStaffPage() {
  const { hasPermission } = usePermissions();
  const canViewUsers = hasPermission(PERMISSIONS.USERS_VIEW);

  if (!canViewUsers) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 mt-12">
        <ShieldAlert className="w-12 h-12 text-danger mx-auto" />
        <h2 className="text-xl font-bold text-text-primary">Access Restricted</h2>
        <p className="text-sm text-text-muted">You do not have permission to view organization staff accounts.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Organization Workforce</h1>
          <p className="text-sm text-text-muted mt-1">Manage employees, invitations, and role assignments across all branches.</p>
        </div>
      </div>
      <UserManagement />
    </div>
  );
}
