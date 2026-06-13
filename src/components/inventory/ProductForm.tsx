'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Package, UploadCloud, ArrowLeft, Loader2, DollarSign, Tag, Hash, FileText } from 'lucide-react';

import { 
  selectCategories, 
  selectIsCategoriesLoading, 
  selectFetchCategories, 
  selectCreateProduct 
} from '@/features/inventory/store/inventory.selectors';

// Zod schema for form validation
const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
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

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      quantity: 0,
      lowStockThreshold: 5,
    }
  });

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await createProduct(data, imageFile || undefined);
      router.push('/dashboard/shop-admin/inventory');
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'An error occurred while creating the product.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center gap-4 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Add New Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
        
        {/* Basic Info */}
        <div className="space-y-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Tag className="h-4 w-4" />
              </div>
              <input
                {...register("name")}
                placeholder="e.g. Samsung Galaxy S24 Ultra"
                className="pl-10 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 px-4 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors"
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
              <select
                {...register("category")}
                className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 px-4 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors"
                disabled={isCategoriesLoading}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
              <input
                {...register("brand")}
                placeholder="e.g. Samsung"
                className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 px-4 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="space-y-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Pricing & Stock</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selling Price *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <DollarSign className="h-4 w-4" />
                </div>
                <input
                  type="number"
                  {...register("price", { valueAsNumber: true })}
                  placeholder="0.00"
                  className="pl-10 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 px-4 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors"
                />
              </div>
              {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Price</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <DollarSign className="h-4 w-4" />
                </div>
                <input
                  type="number"
                  {...register("purchasePrice", { valueAsNumber: true })}
                  placeholder="0.00"
                  className="pl-10 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 px-4 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Initial Stock *</label>
              <input
                type="number"
                {...register("quantity", { valueAsNumber: true })}
                placeholder="0"
                className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 px-4 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors"
              />
              {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Low Stock Alert At</label>
              <input
                type="number"
                {...register("lowStockThreshold", { valueAsNumber: true })}
                placeholder="5"
                className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 px-4 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Identification */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Identification</h2>
            <span className="text-xs text-gray-500">Auto-generated if empty</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Hash className="h-4 w-4" />
                </div>
                <input
                  {...register("sku")}
                  placeholder="Optional"
                  className="pl-10 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 px-4 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Barcode</label>
              <input
                {...register("barcode")}
                placeholder="Optional"
                className="block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 px-4 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Media & Details */}
        <div className="space-y-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Media & Details</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Image</label>
            <div className="mt-1 flex justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 px-6 py-8 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="text-center">
                {imagePreview ? (
                  <div className="relative mx-auto w-32 h-32 mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <UploadCloud className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                )}
                
                <div className="mt-2 flex text-sm leading-6 text-gray-600 dark:text-gray-400 justify-center">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-transparent font-semibold text-[#006970] focus-within:outline-none hover:text-[#005a60]"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                <FileText className="h-4 w-4" />
              </div>
              <textarea
                {...register("description")}
                rows={3}
                className="pl-10 block w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3 px-4 text-sm focus:border-[#006970] focus:ring-[#006970] dark:text-white transition-colors resize-none"
                placeholder="Product description and details..."
              />
            </div>
          </div>
        </div>

        {submitError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
            {submitError}
          </div>
        )}

        <div className="pt-4 flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-[#006970] hover:bg-[#005a60] text-white px-4 py-3 rounded-xl font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Product'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
