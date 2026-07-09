import React, { useState } from 'react';
import { Eye, EyeOff, CheckCircle2, AlertTriangle, Building2, Calendar } from 'lucide-react';
import { Tenant } from '../services/admin.api';

import { usePackages } from '../subscriptions/hooks/useSubscriptions';
import { SubscriptionCustomizationPanel, SubscriptionCustomizationData } from '../subscriptions/components/subscriptions/SubscriptionCustomizationPanel';
import { Package } from '../subscriptions/types/subscription.types';

interface TenantApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (packageId: string, customization: SubscriptionCustomizationData, password: string) => void;
  tenant: { _id: string; name: string; businessType?: string } | null;
  isProcessing?: boolean;
}

export const TenantApprovalModal: React.FC<TenantApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tenant,
  isProcessing = false
}) => {
  const { data: packagesData, isLoading: isLoadingPackages } = usePackages({ status: 'ACTIVE' });
  const packages: Package[] = packagesData?.data || [];

  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [customizationData, setCustomizationData] = useState<SubscriptionCustomizationData>({});
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const selectedPackage = packages.find((p) => p._id === selectedPackageId) || null;

  if (!isOpen || !tenant) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackageId) {
      setError('Please select a package first.');
      return;
    }
    if (!password.trim()) {
      setError('Super Admin password is required to approve tenants.');
      return;
    }
    setError('');
    onConfirm(selectedPackageId, customizationData, password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
        <div className="p-6 border-b border-gray-100 bg-blue-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Approve Tenant</h2>
              <p className="text-sm text-gray-600 mt-1">Review details and assign a subscription plan.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tenant Details */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-3 text-gray-700 font-medium">
              <Building2 className="w-4 h-4 text-blue-600" />
              Tenant Information
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Business Name</p>
                <p className="font-medium text-gray-900">{tenant.name}</p>
              </div>
              <div>
                <p className="text-gray-500">Business Type</p>
                <p className="font-medium text-gray-900">{tenant.businessType}</p>
              </div>
            </div>
          </div>

          {/* Plan Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4 text-blue-600" />
              Select Base Package
            </label>
            {isLoadingPackages ? (
              <div className="text-sm text-gray-500">Loading packages...</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {packages.map((pkg) => (
                  <button
                    key={pkg._id}
                    type="button"
                    onClick={() => setSelectedPackageId(pkg._id)}
                    className={`p-3 text-left border rounded-xl transition-all ${
                      selectedPackageId === pkg._id
                        ? ' bg-blue-50 ring-1 ring-blue-600'
                        : 'border-gray-200 hover: hover:bg-gray-50'
                    }`}
                  >
                    <p className={`font-medium ${selectedPackageId === pkg._id ? 'text-blue-900' : 'text-gray-900'}`}>
                      {pkg.name}
                    </p>
                    <p className={`text-xs mt-1 ${selectedPackageId === pkg._id ? 'text-blue-600' : 'text-gray-500'}`}>
                      Valid for {pkg.durationValue} {pkg.durationType}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customization Panel */}
          {selectedPackage && (
            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Customize Before Activation</h3>
              <SubscriptionCustomizationPanel 
                basePackage={selectedPackage}
                onChange={setCustomizationData}
              />
            </div>
          )}

          {/* Password Verification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Super Admin Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus: transition-colors"
                placeholder="Enter password to authorize..."
                disabled={isProcessing}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !password}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isProcessing && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              Approve Tenant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
