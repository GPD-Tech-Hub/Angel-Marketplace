import { useQuery, useInfiniteQuery, UseQueryOptions } from '@tanstack/react-query';
import { productsService } from '@/services';
import { Product, PaginatedProducts, ProductFilters } from '@/types';
import { config } from '@/constants/config';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
  search: (query: string) => [...productKeys.all, 'search', query] as const,
  ads: (limit: number, categorySlug?: string) =>
    [...productKeys.all, 'ads', limit, categorySlug ?? 'all'] as const,
};

// Get paginated products (infinite scroll)
export function useProducts(filters?: ProductFilters) {
  return useInfiniteQuery({
    queryKey: productKeys.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      productsService.getProducts(filters, pageParam, config.PAGINATION_LIMIT),
    getNextPageParam: (lastPage: PaginatedProducts) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
}

// Get single product by slug
export function useProduct(
  slug: string,
  options?: Omit<UseQueryOptions<Product>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => productsService.getProduct(slug),
    enabled: !!slug,
    ...options,
  });
}

// Search products
export function useProductSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn: () => productsService.searchProducts(query),
    enabled: enabled && query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Trending products (for home)
export function useTrendingProducts(limit: number = 10) {
  return useQuery({
    queryKey: [...productKeys.all, 'trending', limit] as const,
    queryFn: () => productsService.getTrending(limit),
    staleTime: 1000 * 60 * 5,
  });
}

// Home ads/banners
export function useAds(limit: number = 5, categorySlug?: string) {
  return useQuery({
    queryKey: productKeys.ads(limit, categorySlug),
    queryFn: () => productsService.getAds(limit, categorySlug),
    staleTime: 1000 * 60 * 5,
  });
}
