// src/features/inventory-import/pipeline/import.types.ts

export interface RawImportedProduct {
  name: string;
  model?: string;
  category: string;
  price: number;
  quantity: number;
  sku?: string; // Optional, maybe extracted
}

export interface MappedImportedProduct extends RawImportedProduct {
  sku: string; // Enforced generated SKU if missing
}

export interface ValidatedImportedProduct extends MappedImportedProduct {
  isValid: boolean;
  errors: string[]; // e.g. "Duplicate SKU", "Duplicate Name"
}

export interface ImportPipelineResult {
  totalExtracted: number;
  validCount: number;
  errorCount: number;
  products: ValidatedImportedProduct[];
}
