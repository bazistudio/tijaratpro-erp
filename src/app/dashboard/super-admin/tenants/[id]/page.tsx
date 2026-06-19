'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/features/super-admin/services/admin.api';
import { format, differenceInDays } from 'date-fns';
import { ArrowLeft, Building2, Calendar, Mail, Phone, Clock, Ban, Trash2, RefreshCw } from 'lucide-react';
import { SecurityVerificationModal } from '@/features/super-admin/components/SecurityVerificationModal';
import { useSuspendTenant, useRestoreTenant, useDeleteTenant } from '@/features/super-admin/hooks/useAdminActions';

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;

  const { data: tenant, isLoading, isError } = useQuery({
    queryKey: ['admin', 'tenant', tenantId],
    queryFn: () => adminApi.getTenantById(tenantId),
  });

  const suspendTenant = useSuspendTenant();
  const restoreTenant = useRestoreTenant();
  const deleteTenant = useDeleteTenant();

  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const onConfirmSuspend = (password: string) => {
    suspendTenant.mutate({ tenantId, password }, { onSuccess: () => setSuspendModalOpen(false) });
  };
  const onConfirmRestore = (password: string) => {
    restoreTenant.mutate({ tenantId, password }, { onSuccess: () => setRestoreModalOpen(false) });
  };
  const onConfirmDelete = (password: string) => {
    deleteTenant.mutate({ tenantId, password }, { onSuccess: () => router.push('/dashboard/super-admin/active-tenants') });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  if (isError || !tenant) {
    return <div className="text-center p-8 text-red-600">Failed to load tenant details.</div>;
  }

  const daysRemaining = tenant.subscriptionEnd ? differenceInDays(new Date(tenant.subscriptionEnd), new Date()) : 0;
  const isExpired = daysRemaining < 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
          <p className="text-sm text-gray-500">Tenant ID: {tenant._id}</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium capitalize ${
          tenant.status === 'active' ? 'bg-green-100 text-green-800' :
          tenant.status === 'suspended' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {tenant.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Business Details
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Type</span><span className="font-medium text-gray-900">{tenant.businessType}</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Owner Email</span><span className="font-medium text-gray-900">{tenant.ownerEmail || 'N/A'}</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Owner Phone</span><span className="font-medium text-gray-900">{tenant.ownerPhone || 'N/A'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Created At</span><span className="font-medium text-gray-900">{format(new Date(tenant.createdAt), 'MMM d, yyyy')}</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Subscription Details
          </h2>
          {tenant.subscriptionPlan ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Plan</span><span className="font-medium text-gray-900 capitalize">{tenant.subscriptionPlan}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Start Date</span><span className="font-medium text-gray-900">{format(new Date(tenant.subscriptionStart!), 'MMM d, yyyy')}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-500">End Date</span><span className="font-medium text-gray-900">{format(new Date(tenant.subscriptionEnd!), 'MMM d, yyyy')}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                  {isExpired ? 'Expired' : `${daysRemaining} days remaining`}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No active subscription plan.</p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Lifecycle Actions</h2>
        <div className="flex gap-4">
          {tenant.status === 'active' && (
            <button onClick={() => setSuspendModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-medium transition-colors border border-red-200">
              <Ban className="w-4 h-4" /> Suspend Tenant
            </button>
          )}
          {tenant.status === 'suspended' && (
            <button onClick={() => setRestoreModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition-colors border border-green-200">
              <RefreshCw className="w-4 h-4" /> Restore Tenant
            </button>
          )}
          {(tenant.status === 'active' || tenant.status === 'suspended') && (
            <button onClick={() => setDeleteModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors">
              <Trash2 className="w-4 h-4" /> Delete Tenant
            </button>
          )}
        </div>
      </div>

      <SecurityVerificationModal isOpen={suspendModalOpen} onClose={() => setSuspendModalOpen(false)} onConfirm={onConfirmSuspend} title="Suspend Tenant" message={`Are you sure you want to suspend ${tenant.name}?`} actionLabel="Suspend" isProcessing={suspendTenant.isPending} />
      <SecurityVerificationModal isOpen={restoreModalOpen} onClose={() => setRestoreModalOpen(false)} onConfirm={onConfirmRestore} title="Restore Tenant" message={`Are you sure you want to restore ${tenant.name}?`} actionLabel="Restore" isProcessing={restoreTenant.isPending} />
      <SecurityVerificationModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={onConfirmDelete} title="Delete Tenant" message={`Are you sure you want to delete ${tenant.name}? This action cannot be undone.`} actionLabel="Delete Forever" isProcessing={deleteTenant.isPending} />
    </div>
  );
}
