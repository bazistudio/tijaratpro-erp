'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { useSuspendedTenants } from '../hooks/useSuspendedTenants';
import { useRestoreTenant, useDeleteTenant } from '../hooks/useAdminActions';
import { SecurityVerificationModal } from './SecurityVerificationModal';
import { Tenant } from '../services/admin.api';
import { RefreshCw, Trash2 } from 'lucide-react';

export const SuspendedTenantsTable = () => {
  const { data: tenants, isLoading, isError } = useSuspendedTenants();
  const restoreTenant = useRestoreTenant();
  const deleteTenant = useDeleteTenant();

  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const handleRestoreClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setRestoreModalOpen(true);
  };

  const handleDeleteClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDeleteModalOpen(true);
  };

  const onConfirmRestore = (password: string) => {
    if (selectedTenant) {
      restoreTenant.mutate(
        { tenantId: selectedTenant._id, password },
        {
          onSuccess: () => {
            setRestoreModalOpen(false);
            setSelectedTenant(null);
          }
        }
      );
    }
  };

  const onConfirmDelete = (password: string) => {
    if (selectedTenant) {
      deleteTenant.mutate(
        { tenantId: selectedTenant._id, password },
        {
          onSuccess: () => {
            setDeleteModalOpen(false);
            setSelectedTenant(null);
          }
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !tenants || tenants.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center text-gray-500">
        No suspended tenants found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-1.5">Business Name</th>
              <th className="px-6 py-1.5">Contact Details</th>
              <th className="px-6 py-1.5">Suspended At</th>
              <th className="px-6 py-1.5">Status</th>
              <th className="px-6 py-1.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tenants.map((tenant) => (
              <tr key={tenant._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-1.5 font-medium text-gray-900">{tenant.name}</td>
                <td className="px-6 py-1.5">
                  <div className="flex flex-col text-sm">
                    <span className="text-gray-900">{tenant.ownerEmail || 'N/A'}</span>
                    <span className="text-gray-500">{tenant.ownerPhone || 'N/A'}</span>
                    {tenant.v1PlainPassword && (
                      <span className="text-blue-600 font-mono text-xs mt-1">Pass: {tenant.v1PlainPassword}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-1.5 text-gray-600">
                  {tenant.suspendedAt ? format(new Date(tenant.suspendedAt), 'MMM d, yyyy') : 'N/A'}
                </td>
                <td className="px-6 py-1.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 capitalize">
                    {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-1.5 flex justify-end gap-2">
                  <button
                    onClick={() => handleRestoreClick(tenant)}
                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Restore Tenant"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(tenant)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Tenant"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SecurityVerificationModal
        isOpen={restoreModalOpen}
        onClose={() => {
          setRestoreModalOpen(false);
          setSelectedTenant(null);
        }}
        onConfirm={onConfirmRestore}
        title="Restore Suspended Tenant"
        message={`Are you sure you want to restore ${selectedTenant?.name}? This will instantly unblock all users.`}
        actionLabel="Restore"
        isProcessing={restoreTenant.isPending}
      />

      <SecurityVerificationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedTenant(null);
        }}
        onConfirm={onConfirmDelete}
        title="Delete Tenant (Danger)"
        message={`Are you sure you want to delete ${selectedTenant?.name}? This action cannot be undone.`}
        actionLabel="Delete Forever"
        isProcessing={deleteTenant.isPending}
      />
    </div>
  );
};
