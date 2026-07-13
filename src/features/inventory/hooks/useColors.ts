import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colorService } from '../services/color.service';

export const useColors = (options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();

  const { data: colors = [], isLoading, error } = useQuery({
    queryKey: ['colors'],
    queryFn: () => colorService.getColors(),
    enabled: options?.enabled !== false,
  });

  const createColor = useMutation({
    mutationFn: (data: { name: string; organizationId?: string }) => 
      colorService.createColor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colors'] });
    },
  });

  return {
    colors,
    isLoading,
    error,
    createColor: createColor.mutateAsync,
    isCreating: createColor.isPending,
  };
};
