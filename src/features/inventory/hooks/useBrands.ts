import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandService } from '../services/brand.service';

export const useBrands = (options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();

  const { data: brands = [], isLoading, error } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandService.getBrands(),
    enabled: options?.enabled !== false,
  });

  const createBrand = useMutation({
    mutationFn: (data: { name: string; organizationId?: string }) => 
      brandService.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });

  return {
    brands,
    isLoading,
    error,
    createBrand: createBrand.mutateAsync,
    isCreating: createBrand.isPending,
  };
};
