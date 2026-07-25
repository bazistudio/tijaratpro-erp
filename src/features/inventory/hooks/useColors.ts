import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colorService } from '../services/color.service';
import { useAuthStore } from '@/lib/auth/core/auth.store';

export const useColors = (options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const orgId = user?.organizationId || 'default';

  const { data: colors = [], isLoading, error } = useQuery({
    queryKey: ['colors', orgId],
    queryFn: () => colorService.getColors(),
    enabled: options?.enabled !== false,
  });

  const createColor = useMutation({
    mutationFn: (data: { name: string; organizationId?: string }) => 
      colorService.createColor(data),
    onSuccess: (newColor) => {
      queryClient.setQueryData(['colors', orgId], (old: any[] = []) => {
        return [...old, newColor];
      });
      queryClient.invalidateQueries({ queryKey: ['colors', orgId] });
    },
  });

  const updateColor = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) => 
      colorService.updateColor(id, data),
    onSuccess: (updatedColor) => {
      queryClient.setQueryData(['colors', orgId], (old: any[] = []) => 
        old.map((color: any) => color.id === updatedColor.id ? updatedColor : color)
      );
    },
  });

  return {
    colors,
    isLoading,
    error,
    createColor: createColor.mutateAsync,
    isCreating: createColor.isPending,
    updateColor: updateColor.mutateAsync,
    isUpdating: updateColor.isPending,
  };
};
