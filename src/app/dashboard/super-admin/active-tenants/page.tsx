import React from 'react';
import { Search, Building } from 'lucide-react';

export default function ActiveTenantsPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Tenants</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage active organizations and shops on the platform.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium flex items-center">
          <Building className="w-5 h-5 mr-2" />
          <span>Tenant Count: <span className="font-bold">--</span></span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="Search tenants..."
            />
          </div>
        </div>
        <div className="p-8 text-center text-gray-500">
          Placeholder Table: Active tenants will be listed here.
        </div>
      </div>
    </div>
  );
}
