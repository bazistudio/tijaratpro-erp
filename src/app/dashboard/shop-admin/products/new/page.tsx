import { ProductForm } from '@/features/inventory/product/components/ProductForm';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Product | TijaratPro",
  description: "Create a new product for your shop inventory",
};

export default function NewProductPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ProductForm />
      </div>
    </div>
  );
}
