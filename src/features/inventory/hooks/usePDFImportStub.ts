// src/features/inventory/hooks/usePDFImportStub.ts

/**
 * PHASE 4.2 PREPARATION
 * 
 * This is a stub for the upcoming PDF import feature.
 * The architecture is prepared to handle batch product imports
 * which will parse PDF data and push through the same DTOs,
 * Services, and Repository pipelines as the manual form.
 */

export const usePDFImportStub = () => {
  const handleFileUpload = async (file: File) => {
    console.warn("Phase 4.2: PDF Import not yet implemented.");
    // 1. Parse PDF using backend or frontend parser
    // 2. Map PDF columns to CreateProductDTO
    // 3. Fallback SKUs (as implemented in service)
    // 4. Batch create via inventoryRepository.createProduct
  };

  return {
    handleFileUpload,
    isImporting: false,
    progress: 0,
    errors: [],
  };
};
