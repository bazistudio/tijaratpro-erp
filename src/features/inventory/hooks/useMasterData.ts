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
      return { options: categoryHook.categories, isLoading: categoryHook.isLoading };
    case 'brand':
      return { options: brandHook.brands, isLoading: brandHook.isLoading };
    case 'company':
      return { options: companyHook.companies, isLoading: companyHook.isLoading };
    case 'color':
      return { options: colorHook.colors, isLoading: colorHook.isLoading };
    case 'quality':
      return { options: qualityHook.qualities, isLoading: qualityHook.isLoading };
    default:
      return { options: [], isLoading: false };
  }
};
