'use client';

import React from 'react';
import { format } from 'date-fns';
import { useAuditLogs } from '@/features/super-admin/hooks/useAuditLogs';

export default function AuditTimelinePage() {
  const { data, isLoading, isError } = useAuditLogs(100, 1);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 text-red-500 text-center">
        Failed to load audit timeline.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Timeline</h1>
        <p className="mt-1 text-sm text-gray-500">
          Global event log across all tenants and users.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Event</th>
                <th className="px-6 py-3">Resource</th>
                <th className="px-6 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No events found.
                  </td>
                </tr>
              ) : (
                data.data.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap text-gray-600">
                      {format(new Date(log.createdAt), 'dd-MMM-yy HH:mm:ss')}
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-900">{log.userId?.name || 'System'}</div>
                      <div className="text-xs text-gray-500">{log.userId?.email || ''}</div>
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-xs">
                      {log.userId?.role || '-'}
                    </td>
                    <td className="px-6 py-3 font-medium text-blue-700">
                      {log.action}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {log.resource}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-gray-500 break-all max-w-xs">
                      {log.metadata ? JSON.stringify(log.metadata) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
