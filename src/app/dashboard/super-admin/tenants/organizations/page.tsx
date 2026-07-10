'use client';

import React, { useState } from 'react';
import { ActiveTenantsTable } from '@/features/super-admin/components/ActiveTenantsTable';
import { SuspendedTenantsTable } from '@/features/super-admin/components/SuspendedTenantsTable';

export default function OrganizationsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'suspended'>('active');

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all registered organizations in the system.
        </p>
      </div>

      <div className="bg-white border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`${
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('suspended')}
            className={`${
              activeTab === 'suspended'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Suspended
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'active' ? (
          <ActiveTenantsTable filterAccountType="ORGANIZATION" />
        ) : (
          <SuspendedTenantsTable filterAccountType="ORGANIZATION" />
        )}
      </div>
    </div>
  );
}
