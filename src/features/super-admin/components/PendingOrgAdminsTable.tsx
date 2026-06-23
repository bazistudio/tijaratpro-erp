'use client';

import React from 'react';
import { format } from 'date-fns';
import { usePendingOrgAdmins } from '../hooks/usePendingOrgAdmins';
import { useApproveUser, useSuspendUser } from '../hooks/useAdminActions';
import { ActionButtons } from './ActionButtons';

export const PendingOrgAdminsTable = () => {
  const { data: users, isLoading, isError } = usePendingOrgAdmins();
  const approveUser = useApproveUser();
  const suspendUser = useSuspendUser();

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
        No pending organization approvals
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center text-gray-500">
        No pending organization approvals
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-1.5">Name</th>
              <th className="px-6 py-1.5">Email</th>
              <th className="px-6 py-1.5">Organization Name</th>
              <th className="px-6 py-1.5">Status</th>
              <th className="px-6 py-1.5">Created Date</th>
              <th className="px-6 py-1.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-1.5 font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-1.5 text-gray-600">{user.email}</td>
                <td className="px-6 py-1.5 text-gray-600">{user.tenantName || 'N/A'}</td>
                <td className="px-6 py-1.5">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 capitalize">
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-1.5 text-gray-600">
                  {format(new Date(user.createdAt), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-1.5 flex justify-end">
                  <ActionButtons
                    onApprove={() => approveUser.mutate(user._id)}
                    onSuspend={() => suspendUser.mutate(user._id)}
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
    </div>
  );
};
