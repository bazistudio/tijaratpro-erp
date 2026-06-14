// src/features/inventory-import/validator/import.validator.ts

import { MappedImportedProduct, ValidatedImportedProduct } from '../pipeline/import.types';
import { productService } from '@/features/inventory/product/product.service';

export const importValidator = {
  /**
   * Validates mapped products against core ERP rules using the single-writer Product Service.
   */
  validateBatch: async (products: MappedImportedProduct[]): Promise<ValidatedImportedProduct[]> => {
    const validatedProducts: ValidatedImportedProduct[] = [];

    // Validating sequentially to maintain accurate checking against the current DB state.
    // In a real high-throughput system, we might bulk-validate.
    for (const p of products) {
      let isValid = true;
      const errors: string[] = [];

      try {
        await productService.validateNewProduct(p.name, p.sku);
      } catch (err: any) {
        isValid = false;
        errors.push(err.message || 'Validation failed');
      }

      // We also enforce basic required fields here
      if (p.price <= 0) {
        isValid = false;
        errors.push('Price must be greater than 0');
      }
      
      if (p.quantity < 0) {
        isValid = false;
        errors.push('Quantity cannot be negative');
      }

      validatedProducts.push({
        ...p,
        isValid,
        errors
      });
    }

    return validatedProducts;
  }
};
