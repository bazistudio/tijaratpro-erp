"use client";

import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, BookOpen } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supplierApi } from '@/services/supplier.api';
import { useRouter } from 'next/navigation';
import { SupplierFormDrawer } from './modals/AddSupplierDrawer';
import toast from 'react-hot-toast';

export const SuppliersTab = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  const { data: supplierResponse, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => supplierApi.getSuppliers(),
    staleTime: 30000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const suppliers = supplierResponse?.data || [];

  const filteredSuppliers = suppliers.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.phone || '').includes(searchTerm)
  );

  const navigateToLedger = (supplierId: string) => {
    toast('Ledger coming soon in next module!', { icon: '🚧' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await supplierApi.deleteSupplier(id);
        queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        toast.success('Supplier deleted successfully');
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to delete supplier');
      }
    }
  };

  const handleEdit = (supplier: any) => {
    setEditingSupplier(supplier);
    setIsAddModalOpen(true);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#006970] focus:border-transparent sm:text-sm transition-colors"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => {
            setEditingSupplier(null);
            setIsAddModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#006970] hover:bg-[#00585e] text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Supplier
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-800/50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Payable</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Purchases</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{supplier.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{supplier.companyName || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{supplier.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-orange-600 dark:text-orange-400">Rs {(supplier.currentPayable || 0).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Rs {(supplier.totalPurchases || 0).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    supplier.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  }`}>
                    {supplier.status || 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button 
                      className="text-gray-400 hover:text-blue-600 transition-colors" 
                      title="Edit"
                      onClick={() => handleEdit(supplier)}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-gray-400 hover:text-[#006970] transition-colors" 
                      title="View Ledger"
                      onClick={() => navigateToLedger(supplier.id)}
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-gray-400 hover:text-red-600 transition-colors" 
                      title="Delete"
                      onClick={() => handleDelete(supplier.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredSuppliers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  {isLoading ? 'Loading suppliers...' : 'No suppliers found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SupplierFormDrawer 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSupplier(null);
        }} 
        suppliers={suppliers}
        editingSupplier={editingSupplier}
      />
    </div>
  );
};
