'use client';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Package } from '../../types/subscription.types';
import { useCreatePackage, useUpdatePackage } from '../../hooks/useSubscriptions';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Package;
}

const AVAILABLE_MODULES = [
  'PRODUCTS', 'SALES', 'INVENTORY', 'LEDGER', 'REPAIRS', 
  'DASHBOARD', 'CUSTOMERS', 'SUPPLIERS', 'EXPENSES', 'SETTINGS', 'REPORTS',
  'AI', 'WHATSAPP', 'ACCOUNTING', 'PAYROLL', 'CRM'
];

export const PackageFormDialog: React.FC<DialogProps> = ({ isOpen, onClose, initialData }) => {
  const isEditing = !!initialData;
  const createMutation = useCreatePackage();
  const updateMutation = useUpdatePackage();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      code: '',
      description: '',
      durationType: 'DAYS',
      durationValue: 365,
      price: 0,
      trialEnabled: false,
      trialDays: 14,
      maxBranches: 1,
      maxUsers: 1,
      maxProducts: 100,
      storageLimit: 1024,
      enabledModules: [] as string[],
      status: 'ACTIVE'
    }
  });

  const trialEnabled = watch('trialEnabled');
  const enabledModules = watch('enabledModules');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          code: initialData.code,
          description: initialData.description || '',
          durationType: initialData.durationType || 'DAYS',
          durationValue: initialData.durationValue || 365,
          price: initialData.price || 0,
          trialEnabled: (initialData.trialDays || 0) > 0,
          trialDays: initialData.trialDays || 14,
          maxBranches: initialData.maxBranches ?? 1,
          maxUsers: initialData.maxUsers ?? 1,
          maxProducts: initialData.maxProducts ?? 100,
          storageLimit: initialData.storageLimit ?? 1024,
          enabledModules: initialData.enabledModules || [],
          status: initialData.status || 'ACTIVE'
        });
      } else {
        reset({
          name: '',
          code: '',
          description: '',
          durationType: 'DAYS',
          durationValue: 365,
          price: 0,
          trialEnabled: false,
          trialDays: 14,
          maxBranches: 1,
          maxUsers: 1,
          maxProducts: 100,
          storageLimit: 1024,
          enabledModules: [],
          status: 'ACTIVE'
        });
      }
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const toggleModule = (mod: string) => {
    const newMods = enabledModules.includes(mod)
      ? enabledModules.filter(m => m !== mod)
      : [...enabledModules, mod];
    setValue('enabledModules', newMods);
  };

  const onSubmit = async (data: any) => {
    const payload = {
      ...data,
      trialDays: data.trialEnabled ? data.trialDays : 0,
    };
    
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: initialData!._id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      console.error("Failed to save package", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Package' : 'Create Package'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 border-b pb-2">Basic Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name *</label>
                <input 
                  {...register('name', { required: 'Name is required' })}
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="e.g. PRO"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message as string}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                <input 
                  {...register('code', { required: 'Code is required' })}
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="e.g. PRO_YEARLY"
                  disabled={isEditing}
                />
                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message as string}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  {...register('description')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Billing */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 border-b pb-2">Billing & Duration</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (PKR) *</label>
                <input 
                  {...register('price', { required: 'Price is required', min: 0 })}
                  type="number" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration Unit</label>
                <select 
                  {...register('durationType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="DAYS">Days</option>
                  <option value="MONTHS">Months</option>
                  <option value="YEARS">Years</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration Value *</label>
                <input 
                  {...register('durationValue', { required: 'Value is required', min: 1 })}
                  type="number" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            </div>
          </div>

          {/* Trial */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 border-b pb-2">Trial Configuration</h4>
            <div className="flex items-center space-x-4 mb-3">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  {...register('trialEnabled')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                />
                <span className="ml-2 text-sm text-gray-700">Enable Trial</span>
              </label>
            </div>
            {trialEnabled && (
              <div className="w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Trial Days</label>
                <input 
                  {...register('trialDays', { min: 1 })}
                  type="number" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            )}
          </div>

          {/* Limits Configuration */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 border-b pb-2">Limits Configuration</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Shops (0 for unlimited)</label>
                <input 
                  {...register('maxBranches', { min: 0 })}
                  type="number" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Users (0 for unlimited)</label>
                <input 
                  {...register('maxUsers', { min: 0 })}
                  type="number" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Products (0 for unlimited)</label>
                <input 
                  {...register('maxProducts', { min: 0 })}
                  type="number" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Storage Limit in MB (0 for unlimited)</label>
                <input 
                  {...register('storageLimit', { min: 0 })}
                  type="number" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            </div>
          </div>

          {/* Feature Modules */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 border-b pb-2">Enabled Modules</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AVAILABLE_MODULES.map(mod => (
                <label key={mod} className="flex items-center cursor-pointer space-x-2">
                  <input
                    type="checkbox"
                    checked={enabledModules.includes(mod)}
                    onChange={() => toggleModule(mod)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{mod}</span>
                </label>
              ))}
            </div>
            {enabledModules.length === 0 && <p className="text-red-500 text-xs mt-2">At least one module must be selected.</p>}
          </div>

          {/* Status */}
          {isEditing && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4 border-b pb-2">Status</h4>
              <select 
                {...register('status')}
                className="w-full sm:max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Archived</option>
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-200 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending || enabledModules.length === 0}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Package'}
            </button>
          </div>

          {(createMutation.isError || updateMutation.isError) && (
            <div className="text-red-500 text-sm mt-2">
              Failed to save package. Please ensure the code is unique and try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
