import React from 'react';
import { SubscriptionStatus } from '../../types/subscription.types';
import { Badge } from '@/components/ui';
import type { BadgeProps } from '@/components/ui';

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus | string;
}

export const SubscriptionStatusBadge: React.FC<SubscriptionStatusBadgeProps> = ({ status }) => {
  let variant: BadgeProps['variant'] = 'neutral';
  let label = status;

  switch (status) {
    case 'ACTIVE':
      variant = 'success';
      label = 'Active';
      break;
    case 'PENDING':
      variant = 'warning';
      label = 'Pending';
      break;
    case 'SUSPENDED':
      variant = 'danger';
      label = 'Suspended';
      break;
    case 'EXPIRED':
      variant = 'neutral';
      label = 'Expired';
      break;
    case 'CANCELLED':
      variant = 'neutral';
      label = 'Cancelled';
      break;
    default:
      variant = 'neutral';
  }

  return (
    <Badge variant={variant} size="sm">
      {label}
    </Badge>
  );
};
