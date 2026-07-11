'use client';

import React, { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import { useActiveTenants } from '../hooks/useActiveTenants';
import { useSuspendTenant, useHardDeleteTenant } from '../hooks/useAdminActions';
import { SecurityVerificationModal } from './SecurityVerificationModal';
import { EditTenantModal } from './EditTenantModal';
import { Tenant } from '../services/admin.api';
import { Ban, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { getRequests, OrganizationRequest } from '@/lib/api/organization-requests.api';


export const ActiveTenantsTable = ({ filterAccountType }: { filterAccountType?: 'SINGLE_SHOP' | 'ORGANIZATION' }) => {
  const { data: allTenants, isLoading: isTenantsLoading, isError } = useActiveTenants();
  const suspendTenant = useSuspendTenant();
  const deleteTenant = useHardDeleteTenant();

  const [requests, setRequests] = useState<OrganizationRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  React.useEffect(() => {
    if (filterAccountType) {
      setIsLoadingRequests(true);
      getRequests()
        .then(setRequests)
        .catch(console.error)
        .finally(() => setIsLoadingRequests(false));
    }
  }, [filterAccountType]);

  const isLoading = isTenantsLoading || isLoadingRequests;

  // Temporary client-side filtering until backend adds dedicated endpoints
  const tenants = allTenants?.filter(tenant => {
    if (!filterAccountType) return true;
    
    // Cross-reference with requests to determine accountType since V1 Tenant doesn't have it
    const req = requests.find(r => r.name === tenant.name);
    const accountType = (tenant as any).accountType || req?.accountType || 'SINGLE_SHOP';
    
    return accountType === filterAccountType;
  });

  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const handleEditClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setEditModalOpen(true);
  };

  const handleSuspendClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setSuspendModalOpen(true);
  };

  const onConfirmSuspend = (password: string) => {
    if (selectedTenant) {
      suspendTenant.mutate(
        { tenantId: selectedTenant._id, password },
        {
          onSuccess: () => {
            setSuspendModalOpen(false);
            setSelectedTenant(null);
          }
        }
      );
    }
  };

  const handleDeleteClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setDeleteModalOpen(true);
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
        No active tenants found.
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
              <th className="px-6 py-1.5">Plan</th>
              <th className="px-6 py-1.5">Status</th>
              <th className="px-6 py-1.5">Expires</th>
              <th className="px-6 py-1.5">Duration Left</th>
              <th className="px-6 py-1.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tenants.map((tenant) => (
              <tr key={tenant._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-1.5 font-medium text-gray-900">
                  <Link href={`/dashboard/super-admin/tenants/${tenant._id}`} className="hover:text-blue-600 hover:underline">
                    {tenant.name}
                  </Link>
                </td>
                <td className="px-6 py-1.5">
                  <div className="flex flex-col text-sm">
                    <span className="text-gray-900">{tenant.ownerEmail || 'N/A'}</span>
                    <span className="text-gray-500">{tenant.ownerPhone || 'N/A'}</span>
                    {tenant.v1PlainPassword && (
                      <span className="text-blue-600 font-mono text-xs mt-1">Pass: {tenant.v1PlainPassword}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-1.5 text-gray-600 capitalize">{tenant.subscriptionPlan || 'N/A'}</td>
                <td className="px-6 py-1.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                    {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-1.5 text-gray-600">
                  {tenant.subscriptionEnd ? format(new Date(tenant.subscriptionEnd), 'MMM d, yyyy') : 'N/A'}
                </td>
                <td className="px-6 py-1.5 font-medium">
                  {tenant.subscriptionEnd ? (
                    <span className={differenceInDays(new Date(tenant.subscriptionEnd), new Date()) <= 5 ? "text-red-600" : "text-green-600"}>
                      {differenceInDays(new Date(tenant.subscriptionEnd), new Date())} days remaining
                    </span>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-6 py-1.5 flex justify-end gap-2">
                  <button
                    onClick={() => handleEditClick(tenant)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit Organization"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSuspendClick(tenant)}
                    className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                    title="Suspend Tenant"
                    disabled={suspendTenant.isPending || deleteTenant.isPending}
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(tenant)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete Permanently"
                    disabled={suspendTenant.isPending || deleteTenant.isPending}
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
        isOpen={suspendModalOpen}
        onClose={() => {
          setSuspendModalOpen(false);
          setSelectedTenant(null);
        }}
        onConfirm={onConfirmSuspend}
        title="Suspend Active Tenant"
        message={`Are you sure you want to suspend ${selectedTenant?.name}? This will instantly block all access.`}
        actionLabel="Suspend"
        isProcessing={suspendTenant.isPending}
      />

      <SecurityVerificationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedTenant(null);
        }}
        onConfirm={onConfirmDelete}
        title="Permanently Delete Tenant"
        message={`WARNING: This will permanently delete active tenant ${selectedTenant?.name} and ALL associated data (users, products, sales, etc). This cannot be undone. Type your password to confirm.`}
        actionLabel="Delete Permanently"
        isProcessing={deleteTenant.isPending}
      />

      <EditTenantModal
        tenant={selectedTenant}
        isOpen={editModalOpen}
        showBranchCapacity={filterAccountType === 'ORGANIZATION'}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedTenant(null);
        }}
      />
    </div>
  );
};
