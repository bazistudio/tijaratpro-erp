import React from 'react';
import { SubscriptionStatus } from '../../types/subscription.types';

interface BadgeProps {
  status: SubscriptionStatus | string;
}

export const SubscriptionStatusBadge: React.FC<BadgeProps> = ({ status }) => {
  switch (status) {
    case 'ACTIVE':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
    case 'PENDING':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
    case 'SUSPENDED':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Suspended</span>;
    case 'EXPIRED':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Expired</span>;
    case 'CANCELLED':
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-300 text-gray-800">Cancelled</span>;
    default:
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
  }
};
