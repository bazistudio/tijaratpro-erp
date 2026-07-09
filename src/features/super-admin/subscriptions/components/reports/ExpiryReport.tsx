import React from 'react';

export const ExpiryReport = ({ data, isLoading }: { data: any, isLoading: boolean }) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Expiry Report</h3>
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-100 rounded"></div>
          <div className="h-10 bg-gray-100 rounded"></div>
        </div>
      ) : !data || data.length === 0 ? (
        <p className="text-gray-500 text-sm">No expiry data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization / Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Days Left</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.organization}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.package}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.expiryDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                    <span className={`px-2 py-1 rounded text-xs ${row.remainingDays <= 7 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {row.remainingDays}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
