'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { repairApi } from '../services/repair.api';
import { Search, Filter, Download, Plus, Wrench, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RepairFormDrawer } from './modals/RepairFormDrawer';
import { format } from 'date-fns';

export const RepairDashboard = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: response, isLoading } = useQuery({
    queryKey: ['repairs', statusFilter, searchTerm],
    queryFn: () => repairApi.getRepairJobs({ status: statusFilter, search: searchTerm })
  });

  const jobs = response?.data || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Received': return 'bg-blue-100 text-blue-800';
      case 'Repair In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Ready for Pickup': return 'bg-green-100 text-green-800';
      case 'Delivered': return 'bg-gray-100 text-gray-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Low': return 'text-gray-600 bg-gray-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-7xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-[#006970]" />
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white">
              Repair Jobs
            </h1>
          </div>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage customer repairs, devices, and service workflows.
          </p>
        </div>
        
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#006970] hover:bg-[#005a60] text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          New Repair Job
        </button>
      </div>

      {/* KPI Cards Placeholder */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-blue-600">
            <Clock className="w-5 h-5" />
            <span className="font-bold text-sm">Active Repairs</span>
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white">12</span>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold text-sm">Ready for Pickup</span>
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white">5</span>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-purple-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold text-sm">Delivered Today</span>
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white">3</span>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="font-bold text-sm">Pending Payments</span>
          </div>
          <span className="text-2xl font-black text-gray-900 dark:text-white">2</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search ID, IMEI, Model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#006970]"
            />
          </div>
          <select 
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#006970]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Received">Received</option>
            <option value="Diagnosing">Diagnosing</option>
            <option value="Repair In Progress">Repair In Progress</option>
            <option value="Ready for Pickup">Ready for Pickup</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-gray-500 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Job ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Device</th>
                <th className="px-6 py-4 text-center">Priority</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Estimated</th>
                <th className="px-6 py-4 text-right">Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {jobs.map((job) => (
                <tr 
                  key={job.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
                  onClick={() => router.push(`/dashboard/shop-admin/repairs/${job.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#006970] dark:text-[#00b0ba]">{job.jobId}</div>
                    <div className="text-xs text-gray-500">{format(new Date(job.createdAt), 'dd MMM yyyy')}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {job.customerId?.name || job.customerId?.contactPerson || 'Unknown'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900 dark:text-white">{job.device.brand} {job.device.model}</div>
                    <div className="text-xs text-gray-500 font-mono">{job.device.imei}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${getPriorityBadge(job.priority)}`}>
                      {job.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadge(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300">
                    Rs {job.estimatedCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-orange-600 dark:text-orange-400">
                    Rs {job.remainingBalance.toLocaleString()}
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {isLoading ? 'Loading repair jobs...' : 'No repair jobs found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RepairFormDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
};
