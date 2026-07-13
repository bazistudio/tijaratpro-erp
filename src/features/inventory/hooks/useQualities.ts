import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { qualityService } from '../services/quality.service';

export const useQualities = (options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();

  const { data: qualities = [], isLoading, error } = useQuery({
    queryKey: ['qualities'],
    queryFn: () => qualityService.getQualities(),
    enabled: options?.enabled !== false,
  });

  const createQuality = useMutation({
    mutationFn: (data: { name: string; organizationId?: string }) => 
      qualityService.createQuality(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qualities'] });
    },
  });

  return {
    qualities,
    isLoading,
    error,
    createQuality: createQuality.mutateAsync,
    isCreating: createQuality.isPending,
  };
};
