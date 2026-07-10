import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertTriangle, Building2, Calendar, Settings, ShieldCheck, Check, CheckCircle2 } from 'lucide-react';
import { format, addDays, addMonths, addYears } from 'date-fns';

interface TenantApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: any, password: string) => void;
  tenant: any | null;
  isProcessing?: boolean;
}

const DURATIONS = [
  { id: 'trial-15', label: '15 Days', value: 15, unit: 'DAYS', type: 'Free Trial' },
  { id: 'monthly-1', label: '1 Month', value: 1, unit: 'MONTHS', type: 'Monthly' },
  { id: 'yearly-1', label: '1 Year', value: 1, unit: 'YEARS', type: 'Yearly' },
  { id: 'yearly-2', label: '2 Years', value: 2, unit: 'YEARS', type: 'Yearly' },
  { id: 'yearly-3', label: '3 Years', value: 3, unit: 'YEARS', type: 'Yearly' },
  { id: 'yearly-5', label: '5 Years', value: 5, unit: 'YEARS', type: 'Yearly' }
];

export const TenantApprovalModal: React.FC<TenantApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  tenant,
  isProcessing = false
}) => {
  const [selectedDurationId, setSelectedDurationId] = useState<string>('yearly-1');
  const [maxBranches, setMaxBranches] = useState<number>(5);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setSelectedDurationId('yearly-1');
      if (tenant?.accountType === 'SINGLE_SHOP') {
        setMaxBranches(1);
      } else {
        setMaxBranches(5);
      }
    }
  }, [isOpen, tenant]);

  if (!isOpen || !tenant) return null;

  const selectedDuration = DURATIONS.find(d => d.id === selectedDurationId);
  const isSingleShop = tenant.accountType === 'SINGLE_SHOP' || tenant.accountType === undefined;

  let expiryDate = new Date();
  if (selectedDuration) {
    if (selectedDuration.unit === 'DAYS') expiryDate = addDays(new Date(), selectedDuration.value);
    if (selectedDuration.unit === 'MONTHS') expiryDate = addMonths(new Date(), selectedDuration.value);
    if (selectedDuration.unit === 'YEARS') expiryDate = addYears(new Date(), selectedDuration.value);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDuration) {
      setError('Please select a subscription duration.');
      return;
    }
    if (!password.trim()) {
      setError('Super Admin password is required.');
      return;
    }
    
    setError('');
    const payload = {
      durationValue: selectedDuration.value,
      durationUnit: selectedDuration.unit,
      maxBranches: isSingleShop ? 1 : maxBranches,
      subscriptionMode: 'MANUAL',
      // Provide dummy packageId just in case backend still expects it strictly, though user said not to redesign backend
      // We will pass CUSTOM to let backend know it's a custom manual activation
      packageId: 'CUSTOM', 
      limits: {
        maxBranches: isSingleShop ? 1 : maxBranches,
        maxUsers: 100, // Safe default limits
        maxProducts: 100000,
        storageLimitMB: 5000
      },
      enabledModules: ['core', 'inventory', 'sales']
    };
    
    onConfirm(payload, password);
  };

  const ownerName = tenant.ownerId?.name || tenant.ownerName || 'N/A';
  const ownerEmail = tenant.ownerId?.email || tenant.ownerEmail || 'N/A';
  const ownerPhone = tenant.ownerId?.phone || tenant.ownerPhone || 'N/A';
  const accountType = tenant.accountType || 'SINGLE_SHOP';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Approve Organization Request</h2>
              <p className="text-sm text-gray-500 mt-0.5">Configure subscription and activate customer account.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          {/* 3-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-b border-gray-200">
            
            {/* Left Section: Organization Information */}
            <div className="p-8 border-r border-gray-200 bg-gray-50/50">
              <div className="flex items-center gap-2 mb-6 text-gray-900 font-semibold text-base">
                <Building2 className="w-5 h-5 text-gray-400" />
                Organization Information
              </div>
              
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Business Details</p>
                  <p className="font-semibold text-gray-900 text-lg">{tenant.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${accountType === 'ORGANIZATION' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {accountType.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-600">{tenant.businessType}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Owner Contact</p>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-900 font-medium">{ownerName}</p>
                    <p className="text-gray-600">{ownerEmail}</p>
                    <p className="text-gray-600">{ownerPhone}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Request Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {tenant.createdAt ? format(new Date(tenant.createdAt), 'PPP') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Middle Section: Subscription Duration */}
            <div className="p-8 border-r border-gray-200">
              <div className="flex items-center gap-2 mb-6 text-gray-900 font-semibold text-base">
                <Calendar className="w-5 h-5 text-gray-400" />
                Subscription Duration
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DURATIONS.map((duration) => {
                  const isSelected = selectedDurationId === duration.id;
                  return (
                    <button
                      key={duration.id}
                      type="button"
                      onClick={() => setSelectedDurationId(duration.id)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-blue-600">
                          <Check className="w-5 h-5" />
                        </div>
                      )}
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        {duration.type}
                      </p>
                      <p className={`font-bold text-lg ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                        {duration.label}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Section: Activation Configuration */}
            <div className="p-8">
              <div className="flex items-center gap-2 mb-6 text-gray-900 font-semibold text-base">
                <Settings className="w-5 h-5 text-gray-400" />
                Activation Configuration
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Maximum Branches
                  </label>
                  {isSingleShop ? (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                      <p className="text-gray-900 font-medium flex items-center gap-2">
                        <span className="text-lg">1</span> Branch
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Fixed for Single Shop accounts.</p>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="number"
                        min="0"
                        value={maxBranches}
                        onChange={(e) => setMaxBranches(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 font-medium"
                      />
                      <p className="text-xs text-gray-500 mt-2">Enter 0 for unlimited branches.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Actions Area */}
          <div className="p-8 bg-gray-50 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            
            {/* Summary */}
            <div className="flex-1 bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
              <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-3">Activation Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Organization</p>
                  <p className="font-semibold text-gray-900 truncate" title={tenant.name}>{tenant.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Duration</p>
                  <p className="font-semibold text-gray-900">{selectedDuration?.label || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Expiry</p>
                  <p className="font-semibold text-gray-900">{format(expiryDate, 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Branches</p>
                  <p className="font-semibold text-gray-900">{isSingleShop ? '1' : (maxBranches === 0 ? 'Unlimited' : maxBranches)}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                This will create the Organization, Default Branch, Owner Account, and Subscription record.
              </div>
            </div>

            {/* Password and Actions */}
            <div className="w-full lg:w-96 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Super Admin Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                    placeholder="Enter password to authorize"
                    disabled={isProcessing}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="flex-1 py-3 px-4 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !password}
                  className="flex-[2] py-3 px-4 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                  Approve & Activate
                </button>
              </div>
            </div>
            
          </div>
        </form>
      </div>
    </div>
  );
};
