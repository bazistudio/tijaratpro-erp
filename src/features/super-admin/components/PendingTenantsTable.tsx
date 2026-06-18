'use client';

import React from 'react';
import { format } from 'date-fns';
import { usePendingTenants } from '../hooks/usePendingTenants';
import { useApproveTenant, useSuspendTenant } from '../hooks/useAdminActions';
import { ActionButtons } from './ActionButtons';

export const PendingTenantsTable = () => {
  const { data: tenants, isLoading, isError } = usePendingTenants();
  const approveTenant = useApproveTenant();
  const suspendTenant = useSuspendTenant();

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center text-red-600">
        Failed to load pending tenants.
      </div>
    );
  }

  if (!tenants || tenants.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center text-gray-500">
        No pending tenants found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Business Name</th>
              <th className="px-6 py-4">Business Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tenants.map((tenant) => (
              <tr key={tenant._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{tenant.name}</td>
                <td className="px-6 py-4 text-gray-600">{tenant.businessType}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 capitalize">
                    {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {format(new Date(tenant.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 flex justify-end">
                  <ActionButtons
                    onApprove={() => approveTenant.mutate(tenant._id)}
                    onSuspend={() => suspendTenant.mutate(tenant._id)}
                    isApproving={approveTenant.isPending && approveTenant.variables === tenant._id}
                    isSuspending={suspendTenant.isPending && suspendTenant.variables === tenant._id}
                    disabled={approveTenant.isPending || suspendTenant.isPending}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
