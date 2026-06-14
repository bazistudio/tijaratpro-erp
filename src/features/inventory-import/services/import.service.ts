// src/features/inventory-import/services/import.service.ts

import { RawImportedProduct, ValidatedImportedProduct, ImportPipelineResult } from '../pipeline/import.types';
import { importMapper } from '../mapper/import.mapper';
import { importValidator } from '../validator/import.validator';
import { productService } from '@/features/inventory/product/product.service';
import { stockService } from '@/features/inventory/stock/stock.service';
import { InventoryAdjustmentType } from '@/features/inventory/types';

export const importPipelineService = {
  /**
   * Stage 1: Parsing
   * Extracts raw products from PDF.
   */
  uploadAndParsePDF: async (file: File): Promise<RawImportedProduct[]> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:5000/api/import/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("PDF Parsing failed");
    }

    const data = await res.json();
    // Assuming backend returns data.products as an array of extracted products
    return data.products || [];
  },

  /**
   * Stage 2 & 3: Mapping & Validation
   * Takes raw products, converts to internal schema, and validates against ERP rules.
   */
  processPreview: async (rawProducts: RawImportedProduct[]): Promise<ImportPipelineResult> => {
    const mapped = importMapper.mapToInternal(rawProducts);
    const validated = await importValidator.validateBatch(mapped);

    const validCount = validated.filter(p => p.isValid).length;
    const errorCount = validated.filter(p => !p.isValid).length;

    return {
      totalExtracted: rawProducts.length,
      validCount,
      errorCount,
      products: validated
    };
  },

  /**
   * Stage 5: Commit
   * Commits the valid products to the database using ONLY the designated services.
   * NO direct store modifications.
   */
  commitValidProducts: async (products: ValidatedImportedProduct[]): Promise<number> => {
    const validProducts = products.filter(p => p.isValid);
    let successCount = 0;

    for (const p of validProducts) {
      try {
        // Step 1: Create Product Entity (Source of truth)
        const newProduct = await productService.createProduct({
          name: p.name,
          sku: p.sku,
          category: p.category || 'uncategorized',
          price: p.price,
          quantity: 0, // Entity creation starts with 0 stock
          lowStockThreshold: 10
        });

        // Step 2: Initialize Stock (Event-driven boundary)
        await stockService.adjustStock(
          newProduct.id || newProduct._id, 
          p.quantity, 
          InventoryAdjustmentType.RESTOCK, 
          'Initial import from PDF'
        );

        successCount++;
      } catch (err) {
        console.error(`Failed to commit product ${p.name}:`, err);
      }
    }

    return successCount;
  }
};
