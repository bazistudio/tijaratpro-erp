'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Package, UploadCloud, ArrowLeft, Loader2, Tag, Hash, FileText, ChevronDown, ChevronUp, Edit2, Trash2, CheckCircle, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { 
  selectCategories, 
  selectIsCategoriesLoading, 
  selectFetchCategories, 
  selectCreateProduct,
  selectProducts,
  selectUpdateProduct,
  selectDeleteProduct,
  selectFetchProducts
} from '@/features/inventory/core/inventory.selectors';

// Zod schema for form validation
const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().optional(),
  price: z.number().min(0, "Price cannot be negative"),
  purchasePrice: z.number().min(0).optional(),
  quantity: z.number().min(0, "Quantity cannot be negative"),
  lowStockThreshold: z.number().min(0).optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  brand: z.string().optional(),
  description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export const ProductForm = () => {
  const router = useRouter();
  
  const categories = selectCategories();
  const isCategoriesLoading = selectIsCategoriesLoading();
  const fetchCategories = selectFetchCategories();
  const createProduct = selectCreateProduct();
  const updateProduct = selectUpdateProduct();
  const deleteProduct = selectDeleteProduct();
  const products = selectProducts();
  const fetchProducts = selectFetchProducts();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isNewSession, setIsNewSession] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    setFocus,
    formState: { errors, isDirty },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      quantity: 0,
      lowStockThreshold: 5,
    }
  });

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isSubmitting) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, isSubmitting]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  const recentProducts = useMemo(() => {
    if (isNewSession) return [];

    // Sort descending by updatedAt or just take the end of the array if no updatedAt
    const sorted = [...products].sort((a: any, b: any) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      if (dateA && dateB) return dateB - dateA;
      // Fallback: assume newer items are appended
      return -1; 
    });
    // Just to be safe if they don't have updatedAt, let's reverse the array assuming they are appended
    if (sorted.length > 0 && !sorted[0].updatedAt) {
      return [...products].reverse().slice(0, 10);
    }
    return sorted.slice(0, 10);
  }, [products, isNewSession]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = (product: any) => {
    setEditingProductId(product._id || product.id);
    setValue('name', product.name);
    setValue('category', product.category || '');
    setValue('price', product.price);
    setValue('purchasePrice', product.purchasePrice || 0);
    setValue('quantity', product.stock !== undefined ? product.stock : product.quantity);
    setValue('lowStockThreshold', product.minStockThreshold !== undefined ? product.minStockThreshold : (product.lowStockThreshold || 5));
    setValue('sku', product.sku || '');
    setValue('barcode', product.barcode || '');
    setValue('brand', product.brand || '');
    setValue('description', product.description || '');
    
    setImageFile(null);
    if (product.imageUrl) {
      setImagePreview(product.imageUrl);
    } else {
      setImagePreview(null);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFocus('name');
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      toast.success('Product deleted successfully');
      setItemToDelete(null);
      if (editingProductId === id) {
        cancelEdit();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    reset({
      name: '', category: '', price: 0, purchasePrice: 0, quantity: 0, 
      lowStockThreshold: 5, sku: '', barcode: '', brand: '', description: ''
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Provide a fallback for category if missing, to satisfy backend constraints if they exist
      const payload: any = { ...data };
      if (!payload.category) {
        payload.category = categories.length > 0 ? categories[0].id : '';
      }

      if (editingProductId) {
        await updateProduct(editingProductId, payload, imageFile || undefined);
        toast.success('Product Updated Successfully');
        cancelEdit();
      } else {
        await createProduct(payload, imageFile || undefined);
        toast.success('Product Added Successfully');
        reset();
        setImageFile(null);
        setImagePreview(null);
        setFocus('name');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'An error occurred.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      {/* Top Header Row with Form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-[#006970]/10 p-2 rounded-xl text-[#006970]">
                <Package className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingProductId ? 'Edit Product' : 'Add New Product'}
              </h1>
            </div>
          </div>
          {editingProductId && (
            <button 
              onClick={cancelEdit}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" /> Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: Basic Identifiers */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Tag className="h-4 w-4" />
                  </div>
                  <input
                    {...register("name")}
                    placeholder="e.g. Rice 5kg"
                    className="pl-10 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-3 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors"
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Hash className="h-4 w-4" />
                  </div>
                  <input
                    {...register("sku")}
                    placeholder="Auto-generated if empty"
                    className="pl-10 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-3 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Barcode</label>
                <input
                  {...register("barcode")}
                  placeholder="Optional barcode scan"
                  className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-3 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors"
                />
              </div>
            </div>

            {/* Column 2: Pricing & Stock */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cost Price</label>
                  <input
                    type="number"
                    {...register("purchasePrice", { valueAsNumber: true })}
                    placeholder="0.00"
                    className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-3 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sale Price *</label>
                  <input
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="0.00"
                    className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-3 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors"
                  />
                  {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock *</label>
                  <input
                    type="number"
                    {...register("quantity", { valueAsNumber: true })}
                    placeholder="0"
                    className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-3 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors"
                  />
                  {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Low Alert At</label>
                  <input
                    type="number"
                    {...register("lowStockThreshold", { valueAsNumber: true })}
                    placeholder="5"
                    className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-3 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#006970] hover:bg-[#005a60] text-white py-3 rounded-xl font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {isSubmitting ? 'Saving...' : editingProductId ? 'Update Product' : 'Save & Add Product'}
                </button>
              </div>
            </div>

            {/* Column 3: Image & Toggle Advanced */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Image</label>
                <div className="flex justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors h-32 relative">
                  {imagePreview ? (
                     <div className="relative w-full h-full flex justify-center items-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imagePreview} alt="Preview" className="h-full object-contain rounded" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setImageFile(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-0 right-0  text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                     </div>
                  ) : (
                    <div className="text-center self-center flex flex-col items-center">
                      <UploadCloud className="h-6 w-6 text-gray-400 mb-1" />
                      <label htmlFor="file-upload" className="cursor-pointer text-sm font-semibold text-[#006970] hover:text-[#005a60]">
                        Upload <input id="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                      </label>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
                </button>
              </div>
            </div>
          </div>
          
          {submitError && (
            <div className="mt-4 p-3  text-red-600 rounded-xl text-sm border ">
              {submitError}
            </div>
          )}

          {/* Advanced Fields Collapse */}
          {showAdvanced && (
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  {...register("category")}
                  className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-3 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors"
                  disabled={isCategoriesLoading}
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
                <input
                  {...register("brand")}
                  placeholder="e.g. Samsung"
                  className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-3 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  {...register("description")}
                  rows={2}
                  className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-2.5 px-3 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors resize-none"
                  placeholder="Product details..."
                />
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Verification Table Row */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recently Added Products</h2>
            {!isNewSession && (
              <span className="text-xs font-medium px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg">Last 10 items</span>
            )}
          </div>
          <div>
            {isNewSession ? (
              <button
                onClick={() => setIsNewSession(false)}
                className="text-sm text-blue-500 hover:text-blue-700 transition-colors font-medium"
              >
                Restore
              </button>
            ) : (
              <button
                onClick={() => setIsNewSession(true)}
                className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
              >
                Start New Session
              </button>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800/80 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="px-6 py-1.5 font-semibold">S.No</th>
                <th className="px-6 py-1.5 font-semibold">Name</th>
                <th className="px-6 py-1.5 font-semibold">SKU</th>
                <th className="px-6 py-1.5 font-semibold text-right">Stock</th>
                <th className="px-6 py-1.5 font-semibold text-right">Cost</th>
                <th className="px-6 py-1.5 font-semibold text-right">Sale</th>
                <th className="px-6 py-1.5 font-semibold text-center">Status</th>
                <th className="px-6 py-1.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-1.5 text-center text-gray-500">
                    No products recently added.
                  </td>
                </tr>
              ) : (
                recentProducts.map((product: any, idx: number) => {
                  const currentStock = product.stock !== undefined ? product.stock : product.quantity;
                  const currentMinStock = product.minStockThreshold !== undefined ? product.minStockThreshold : (product.lowStockThreshold || 5);
                  const isLowStock = currentStock <= currentMinStock;
                  const currentCost = product.purchasePrice ?? product.costPrice ?? product.cost ?? 0;
                  
                  return (
                    <tr key={product._id || product.id || idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-1.5 font-medium">{idx + 1}</td>
                      <td className="px-6 py-1.5 text-gray-900 dark:text-gray-200 font-medium truncate max-w-[150px]" title={product.name}>
                        {product.name}
                      </td>
                      <td className="px-6 py-1.5 font-mono text-xs text-gray-500">{product.sku || '-'}</td>
                      <td className="px-6 py-1.5 text-right font-medium">
                        <span className={isLowStock ? 'text-red-500' : 'text-gray-900 dark:text-gray-200'}>
                          {currentStock}
                        </span>
                      </td>
                      <td className="px-6 py-1.5 text-right">PKR {currentCost.toLocaleString()}</td>
                      <td className="px-6 py-1.5 text-right font-medium text-gray-900 dark:text-gray-200">PKR {product.price?.toLocaleString()}</td>
                      <td className="px-6 py-1.5 text-center">
                        {isLowStock ? (
                           <span title="Low Stock"><AlertTriangle className="w-4 h-4 text-orange-500 mx-auto" /></span>
                        ) : (
                           <span title="Saved"><CheckCircle className="w-4 h-4 text-green-500 mx-auto" /></span>
                        )}
                      </td>
                      <td className="px-6 py-1.5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleEdit(product)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          
                          {itemToDelete === (product._id || product.id) ? (
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleDelete(product._id || product.id)}
                                className="text-xs  text-white px-2 py-1 rounded hover:"
                              >
                                Yes
                              </button>
                              <button 
                                onClick={() => setItemToDelete(null)}
                                className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded hover:bg-gray-300"
                              >
                                No
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setItemToDelete(product._id || product.id)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
