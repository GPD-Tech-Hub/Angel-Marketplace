import { useCallback } from 'react';
import { useFavoritesStore } from '@/store';
import { Product } from '@/types';

export function useFavorites() {
  const {
    items,
    isLoading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  } = useFavoritesStore();

  const handleToggleFavorite = useCallback(
    (product: Product) => {
      toggleFavorite(product);
    },
    [toggleFavorite]
  );

  const handleAddFavorite = useCallback(
    (product: Product) => {
      addFavorite(product);
    },
    [addFavorite]
  );

  const handleRemoveFavorite = useCallback(
    (productId: string) => {
      removeFavorite(productId);
    },
    [removeFavorite]
  );

  const handleClearFavorites = useCallback(() => {
    clearFavorites();
  }, [clearFavorites]);

  return {
    favorites: items,
    favoritesCount: items.length,
    isLoading,
    toggleFavorite: handleToggleFavorite,
    addFavorite: handleAddFavorite,
    removeFavorite: handleRemoveFavorite,
    isFavorite,
    clearFavorites: handleClearFavorites,
  };
}

export default useFavorites;
