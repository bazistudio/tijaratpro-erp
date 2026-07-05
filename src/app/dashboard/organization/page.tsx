'use client';

import React from 'react';
import { useOrganizationStore } from '@/store/useOrganizationStore';

export default function OrganizationDashboardPage() {
  const { activeOrganization } = useOrganizationStore();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Organization Overview</h1>
      {activeOrganization ? (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">{activeOrganization.name}</h2>
          <p className="text-gray-500">Code: {activeOrganization.code}</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
              <h3 className="font-medium text-gray-500">Total Shops</h3>
              <p className="text-2xl font-bold">...</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
              <h3 className="font-medium text-gray-500">Total Staff</h3>
              <p className="text-2xl font-bold">...</p>
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
              <h3 className="font-medium text-gray-500">Today's Sales</h3>
              <p className="text-2xl font-bold">...</p>
            </div>
          </div>
        </div>
      ) : (
        <p>Loading organization details...</p>
      )}
    </div>
  );
}
