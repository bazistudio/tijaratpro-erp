import React from 'react';
import { DashboardData } from '@/lib/api/organization.api';
import { Calendar, Package } from 'lucide-react';

export const SubscriptionCard = ({ subscription }: { subscription: DashboardData['subscription'] }) => {
  if (!subscription) return null;
  
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="p-2 bg-blue-50 rounded-lg mr-3">
          <Package className="text-blue-600" size={24} />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Subscription</h3>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-1">Current Plan</p>
        <p className="text-xl font-bold text-gray-900">{subscription.package}</p>
      </div>

      <div className="flex justify-between items-end mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Status</p>
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            {subscription.status}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 mb-1">Time Remaining</p>
          <p className="font-semibold text-gray-900">{subscription.remainingDays} Days</p>
        </div>
      </div>
      
      {subscription.expiryDate && (
        <div className="flex items-center text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
          <Calendar size={14} className="mr-2" />
          Expires: {new Date(subscription.expiryDate).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};
