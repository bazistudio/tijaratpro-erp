'use client';
import React, { useState, useEffect } from 'react';
import { useOrganizationLimits, useUpdateOrganizationLimits } from '../../hooks/useSubscriptions';

export const OrganizationLimitsWidget: React.FC<{ organizationId: string; packageName?: string }> = ({ organizationId, packageName }) => {
  const { data: res, isLoading } = useOrganizationLimits(organizationId);
  const updateMutation = useUpdateOrganizationLimits();

  const [editMode, setEditMode] = useState(false);
  const [limits, setLimits] = useState<any>({});

  useEffect(() => {
    if (res?.data?.limits) {
      setLimits(res.data.limits);
    }
  }, [res]);

  if (isLoading) return <div className="animate-pulse bg-white p-6 rounded shadow h-40"></div>;
  if (!res?.data) return null;

  const { usage } = res.data;

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ id: organizationId, data: limits });
      setEditMode(false);
    } catch (error) {
      console.error("Failed to update limits", error);
    }
  };

  const handleLimitChange = (key: string, delta: number) => {
    setLimits((prev: any) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) + delta)
    }));
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Organization Limits</h3>
          <p className="text-sm text-gray-500">Current limits based on <span className="font-semibold">{packageName || 'Package'}</span> and overrides.</p>
        </div>
        {!editMode ? (
          <button onClick={() => setEditMode(true)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Edit Limits
          </button>
        ) : (
          <div className="flex space-x-2">
            <button onClick={() => setEditMode(false)} className="text-gray-500 hover:text-gray-700 text-sm font-medium">
              Cancel
            </button>
            <button onClick={handleSave} disabled={updateMutation.isPending} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium">
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LimitItem 
          title="Shops" 
          current={usage.currentBranches} 
          max={limits.maxBranches} 
          editMode={editMode}
          onChange={(delta: number) => handleLimitChange('maxBranches', delta)}
        />
        <LimitItem 
          title="Users" 
          current={usage.currentUsers} 
          max={limits.maxUsers} 
          editMode={editMode}
          onChange={(delta: number) => handleLimitChange('maxUsers', delta)}
        />
        <LimitItem 
          title="Products" 
          current={usage.currentProducts} 
          max={limits.maxProducts} 
          editMode={editMode}
          onChange={(delta: number) => handleLimitChange('maxProducts', delta)}
          step={50}
        />
        <LimitItem 
          title="Storage (MB)" 
          current={0} // TBD: storage usage 
          max={limits.storageLimit} 
          editMode={editMode}
          onChange={(delta: number) => handleLimitChange('storageLimit', delta)}
          step={1024}
        />
      </div>
    </div>
  );
};

const LimitItem = ({ title, current, max, editMode, onChange, step = 1 }: any) => {
  const isUnlimited = max === 0;
  
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <p className="text-sm font-medium text-gray-500 mb-2">{title}</p>
      
      {!editMode ? (
        <div className="flex items-end space-x-2">
          <span className="text-2xl font-bold text-gray-900">{current}</span>
          <span className="text-gray-500 mb-1">/ {isUnlimited ? 'Unlimited' : max}</span>
        </div>
      ) : (
        <div className="flex items-center space-x-3 mt-1">
          <button 
            onClick={() => onChange(-step)} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600"
          >
            -
          </button>
          <div className="flex-1 text-center font-semibold text-lg border-b border-gray-300 pb-1">
            {max}
          </div>
          <button 
            onClick={() => onChange(step)} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600"
          >
            +
          </button>
        </div>
      )}
      
      {editMode && (
        <p className="text-xs text-center text-gray-500 mt-2">0 means unlimited</p>
      )}
    </div>
  );
};
