import React from 'react';

interface FiltersProps {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  method: string;
  setMethod: (v: string) => void;
}

export const PaymentFilters: React.FC<FiltersProps> = ({
  search, setSearch, status, setStatus, method, setMethod
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search by Owner ID or Transaction ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:"
        />
      </div>
      <div className="w-full sm:w-48">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus: bg-white"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>
      <div className="w-full sm:w-48">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus: bg-white"
        >
          <option value="">All Methods</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="EASYPAISA">Easypaisa</option>
          <option value="JAZZCASH">JazzCash</option>
          <option value="SADAPAY">SadaPay</option>
          <option value="NAYAPAY">NayaPay</option>
        </select>
      </div>
    </div>
  );
};
