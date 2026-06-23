'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { usePendingTenants } from '../hooks/usePendingTenants';
import { useApproveTenant, useSuspendTenant } from '../hooks/useAdminActions';
import { ActionButtons } from './ActionButtons';
import { TenantApprovalModal } from './TenantApprovalModal';
import { SecurityVerificationModal } from './SecurityVerificationModal';
import { Tenant } from '../services/admin.api';

export const PendingTenantsTable = () => {
  const { data: tenants, isLoading, isError } = usePendingTenants();
  const approveTenant = useApproveTenant();
  const suspendTenant = useSuspendTenant();

  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const handleApproveClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setApprovalModalOpen(true);
  };

  const handleSuspendClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setSuspendModalOpen(true);
  };

  const onConfirmApprove = (plan: string, password: string) => {
    if (selectedTenant) {
      approveTenant.mutate(
        { tenantId: selectedTenant._id, password, subscriptionPlan: plan },
        {
          onSuccess: () => {
            setApprovalModalOpen(false);
            setSelectedTenant(null);
          }
        }
      );
    }
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
        No pending tenant approvals
      </div>
    );
  }

  if (!tenants || tenants.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center text-gray-500">
        No pending tenant approvals
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
              <th className="px-6 py-1.5">Business Type</th>
              <th className="px-6 py-1.5">Status</th>
              <th className="px-6 py-1.5">Created Date</th>
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
                <td className="px-6 py-1.5 text-gray-600">{tenant.businessType}</td>
                <td className="px-6 py-1.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 capitalize">
                    {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-1.5 text-gray-600">
                  {format(new Date(tenant.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-1.5 flex justify-end">
                  <ActionButtons
                    onApprove={() => handleApproveClick(tenant)}
                    onSuspend={() => handleSuspendClick(tenant)}
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

      <TenantApprovalModal
        isOpen={approvalModalOpen}
        onClose={() => {
          setApprovalModalOpen(false);
          setSelectedTenant(null);
        }}
        onConfirm={onConfirmApprove}
        tenant={selectedTenant}
        isProcessing={approveTenant.isPending}
      />

      <SecurityVerificationModal
        isOpen={suspendModalOpen}
        onClose={() => {
          setSuspendModalOpen(false);
          setSelectedTenant(null);
        }}
        onConfirm={onConfirmSuspend}
        title="Suspend Tenant Request"
        message={`Are you sure you want to suspend the request for ${selectedTenant?.name}?`}
        actionLabel="Suspend"
        isProcessing={suspendTenant.isPending}
      />
    </div>
  );
};
