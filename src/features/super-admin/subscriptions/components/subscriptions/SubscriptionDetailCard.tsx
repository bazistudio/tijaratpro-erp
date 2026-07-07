'use client';
import React, { useState } from 'react';
import { useSubscription, useSubscriptionHistory, useSuspendSubscription, useResumeSubscription } from '../../hooks/useSubscriptions';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';
import { RenewalDialog } from '../renewal/RenewalDialog';

interface Props {
  subscriptionId: string;
}

export const SubscriptionDetailCard: React.FC<Props> = ({ subscriptionId }) => {
  const { data: subscriptionRes, isLoading: subLoading } = useSubscription(subscriptionId);
  const { data: historyRes, isLoading: histLoading } = useSubscriptionHistory(subscriptionId);
  
  const suspendMutation = useSuspendSubscription();
  const resumeMutation = useResumeSubscription();
  
  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showRenewalDialog, setShowRenewalDialog] = useState(false);

  const sub = subscriptionRes?.data;
  const history = historyRes?.data || [];

  if (subLoading || histLoading) {
    return <div className="p-6 animate-pulse bg-white rounded shadow h-64"></div>;
  }

  if (!sub) {
    return <div className="p-6 bg-white rounded shadow text-red-500">Subscription not found.</div>;
  }

  const pkg = sub.packageId || {};

  const handleSuspend = async () => {
    if (!suspendReason) return;
    await suspendMutation.mutateAsync({ id: sub._id, reason: suspendReason });
    setShowSuspendModal(false);
    setSuspendReason('');
  };

  const handleResume = async () => {
    if (window.confirm("Are you sure you want to resume this subscription?")) {
      await resumeMutation.mutateAsync(sub._id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {sub.ownerType === 'ORGANIZATION' ? 'Organization' : 'Shop'} Details
            </h2>
            <p className="text-gray-500 text-sm">Owner ID: {typeof sub.ownerId === 'string' ? sub.ownerId : sub.ownerId?._id}</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowRenewalDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium text-sm"
            >
              Renew Subscription
            </button>
            <button className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded font-medium text-sm">
              Change Package
            </button>
            {sub.status === 'SUSPENDED' ? (
              <button onClick={handleResume} disabled={resumeMutation.isPending} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium text-sm">
                Resume
              </button>
            ) : (
              <button onClick={() => setShowSuspendModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium text-sm">
                Suspend
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6 border-t pt-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Package</p>
            <p className="font-semibold text-gray-900">{pkg.name || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Price</p>
            <p className="font-semibold text-gray-900">PKR {sub.subscriptionPrice || pkg.price || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Status</p>
            <SubscriptionStatusBadge status={sub.status} />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Remaining</p>
            <p className={`font-semibold ${sub.remainingDays <= 7 ? 'text-red-600' : 'text-green-600'}`}>
              {sub.remainingDays} Days
            </p>
            <p className="text-xs text-gray-400 mt-1">Expires {new Date(sub.expiryDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Modules Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Enabled Modules</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {pkg.enabledModules?.map((mod: string) => (
            <div key={mod} className="flex items-center text-sm text-gray-700">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {mod}
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Timeline</h3>
        <div className="space-y-6">
          {history.map((event: any) => (
            <div key={event._id} className="flex">
              <div className="flex flex-col items-center mr-4">
                <div className="h-full w-px bg-gray-200"></div>
                <div className="h-3 w-3 rounded-full bg-blue-500 -mt-1 ring-4 ring-white"></div>
              </div>
              <div className="pb-6">
                <p className="text-sm font-medium text-gray-900">{event.action}</p>
                <p className="text-xs text-gray-500">{new Date(event.createdAt).toLocaleString()}</p>
                {event.notes && <p className="text-sm text-gray-600 mt-1">{event.notes}</p>}
                {event.newPrice !== undefined && (
                  <p className="text-xs text-gray-500 mt-1">Price updated to PKR {event.newPrice}</p>
                )}
              </div>
            </div>
          ))}
          {history.length === 0 && <p className="text-gray-500 text-sm">No historical events found.</p>}
        </div>
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-bold mb-4">Suspend Subscription</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for suspension</label>
            <textarea 
              value={suspendReason} 
              onChange={(e) => setSuspendReason(e.target.value)}
              className="w-full border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 mb-4" 
              rows={3} 
              required
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowSuspendModal(false)} className="text-gray-600 hover:underline">Cancel</button>
              <button 
                onClick={handleSuspend} 
                disabled={!suspendReason || suspendMutation.isPending} 
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                {suspendMutation.isPending ? 'Suspending...' : 'Confirm Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renewal Dialog */}
      {showRenewalDialog && (
        <RenewalDialog 
          isOpen={showRenewalDialog} 
          onClose={() => setShowRenewalDialog(false)} 
          subscription={sub} 
        />
      )}
    </div>
  );
};
