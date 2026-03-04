import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { ENDPOINTS } from '@/constants/endpoints';
import { Product } from '@/types';

export interface FavoriteProduct extends Product {}

const FAVORITES_KEY = ['favorites'] as const;

export function useFavoritesQuery(options?: { enabled?: boolean }) {
  return useQuery<FavoriteProduct[]>({
    queryKey: FAVORITES_KEY,
    queryFn: async () => {
      const res = await api.get(ENDPOINTS.FAVORITES.LIST);
      // Backend returns { products: [...] }
      const raw = res.data.data;
      if (Array.isArray(raw)) return raw;
      if (raw && Array.isArray(raw.products)) return raw.products;
      return [];
    },
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled !== false,
  });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      await api.post(ENDPOINTS.FAVORITES.ADD, { productId });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAVORITES_KEY });
    },
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(ENDPOINTS.FAVORITES.REMOVE(productId));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: FAVORITES_KEY });
    },
  });
}
