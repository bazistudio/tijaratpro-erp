'use client';
import React, { useState } from 'react';
import { usePackages } from '../../hooks/useSubscriptions';
import { PackageFilters } from './PackageFilters';
import { PackageStatusBadge } from './PackageStatusBadge';
import { PackageFormDialog } from './PackageFormDialog';
import { Package } from '../../types/subscription.types';

export const PackagesTable = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError, error } = usePackages({
    page,
    limit,
    search,
    status: status || undefined,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | undefined>();

  const handleCreate = () => {
    setSelectedPackage(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (pkg: Package) => {
    setSelectedPackage(pkg);
    setDialogOpen(true);
  };

  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p>Unable to load packages. {error?.message}</p>
        <button onClick={() => window.location.reload()} className="mt-2 text-sm font-semibold underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Subscription Packages</h2>
        <button 
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
        >
          Create Package
        </button>
      </div>

      <PackageFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-500 mb-2">No subscription packages found.</p>
          <button onClick={handleCreate} className="text-blue-600 hover:underline text-sm font-medium">
            Create your first SaaS package
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price / Trial</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modules</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.data?.map((pkg: Package) => (
                <tr key={pkg._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{pkg.name}</div>
                    <div className="text-xs text-gray-500">{pkg.code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{pkg.durationValue} {pkg.durationType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">PKR {pkg.price || 0}</div>
                    <div className="text-xs text-gray-500">Trial: {pkg.trialDays || 0} Days</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 flex flex-wrap gap-1 max-w-[200px]">
                      {pkg.enabledModules?.slice(0, 3).map((mod: string) => (
                        <span key={mod} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{mod}</span>
                      ))}
                      {pkg.enabledModules?.length > 3 && (
                        <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded text-xs">+{pkg.enabledModules.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PackageStatusBadge status={pkg.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEdit(pkg)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    {/* Note: In a real implementation we'd also have Archive/Activate handlers here */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data?.pagination && data.pagination.pages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 px-2">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{((page - 1) * limit) + 1}</span> to <span className="font-medium">{Math.min(page * limit, data.pagination.total)}</span> of <span className="font-medium">{data.pagination.total}</span> results
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Previous
            </button>
            <button 
              onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
              disabled={page === data.pagination.pages}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {dialogOpen && (
        <PackageFormDialog 
          isOpen={dialogOpen} 
          onClose={() => setDialogOpen(false)} 
          initialData={selectedPackage} 
        />
      )}
    </div>
  );
};
