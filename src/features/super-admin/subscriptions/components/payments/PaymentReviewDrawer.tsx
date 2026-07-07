import React, { useState } from 'react';
import { useApprovePaymentRequest, useRejectPaymentRequest } from '../../../hooks/useSubscriptions';
import { PaymentRequest } from '../../../types/subscription.types';
import { PaymentStatusBadge } from './PaymentStatusBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  request: PaymentRequest | null;
}

export const PaymentReviewDrawer: React.FC<Props> = ({ isOpen, onClose, request }) => {
  const approveMutation = useApprovePaymentRequest();
  const rejectMutation = useRejectPaymentRequest();
  
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  if (!isOpen || !request) return null;

  const pkg = request.packageId as any;

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(request._id);
      alert('Payment approved successfully. Subscription extended.');
      onClose();
    } catch (err) {
      console.error('Failed to approve payment', err);
      alert('Failed to approve payment');
    }
  };

  const handleReject = async () => {
    if (!rejectReason) return;
    try {
      await rejectMutation.mutateAsync({ id: request._id, reason: rejectReason });
      alert('Payment rejected.');
      setIsRejecting(false);
      setRejectReason('');
      onClose();
    } catch (err) {
      console.error('Failed to reject payment', err);
      alert('Failed to reject payment');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      <section className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md transform transition-transform ease-in-out duration-300">
          <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
            <div className="px-4 py-6 bg-gray-50 sm:px-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-gray-900">Payment Request Details</h2>
                <button
                  onClick={onClose}
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span className="sr-only">Close panel</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 py-6 px-4 sm:px-6 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <PaymentStatusBadge status={request.status} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Submitted Date</p>
                  <p className="font-medium text-gray-900">{new Date(request.submittedAt || request.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Organization / Shop</p>
                  <p className="font-medium text-gray-900">{typeof request.ownerId === 'string' ? request.ownerId : request.ownerId?._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Package Requested</p>
                  <p className="font-medium text-gray-900">{pkg?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-bold text-gray-900">PKR {request.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium text-gray-900">{request.paymentMethod}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-mono text-gray-900 bg-gray-100 p-2 rounded text-sm break-all">{request.transactionReference}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Screenshot</p>
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center overflow-hidden">
                  {request.screenshotUrl ? (
                    <img src={request.screenshotUrl} alt="Payment Screenshot" className="max-h-full object-contain" />
                  ) : (
                    <span className="text-gray-400">No screenshot provided</span>
                  )}
                </div>
              </div>

              {request.status === 'PENDING' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                  <textarea 
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    rows={3}
                    placeholder="Optional notes to attach to approval/rejection"
                  />
                </div>
              )}
              
              {request.status !== 'PENDING' && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm text-gray-500">Admin Notes</p>
                  <p className="text-sm text-gray-900">{request.adminNotes || request.notes || 'None'}</p>
                  {request.reviewedBy && (
                    <p className="text-xs text-gray-400 mt-2">
                      Reviewed by {typeof request.reviewedBy === 'string' ? request.reviewedBy : request.reviewedBy?._id} on {request.reviewedAt ? new Date(request.reviewedAt).toLocaleDateString() : ''}
                    </p>
                  )}
                </div>
              )}
            </div>

            {request.status === 'PENDING' && (
              <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 bg-gray-50 space-y-4">
                {isRejecting ? (
                  <div className="bg-white p-4 border border-red-200 rounded-md">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Rejection *</label>
                    <textarea 
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full border-gray-300 rounded-md sm:text-sm mb-3"
                      rows={2}
                      required
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setIsRejecting(false)} 
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleReject}
                        disabled={!rejectReason || rejectMutation.isPending}
                        className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
                      >
                        {rejectMutation.isPending ? 'Processing...' : 'Confirm Reject'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(true)}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={approveMutation.isPending}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {approveMutation.isPending ? 'Processing...' : 'Approve Payment'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
