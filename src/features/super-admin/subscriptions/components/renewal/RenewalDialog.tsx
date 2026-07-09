'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRenewSubscription, usePackages } from '../../hooks/useSubscriptions';
import { Subscription, Package } from '../../types/subscription.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
}

export const RenewalDialog: React.FC<Props> = ({ isOpen, onClose, subscription }) => {
  const renewMutation = useRenewSubscription();
  const { data: packagesData, isLoading: pkgLoading } = usePackages({ status: 'ACTIVE' });
  const packages: Package[] = packagesData?.data || [];

  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [discountType, setDiscountType] = useState<'FIXED' | 'PERCENTAGE'>('FIXED');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const currentPkg = subscription.packageId as Package;
  const currentExpiry = new Date(subscription.expiryDate);

  // Initialize selected package to current package if possible
  useEffect(() => {
    if (isOpen && currentPkg && currentPkg._id) {
      setSelectedPackageId(currentPkg._id);
    }
  }, [isOpen, currentPkg]);

  const selectedPkg = useMemo(() => {
    return packages.find(p => p._id === selectedPackageId) || currentPkg;
  }, [selectedPackageId, packages, currentPkg]);

  const basePrice = selectedPkg?.price || 0;
  
  const finalPrice = useMemo(() => {
    if (discountType === 'FIXED') {
      return Math.max(0, basePrice - discountValue);
    } else {
      return Math.max(0, basePrice - (basePrice * (discountValue / 100)));
    }
  }, [basePrice, discountType, discountValue]);

  const newExpiry = useMemo(() => {
    if (!selectedPkg) return currentExpiry;
    
    const target = new Date();
    // If it hasn't expired yet, extend from current expiry
    if (currentExpiry > target) {
      target.setTime(currentExpiry.getTime());
    }

    if (selectedPkg.durationType === 'DAYS') {
      target.setDate(target.getDate() + selectedPkg.durationValue);
    } else if (selectedPkg.durationType === 'MONTHS') {
      target.setMonth(target.getMonth() + selectedPkg.durationValue);
    } else if (selectedPkg.durationType === 'YEARS') {
      target.setFullYear(target.getFullYear() + selectedPkg.durationValue);
    }
    return target;
  }, [selectedPkg, currentExpiry]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    try {
      await renewMutation.mutateAsync({
        id: subscription._id,
        data: {
          packageId: selectedPackageId || currentPkg._id,
          discountType,
          discountValue: Number(discountValue),
          notes
        }
      });
      onClose();
      alert(`Subscription renewed successfully. New expiry: ${newExpiry.toLocaleDateString()}`);
    } catch (error) {
      console.error('Failed to renew subscription', error);
      alert('Failed to renew subscription. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Renew Subscription</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {subscription.status === 'SUSPENDED' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Warning:</strong> Subscription is suspended. Renewing will not automatically activate unless approved / resumed manually.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Current Subscription Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Current Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 block">Organization/Owner</span>
                <span className="font-medium">{typeof subscription.ownerId === 'string' ? subscription.ownerId : subscription.ownerId?._id}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Current Package</span>
                <span className="font-medium">{currentPkg?.name}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Current Expiry</span>
                <span className="font-medium">{currentExpiry.toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Remaining Days</span>
                <span className={`font-medium ${subscription.remainingDays <= 0 ? 'text-red-600' : ''}`}>
                  {subscription.remainingDays}
                </span>
              </div>
            </div>
          </div>

          {/* Step 2: Select Renewal Package */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-1">Renew Package</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Select Package</label>
                {pkgLoading ? (
                  <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
                ) : (
                  <select 
                    value={selectedPackageId} 
                    onChange={(e) => setSelectedPackageId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus: bg-white"
                  >
                    {packages.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.durationValue} {p.durationType})</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <span className="block text-sm text-gray-500">Base Price</span>
                <span className="font-medium text-lg">PKR {basePrice}</span>
              </div>
              <div>
                <span className="block text-sm text-gray-500">Duration</span>
                <span className="font-medium">{selectedPkg?.durationValue} {selectedPkg?.durationType}</span>
              </div>
            </div>
          </div>

          {/* Step 3: Discount / Adjustment */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-1">Discount / Adjustment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Discount Type</label>
                <select 
                  value={discountType} 
                  onChange={(e) => setDiscountType(e.target.value as 'FIXED' | 'PERCENTAGE')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus: bg-white"
                >
                  <option value="FIXED">Fixed Amount</option>
                  <option value="PERCENTAGE">Percentage (%)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Discount Value</label>
                <input 
                  type="number" 
                  min="0"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:"
                />
              </div>
              <div className="md:col-span-2 bg-blue-50 p-4 rounded-md flex justify-between items-center">
                <span className="text-sm text-blue-800 font-medium">Final Package Price:</span>
                <span className="text-xl font-bold text-blue-900">PKR {finalPrice}</span>
              </div>
            </div>
          </div>

          {/* Step 4: Expiry Preview */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-1">Expiry Preview</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 p-4 rounded-md text-center">
                <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Current Expiry</span>
                <span className={`font-bold ${currentExpiry < new Date() ? 'text-red-600' : 'text-gray-900'}`}>
                  {currentExpiry.toLocaleDateString()}
                </span>
              </div>
              <div className="bg-green-100 p-4 rounded-md text-center border-2 border-green-200">
                <span className="block text-xs text-green-800 uppercase tracking-wider mb-1">New Expiry</span>
                <span className="font-bold text-green-900">
                  {newExpiry.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Notes (Optional)</label>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:" 
              rows={2}
            />
          </div>
        </div>

        {/* Step 5: Confirmation */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center rounded-b-lg">
          <div className="text-sm text-gray-600">
            <span className="block">Renewing <strong>{selectedPkg?.name}</strong></span>
            <span className="block">Amount: <strong>PKR {finalPrice}</strong></span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={renewMutation.isPending || !selectedPackageId}
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {renewMutation.isPending ? 'Processing...' : 'Confirm Renewal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
