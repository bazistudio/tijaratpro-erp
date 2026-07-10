import React from 'react';
import { OrganizationRequestsTable } from '@/features/super-admin/components/OrganizationRequestsTable';

export default function OnboardingRequestsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Onboarding Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review, approve, or reject new organization signups.
        </p>
      </div>

      <OrganizationRequestsTable />
    </div>
  );
}
