import { useCategories } from './useCategories';
import { useBrands } from './useBrands';
import { useCompanies } from './useCompanies';
import { useColors } from './useColors';
import { useQualities } from './useQualities';

export type MasterEntity = 'category' | 'brand' | 'company' | 'color' | 'quality';

export const useMasterData = (entity: MasterEntity) => {
  // We call all hooks, but we only ENABLe the one we need to save network requests
  const categoryHook = useCategories({ enabled: entity === 'category' });
  const brandHook = useBrands({ enabled: entity === 'brand' });
  const companyHook = useCompanies({ enabled: entity === 'company' });
  const colorHook = useColors({ enabled: entity === 'color' });
  const qualityHook = useQualities({ enabled: entity === 'quality' });

  switch (entity) {
    case 'category':
      return { options: categoryHook.categories, isLoading: categoryHook.isLoading, createOption: categoryHook.createCategory, isCreating: categoryHook.isCreating, updateOption: categoryHook.updateCategory, isUpdating: categoryHook.isUpdating };
    case 'brand':
      return { options: brandHook.brands, isLoading: brandHook.isLoading, createOption: brandHook.createBrand, isCreating: brandHook.isCreating, updateOption: brandHook.updateBrand, isUpdating: brandHook.isUpdating };
    case 'company':
      return { options: companyHook.companies, isLoading: companyHook.isLoading, createOption: companyHook.createCompany, isCreating: companyHook.isCreating, updateOption: companyHook.updateCompany, isUpdating: companyHook.isUpdating };
    case 'color':
      return { options: colorHook.colors, isLoading: colorHook.isLoading, createOption: colorHook.createColor, isCreating: colorHook.isCreating, updateOption: colorHook.updateColor, isUpdating: colorHook.isUpdating };
    case 'quality':
      return { options: qualityHook.qualities, isLoading: qualityHook.isLoading, createOption: qualityHook.createQuality, isCreating: qualityHook.isCreating, updateOption: qualityHook.updateQuality, isUpdating: qualityHook.isUpdating };
    default:
      return { options: [], isLoading: false, createOption: async () => {}, isCreating: false, updateOption: async () => {}, isUpdating: false };
  }
};
