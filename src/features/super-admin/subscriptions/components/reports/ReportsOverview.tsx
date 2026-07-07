'use client';
import React, { useState } from 'react';
import { useRevenueReport, usePackagePerformanceReport, useExpiryReport } from '../../hooks/useSubscriptions';
import { RevenueReport } from './RevenueReport';
import { PackagePerformanceReport } from './PackagePerformanceReport';
import { ExpiryReport } from './ExpiryReport';

export const ReportsOverview = () => {
  const [dateRange, setDateRange] = useState('ALL');
  const [expiryDays, setExpiryDays] = useState('30');
  
  const revParams = {};
  // If we had real startDate/endDate logic for dateRange, we'd add it here
  const { data: revData, isLoading: revLoading } = useRevenueReport(revParams);
  const { data: pkgData, isLoading: pkgLoading } = usePackagePerformanceReport({});
  const { data: expData, isLoading: expLoading } = useExpiryReport({ days: expiryDays });

  const exportCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    ).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-4 w-full md:w-auto">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Time Range</label>
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="ALL">All Time</option>
              <option value="YTD">Year to Date</option>
              <option value="LAST_3_MONTHS">Last 3 Months</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Expiry Horizon</label>
            <select 
              value={expiryDays}
              onChange={(e) => setExpiryDays(e.target.value)}
              className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="7">Next 7 Days</option>
              <option value="30">Next 30 Days</option>
              <option value="90">Next 90 Days</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => exportCSV(revData?.data || [], 'revenue_report')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Export Revenue CSV
          </button>
          <button 
            onClick={() => exportCSV(pkgData?.data || [], 'package_report')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Export Packages CSV
          </button>
          <button 
            onClick={() => exportCSV(expData?.data || [], 'expiry_report')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Export Expiry CSV
          </button>
        </div>
      </div>

      <RevenueReport data={revData?.data} isLoading={revLoading} />
      <PackagePerformanceReport data={pkgData?.data} isLoading={pkgLoading} />
      <ExpiryReport data={expData?.data} isLoading={expLoading} />
    </div>
  );
};
