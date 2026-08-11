'use client';

import React from 'react';
import { RoleAccessPage } from '@/features/settings/components/RoleAccessPage';
import { usePermissions } from '@/lib/auth/usePermissions';
import { PERMISSIONS } from '@/constants/permissions';
import { ShieldAlert } from 'lucide-react';

export default function OrganizationRolesPage() {
  const { hasPermission } = usePermissions();
  const canManageRoles = hasPermission(PERMISSIONS.ORG_SETTINGS_MANAGE);

  if (!canManageRoles) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 mt-12">
        <ShieldAlert className="w-12 h-12 text-danger mx-auto" />
        <h2 className="text-xl font-bold text-text-primary">Access Restricted</h2>
        <p className="text-sm text-text-muted">You do not have permission to view or manage organization roles and permissions.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <RoleAccessPage />
    </div>
  );
}
