import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/types';

interface FavoritesState {
  items: Product[];
  isLoading: boolean;

  // Actions
  addFavorite: (product: Product) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
  setFavorites: (items: Product[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      addFavorite: (product) => {
        const { items } = get();
        if (!items.find((item) => item.id === product.id)) {
          set({ items: [...items, product] });
        }
      },

      removeFavorite: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
      },

      toggleFavorite: (product) => {
        const { items } = get();
        const isFavorite = items.some((item) => item.id === product.id);

        if (isFavorite) {
          get().removeFavorite(product.id);
        } else {
          get().addFavorite(product);
        }
      },

      isFavorite: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      clearFavorites: () => {
        set({ items: [] });
      },

      setFavorites: (items) => {
        set({ items });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
