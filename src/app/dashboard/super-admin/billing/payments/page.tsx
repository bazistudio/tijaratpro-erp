'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { subscriptionApi, PaymentRequest } from '@/features/super-admin/services/subscription.api';
import { Check, X } from 'lucide-react';

export default function BillingPaymentsPage() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await subscriptionApi.getPaymentRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this payment?')) return;
    try {
      setProcessingId(id);
      await subscriptionApi.approvePayment(id);
      await fetchRequests();
    } catch (err: any) {
      alert('Failed to approve: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (reason === null) return;
    try {
      setProcessingId(id);
      await subscriptionApi.rejectPayment(id, reason);
      await fetchRequests();
    } catch (err: any) {
      alert('Failed to reject: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-red-500 text-center">Error: {error}</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manual Payments</h1>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve manual payment requests for subscriptions.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Organization</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Method</th>
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No payment requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 whitespace-nowrap text-gray-600">
                      {req.paymentDate ? format(new Date(req.paymentDate), 'MMM d, yyyy') : format(new Date(req.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {req.organizationId?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-900">
                      ${req.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-gray-600 uppercase">
                      {req.paymentMethod}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-gray-500">
                      {req.referenceNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${req.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                        ${req.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 flex justify-end gap-2">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(req._id)}
                            disabled={processingId === req._id}
                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                            title="Approve Payment"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(req._id)}
                            disabled={processingId === req._id}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Reject Payment"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
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
