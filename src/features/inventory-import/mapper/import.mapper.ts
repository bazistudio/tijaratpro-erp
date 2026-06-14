// src/features/inventory-import/mapper/import.mapper.ts

import { RawImportedProduct, MappedImportedProduct } from '../pipeline/import.types';

export const importMapper = {
  /**
   * Maps raw parsed data to internal schema. Generates temporary SKUs if missing.
   */
  mapToInternal: (rawProducts: RawImportedProduct[]): MappedImportedProduct[] => {
    return rawProducts.map((p, index) => {
      let sku = p.sku;
      if (!sku || sku.trim() === '') {
        const prefix = p.name
          .replace(/[^a-zA-Z0-9]/g, '')
          .substring(0, 4)
          .toUpperCase();
        // Use index to ensure uniqueness in current batch
        const randomId = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        sku = `${prefix}-IMP${index}-${randomId}`;
      }

      return {
        ...p,
        sku
      };
    });
  }
};
