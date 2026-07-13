import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import { PaginationParams } from '../types';

export const useProducts = (params: PaginationParams) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getProducts(params),
  });

  return {
    products: data?.products || [],
    total: data?.total || 0,
    isLoading,
    error,
  };
};
