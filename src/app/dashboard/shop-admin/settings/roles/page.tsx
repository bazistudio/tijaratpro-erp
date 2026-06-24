import React from 'react';
import { RolePermissionMatrix } from '@/features/settings/components/RolePermissionMatrix';

export default function RolesSettingsPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Roles & Access Policy
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Define access control behavior for all system roles globally.
        </p>
      </div>

      <RolePermissionMatrix />
    </div>
  );
}
