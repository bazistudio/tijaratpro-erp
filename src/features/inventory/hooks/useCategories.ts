import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../services/category.service';

export const useCategories = (options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
    enabled: options?.enabled !== false,
  });

  const createCategory = useMutation({
    mutationFn: (data: { name: string; organizationId?: string }) => 
      categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    categories,
    isLoading,
    error,
    createCategory: createCategory.mutateAsync,
    isCreating: createCategory.isPending,
  };
};
