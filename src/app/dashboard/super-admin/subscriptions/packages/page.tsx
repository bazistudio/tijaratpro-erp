import React from 'react';
import { PackagesTable } from '../../../../../features/super-admin/subscriptions/components/packages/PackagesTable';

export default function PackagesPage() {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <PackagesTable />
    </div>
  );
}
