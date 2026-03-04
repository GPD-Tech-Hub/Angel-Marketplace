import { useCallback } from 'react';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useAuthStore } from '@/store/authStore';
import { useFavoritesQuery, useAddFavorite, useRemoveFavorite } from '@/queries/useFavorites';
import { Product } from '@/types';

/**
 * Unified favorites hook.
 * - Authenticated: reads from + writes to the API (backend Favorite table).
 * - Guest: reads from + writes to the local Zustand favoritesStore (AsyncStorage).
 */
export function useFavorites() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // API hooks (only active when authenticated)
  const { data: apiFavoritesRaw } = useFavoritesQuery({ enabled: isAuthenticated });
  const apiFavorites = apiFavoritesRaw ?? [];
  const addFavMutation = useAddFavorite();
  const removeFavMutation = useRemoveFavorite();

  // Local store (used for guests + as fallback)
  const {
    items: localItems,
    addFavorite: localAdd,
    removeFavorite: localRemove,
    toggleFavorite: localToggle,
    isFavorite: localIsFavorite,
    clearFavorites: localClear,
  } = useFavoritesStore();

  const favorites = isAuthenticated ? apiFavorites : localItems;

  const isFavorite = useCallback(
    (productId: string) => {
      if (isAuthenticated) {
        return apiFavorites.some((p) => p.id === productId);
      }
      return localIsFavorite(productId);
    },
    [isAuthenticated, apiFavorites, localIsFavorite]
  );

  const addFavorite = useCallback(
    (product: Product) => {
      if (isAuthenticated) {
        addFavMutation.mutate(product.id);
      } else {
        localAdd(product);
      }
    },
    [isAuthenticated, addFavMutation, localAdd]
  );

  const removeFavorite = useCallback(
    (productId: string) => {
      if (isAuthenticated) {
        removeFavMutation.mutate(productId);
      } else {
        localRemove(productId);
      }
    },
    [isAuthenticated, removeFavMutation, localRemove]
  );

  const toggleFavorite = useCallback(
    (product: Product) => {
      if (isFavorite(product.id)) {
        removeFavorite(product.id);
      } else {
        addFavorite(product);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  return {
    favorites,
    favoritesCount: favorites.length,
    isLoading: addFavMutation.isPending || removeFavMutation.isPending,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    isFavorite,
    clearFavorites: localClear,
  };
}

export default useFavorites;
