import React from 'react';
import { PaymentStatus } from '../../types/subscription.types';
import { Badge } from '@/components/ui';
import type { BadgeProps } from '@/components/ui';

interface PaymentStatusBadgeProps {
  status: PaymentStatus | string;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  let variant: BadgeProps['variant'] = 'neutral';
  let label = status;

  switch (status) {
    case 'APPROVED':
      variant = 'success';
      label = 'Approved';
      break;
    case 'PENDING':
      variant = 'warning';
      label = 'Pending';
      break;
    case 'REJECTED':
      variant = 'danger';
      label = 'Rejected';
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
