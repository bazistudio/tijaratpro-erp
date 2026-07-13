'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { DynamicMasterSelect } from './master-data/DynamicMasterSelect';
import { useProducts } from '@/features/inventory/hooks/useProducts';

export interface AddProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddProductDrawer({ isOpen, onClose }: AddProductDrawerProps) {
  const { createProduct, isCreating } = useProducts({ page: 1, limit: 10 }, { enabled: false });
  
  const [formData, setFormData] = useState({
    name: '',
    productCode: '',
    sku: '',
    barcode: '',
    description: '',
    
    categoryId: '',
    brandId: '',
    companyId: '',
    colorId: '',
    qualityId: '',
    
    quantity: '',
    unit: 'Piece',
    minStockThreshold: '2',
    trackInventory: true,
    
    purchasePrice: '',
    price: '',
    
    // Advanced
    serialTracking: false,
    imeiTracking: false,
    batchTracking: false,
    expiryTracking: false,
    costMethod: 'FIFO'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load remembered master data on open
  useEffect(() => {
    if (isOpen) {
      try {
        const remembered = localStorage.getItem('tijaratpro_last_product_masters');
        if (remembered) {
          const parsed = JSON.parse(remembered);
          setFormData(prev => ({
            ...prev,
            categoryId: parsed.categoryId || '',
            brandId: parsed.brandId || '',
            companyId: parsed.companyId || '',
            colorId: parsed.colorId || '',
            qualityId: parsed.qualityId || ''
          }));
        }
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateCode = () => {
    const code = 'PRD-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    handleChange('productCode', code);
  };

  const handleSave = async () => {
    try {
      // Remember selections for next time
      localStorage.setItem('tijaratpro_last_product_masters', JSON.stringify({
        categoryId: formData.categoryId,
        brandId: formData.brandId,
        companyId: formData.companyId,
        colorId: formData.colorId,
        qualityId: formData.qualityId
      }));

      await createProduct({
        ...formData,
        purchasePrice: Number(formData.purchasePrice) || 0,
        price: Number(formData.price) || 0,
        quantity: Number(formData.quantity) || 0,
        lowStockThreshold: Number(formData.minStockThreshold) || 2
      });
      
      // Reset main fields but keep master data
      setFormData(prev => ({
        ...prev,
        name: '', productCode: '', sku: '', barcode: '', description: '',
        quantity: '', purchasePrice: '', price: ''
      }));
      onClose();
    } catch (err) {
      console.error('Failed to create product', err);
    }
  };

  const isValid = formData.name.trim() !== '' && formData.price !== '' && formData.quantity !== '' && formData.categoryId !== '';

  const margin = (Number(formData.price) || 0) - (Number(formData.purchasePrice) || 0);

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[900px] bg-white dark:bg-gray-900 shadow-xl flex flex-col transition-transform transform translate-x-0">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Product</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create inventory item</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-full dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="flex flex-col gap-6">
              
              {/* Section 1: Basic Information */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">1. Basic Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g. Samsung A55"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#006970] focus:border-[#006970] dark:bg-gray-800 dark:text-white sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Code</label>
                      <div className="flex">
                        <input
                          type="text"
                          value={formData.productCode}
                          onChange={(e) => handleChange('productCode', e.target.value)}
                          placeholder="PRD-0001"
                          className="block w-full px-3 py-2 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm focus:ring-[#006970] focus:border-[#006970] dark:bg-gray-800 dark:text-white sm:text-sm"
                        />
                        <button 
                          onClick={handleGenerateCode}
                          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Barcode / SKU</label>
                      <input
                        type="text"
                        value={formData.barcode}
                        onChange={(e) => handleChange('barcode', e.target.value)}
                        placeholder="Scan / Enter barcode"
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#006970] focus:border-[#006970] dark:bg-gray-800 dark:text-white sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      rows={2}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#006970] focus:border-[#006970] dark:bg-gray-800 dark:text-white sm:text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* Section 4: Pricing */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">4. Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Price</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">Rs.</span>
                      </div>
                      <input
                        type="number"
                        value={formData.purchasePrice}
                        onChange={(e) => handleChange('purchasePrice', e.target.value)}
                        placeholder="0.00"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#006970] focus:border-[#006970] dark:bg-gray-800 dark:text-white sm:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sale Price *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">Rs.</span>
                      </div>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => handleChange('price', e.target.value)}
                        placeholder="0.00"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#006970] focus:border-[#006970] dark:bg-gray-800 dark:text-white sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                {margin > 0 && (
                  <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium text-right">
                    Margin: Rs. {margin.toLocaleString()}
                  </div>
                )}
              </section>

            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              
              {/* Section 2: Product Classification */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">2. Product Classification</h3>
                <div className="space-y-4">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                      <DynamicMasterSelect showAddButton hideAllOption entity="category" value={formData.categoryId} onChange={(v) => handleChange('categoryId', v)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                      <DynamicMasterSelect showAddButton hideAllOption entity="brand" value={formData.brandId} onChange={(v) => handleChange('brandId', v)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                      <DynamicMasterSelect showAddButton hideAllOption entity="company" value={formData.companyId} onChange={(v) => handleChange('companyId', v)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                      <DynamicMasterSelect showAddButton hideAllOption entity="color" value={formData.colorId} onChange={(v) => handleChange('colorId', v)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quality</label>
                      <DynamicMasterSelect showAddButton hideAllOption entity="quality" value={formData.qualityId} onChange={(v) => handleChange('qualityId', v)} />
                    </div>
                  </div>

                </div>
              </section>

              {/* Section 3: Inventory */}
              <section>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">3. Inventory</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Opening Stock *</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleChange('quantity', e.target.value)}
                      placeholder="0"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#006970] focus:border-[#006970] dark:bg-gray-800 dark:text-white sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
                    <select
                      value={formData.unit}
                      onChange={(e) => handleChange('unit', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#006970] focus:border-[#006970] dark:bg-gray-800 dark:text-white sm:text-sm"
                    >
                      <option>Piece</option>
                      <option>Box</option>
                      <option>Kg</option>
                      <option>Meter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Stock Alert</label>
                    <input
                      type="number"
                      value={formData.minStockThreshold}
                      onChange={(e) => handleChange('minStockThreshold', e.target.value)}
                      placeholder="2"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#006970] focus:border-[#006970] dark:bg-gray-800 dark:text-white sm:text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="trackInventory"
                    type="checkbox"
                    checked={formData.trackInventory}
                    onChange={(e) => handleChange('trackInventory', e.target.checked)}
                    className="h-4 w-4 text-[#006970] focus:ring-[#006970] border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label htmlFor="trackInventory" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Track Inventory
                  </label>
                </div>
              </section>

              {/* Section 5: Tracking Options (Advanced) */}
              <section className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center">
                    {showAdvanced ? <ChevronUp className="w-4 h-4 mr-2" /> : <ChevronDown className="w-4 h-4 mr-2" />}
                    Advanced Inventory Settings
                  </div>
                </button>
                
                {showAdvanced && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input type="checkbox" checked={formData.serialTracking} onChange={(e) => handleChange('serialTracking', e.target.checked)} className="h-4 w-4 text-[#006970] rounded border-gray-300" />
                        <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Serial Number Tracking</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" checked={formData.imeiTracking} onChange={(e) => handleChange('imeiTracking', e.target.checked)} className="h-4 w-4 text-[#006970] rounded border-gray-300" />
                        <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">IMEI Tracking</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" checked={formData.batchTracking} onChange={(e) => handleChange('batchTracking', e.target.checked)} className="h-4 w-4 text-[#006970] rounded border-gray-300" />
                        <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Batch Tracking</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" checked={formData.expiryTracking} onChange={(e) => handleChange('expiryTracking', e.target.checked)} className="h-4 w-4 text-[#006970] rounded border-gray-300" />
                        <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Expiry Tracking</label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost Method</label>
                      <select
                        value={formData.costMethod}
                        onChange={(e) => handleChange('costMethod', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-[#006970] focus:border-[#006970] dark:bg-gray-800 dark:text-white sm:text-sm"
                      >
                        <option>FIFO</option>
                        <option>LIFO</option>
                        <option>Average Cost</option>
                      </select>
                    </div>
                  </div>
                )}
              </section>

            </div>
          </div>
        </div>

        {/* Bottom Sticky Action */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid || isCreating}
            className="px-8 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#006970] hover:bg-[#005a60] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006970] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </div>
    </>
  );
}
