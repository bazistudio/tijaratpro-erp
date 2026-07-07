import React from 'react';
import { PaymentRequestsTable } from '../../../../../features/super-admin/subscriptions/components/payments/PaymentRequestsTable';

export default function PaymentRequestsPage() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <PaymentRequestsTable />
    </div>
  );
}
