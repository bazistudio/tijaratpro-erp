'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { useTenantById } from '@/features/super-admin/hooks/useTenantById';
import { Building2, AlertCircle } from 'lucide-react';

export default function OrganizationDetailsPage() {
  const params = useParams();
  const tenantId = params.id as string;
  const { data: tenant, isLoading, isError } = useTenantById(tenantId);
  const [activeTab, setActiveTab] = useState('Overview');

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !tenant) {
    return (
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Organization Not Found</h2>
        <p className="text-gray-500 mt-2">The organization you are looking for does not exist or has been deleted.</p>
      </div>
    );
  }

  const tabs = ['Overview', 'Subscription', 'Branches', 'Users', 'Activity', 'Billing'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Summary Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center text-blue-700">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                <span className="capitalize font-medium text-gray-700">{tenant.subscriptionPlan || 'No Plan'}</span>
                <span>&bull;</span>
                <span className={`capitalize font-medium ${tenant.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {tenant.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-6 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Shops</p>
              <p className="text-lg font-bold text-gray-900">{tenant.shopCount || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Users</p>
              <p className="text-lg font-bold text-gray-900">{tenant.userCount || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Expires</p>
              <p className="text-lg font-bold text-gray-900">
                {tenant.subscriptionEnd ? format(new Date(tenant.subscriptionEnd), 'dd-MMM-yyyy') : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content Area */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 min-h-[400px]">
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Organization Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500">Business Type</p>
                <p className="mt-1 text-sm text-gray-900">{tenant.businessType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Owner Email</p>
                <p className="mt-1 text-sm text-gray-900">{tenant.ownerEmail || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Owner Phone</p>
                <p className="mt-1 text-sm text-gray-900">{tenant.ownerPhone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Created At</p>
                <p className="mt-1 text-sm text-gray-900">{format(new Date(tenant.createdAt), 'PPpp')}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Subscription' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Current Subscription</h3>
              <div className="flex gap-3">
                <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">Renew</button>
                <button className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded text-sm font-medium hover:bg-gray-200">Upgrade</button>
                <button className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded text-sm font-medium hover:bg-gray-200">Change Plan</button>
                <button className="px-3 py-1.5 bg-red-100 text-red-600 rounded text-sm font-medium hover:bg-red-200">Cancel</button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Current Plan</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 capitalize">{tenant.subscriptionPlan || 'Custom'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 capitalize">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${tenant.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {tenant.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Expires</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {tenant.subscriptionEnd ? format(new Date(tenant.subscriptionEnd), 'PPpp') : 'No Expiry'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Start Date</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {tenant.subscriptionStart ? format(new Date(tenant.subscriptionStart), 'PP') : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'Overview' && activeTab !== 'Subscription' && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              The {activeTab} module for organizations is part of the new enterprise architecture and will be available soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
