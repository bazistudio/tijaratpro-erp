import React from 'react';
import { UserManagement } from '@/features/settings/components/UserManagement';

export default function UsersSettingsPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Workforce & Access
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Manage staff accounts and monitor their system access.
        </p>
      </div>

      <UserManagement />
    </div>
  );
}
