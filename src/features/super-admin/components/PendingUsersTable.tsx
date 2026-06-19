'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { usePendingUsers } from '../hooks/usePendingUsers';
import { useApproveUser, useSuspendUser } from '../hooks/useAdminActions';
import { ActionButtons } from './ActionButtons';
import { SecurityVerificationModal } from './SecurityVerificationModal';
import { PendingAdmin } from '../services/admin.api';

export const PendingUsersTable = () => {
  const { data: users, isLoading, isError } = usePendingUsers();
  const approveUser = useApproveUser();
  const suspendUser = useSuspendUser();

  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PendingAdmin | null>(null);

  const handleApproveClick = (user: PendingAdmin) => {
    setSelectedUser(user);
    setApprovalModalOpen(true);
  };

  const handleSuspendClick = (user: PendingAdmin) => {
    setSelectedUser(user);
    setSuspendModalOpen(true);
  };

  const onConfirmApprove = (password: string) => {
    if (selectedUser) {
      approveUser.mutate(
        { userId: selectedUser._id, password },
        {
          onSuccess: () => {
            setApprovalModalOpen(false);
            setSelectedUser(null);
          }
        }
      );
    }
  };

  const onConfirmSuspend = (password: string) => {
    if (selectedUser) {
      suspendUser.mutate(
        { userId: selectedUser._id, password },
        {
          onSuccess: () => {
            setSuspendModalOpen(false);
            setSelectedUser(null);
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
        No pending shop admin approvals
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center text-gray-500">
        No pending shop admin approvals
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Contact Details</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Tenant</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col text-sm">
                    <span className="text-gray-900">{user.email}</span>
                    <span className="text-gray-500">{user.phone || 'N/A'}</span>
                    {user.v1PlainPassword && (
                      <span className="text-blue-600 font-mono text-xs mt-1">Pass: {user.v1PlainPassword}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{user.tenantName || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 capitalize">
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {format(new Date(user.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 flex justify-end">
                  <ActionButtons
                    onApprove={() => handleApproveClick(user)}
                    onSuspend={() => handleSuspendClick(user)}
                    isApproving={approveUser.isPending && approveUser.variables === user._id}
                    isSuspending={suspendUser.isPending && suspendUser.variables === user._id}
                    disabled={approveUser.isPending || suspendUser.isPending}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SecurityVerificationModal
        isOpen={approvalModalOpen}
        onClose={() => {
          setApprovalModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={onConfirmApprove}
        title="Approve Shop Admin"
        message={`Are you sure you want to approve ${selectedUser?.name}?`}
        actionLabel="Approve Admin"
        isProcessing={approveUser.isPending}
      />

      <SecurityVerificationModal
        isOpen={suspendModalOpen}
        onClose={() => {
          setSuspendModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={onConfirmSuspend}
        title="Suspend Shop Admin Request"
        message={`Are you sure you want to suspend the request for ${selectedUser?.name}?`}
        actionLabel="Suspend"
        isProcessing={suspendUser.isPending}
      />
    </div>
  );
};
