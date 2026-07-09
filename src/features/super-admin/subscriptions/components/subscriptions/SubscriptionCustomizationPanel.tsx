import React, { useState, useEffect } from 'react';
import { Package, PackageDurationType } from '../../types/subscription.types';

export interface SubscriptionCustomizationData {
  subscriptionPrice?: number;
  durationType?: PackageDurationType;
  durationValue?: number;
  limits?: {
    maxBranches: number;
    maxUsers: number;
    maxProducts: number;
    storageLimit: number;
  };
  enabledModules?: string[];
}

interface SubscriptionCustomizationPanelProps {
  basePackage: Package | null;
  initialData?: SubscriptionCustomizationData;
  onChange: (data: SubscriptionCustomizationData) => void;
  readOnly?: boolean;
}

export const SubscriptionCustomizationPanel: React.FC<SubscriptionCustomizationPanelProps> = ({
  basePackage,
  initialData,
  onChange,
  readOnly = false,
}) => {
  const [data, setData] = useState<SubscriptionCustomizationData>({
    subscriptionPrice: initialData?.subscriptionPrice ?? basePackage?.price ?? 0,
    durationType: initialData?.durationType ?? basePackage?.durationType ?? 'MONTHS',
    durationValue: initialData?.durationValue ?? basePackage?.durationValue ?? 1,
    limits: initialData?.limits ?? {
      maxBranches: basePackage?.maxBranches ?? 1,
      maxUsers: basePackage?.maxUsers ?? 1,
      maxProducts: basePackage?.maxProducts ?? 100,
      storageLimit: basePackage?.storageLimit ?? 1024,
    },
    enabledModules: initialData?.enabledModules ?? basePackage?.enabledModules ?? [],
  });

  useEffect(() => {
    onChange(data);
  }, [data]);

  useEffect(() => {
    if (basePackage && !initialData) {
      setData({
        subscriptionPrice: basePackage.price ?? 0,
        durationType: basePackage.durationType,
        durationValue: basePackage.durationValue,
        limits: {
          maxBranches: basePackage.maxBranches ?? 1,
          maxUsers: basePackage.maxUsers ?? 1,
          maxProducts: basePackage.maxProducts ?? 100,
          storageLimit: basePackage.storageLimit ?? 1024,
        },
        enabledModules: basePackage.enabledModules ?? [],
      });
    }
  }, [basePackage]);

  const handleLimitChange = (key: keyof typeof data.limits, value: number) => {
    setData((prev) => ({
      ...prev,
      limits: {
        ...(prev.limits || { maxBranches: 1, maxUsers: 1, maxProducts: 100, storageLimit: 1024 }),
        [key]: value,
      },
    }));
  };

  if (!basePackage && !initialData) {
    return <div className="p-4 text-gray-500 text-sm">Select a package to customize...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Billing */}
      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Billing Configuration</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Price (PKR)</label>
            <input
              type="number"
              min="0"
              disabled={readOnly}
              value={data.subscriptionPrice}
              onChange={(e) => setData({ ...data, subscriptionPrice: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Duration Value</label>
              <input
                type="number"
                min="1"
                disabled={readOnly}
                value={data.durationValue}
                onChange={(e) => setData({ ...data, durationValue: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
              <select
                disabled={readOnly}
                value={data.durationType}
                onChange={(e) => setData({ ...data, durationType: e.target.value as PackageDurationType })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="DAYS">Days</option>
                <option value="MONTHS">Months</option>
                <option value="YEARS">Years</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Limits */}
      <div className="bg-white p-4 rounded-xl border border-gray-100">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Limits Configuration</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Max Branches (0 = Unlimited)</label>
            <input
              type="number"
              min="0"
              disabled={readOnly}
              value={data.limits?.maxBranches}
              onChange={(e) => handleLimitChange('maxBranches', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Max Users (0 = Unlimited)</label>
            <input
              type="number"
              min="0"
              disabled={readOnly}
              value={data.limits?.maxUsers}
              onChange={(e) => handleLimitChange('maxUsers', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Max Products (0 = Unlimited)</label>
            <input
              type="number"
              min="0"
              disabled={readOnly}
              value={data.limits?.maxProducts}
              onChange={(e) => handleLimitChange('maxProducts', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Storage Limit (MB)</label>
            <input
              type="number"
              min="0"
              disabled={readOnly}
              value={data.limits?.storageLimit}
              onChange={(e) => handleLimitChange('storageLimit', Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
