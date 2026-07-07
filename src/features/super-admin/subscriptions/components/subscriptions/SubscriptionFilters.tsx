import React from 'react';

interface FiltersProps {
  search: string;
  setSearch: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  ownerType: string;
  setOwnerType: (v: string) => void;
  expiryFilter: string;
  setExpiryFilter: (v: string) => void;
}

export const SubscriptionFilters: React.FC<FiltersProps> = ({
  search, setSearch, status, setStatus, ownerType, setOwnerType, expiryFilter, setExpiryFilter
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search by owner ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="w-full sm:w-40">
        <select
          value={ownerType}
          onChange={(e) => setOwnerType(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">All Owner Types</option>
          <option value="ORGANIZATION">Organization</option>
          <option value="SHOP">Shop</option>
        </select>
      </div>
      <div className="w-full sm:w-40">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <div className="w-full sm:w-40">
        <select
          value={expiryFilter}
          onChange={(e) => setExpiryFilter(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="">All Expiry</option>
          <option value="7_DAYS">Expires in 7 days</option>
          <option value="30_DAYS">Expires in 30 days</option>
          <option value="EXPIRED">Already Expired</option>
        </select>
      </div>
    </div>
  );
};
