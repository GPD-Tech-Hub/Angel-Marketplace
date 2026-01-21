import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { productsService } from '@/services';
import { config } from '@/constants/config';

// Query keys
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: () => [...categoryKeys.lists()] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (slug: string) => [...categoryKeys.details(), slug] as const,
  products: (slug: string) => [...categoryKeys.all, 'products', slug] as const,
};

// Get all categories
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => productsService.getCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes - categories don't change often
  });
}

// Get single category by slug
export function useCategory(slug: string) {
  return useQuery({
    queryKey: categoryKeys.detail(slug),
    queryFn: () => productsService.getCategory(slug),
    enabled: !!slug,
  });
}

// Get products by category (infinite scroll)
export function useCategoryProducts(slug: string) {
  return useInfiniteQuery({
    queryKey: categoryKeys.products(slug),
    queryFn: ({ pageParam = 1 }) =>
      productsService.getCategoryProducts(slug, pageParam, config.PAGINATION_LIMIT),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!slug,
  });
}
