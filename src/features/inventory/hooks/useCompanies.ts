import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '../services/company.service';

export const useCompanies = (options?: { enabled?: boolean }) => {
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: () => companyService.getCompanies(),
    enabled: options?.enabled !== false,
  });

  const createCompany = useMutation({
    mutationFn: (data: { name: string; organizationId?: string }) => 
      companyService.createCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
  });

  return {
    companies,
    isLoading,
    error,
    createCompany: createCompany.mutateAsync,
    isCreating: createCompany.isPending,
  };
};
