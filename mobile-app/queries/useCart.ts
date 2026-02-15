import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services';
import type { AddToCartPayload, UpdateCartItemPayload } from '@/types';

export const cartKeys = {
  all: ['cart'] as const,
  get: () => [...cartKeys.all] as const,
};

export function useCartQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: cartKeys.get(),
    queryFn: () => cartService.getCart(),
    enabled: options?.enabled !== false,
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AddToCartPayload) => cartService.addItem(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, payload }: { itemId: string; payload: UpdateCartItemPayload }) =>
      cartService.updateItem(itemId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => cartService.removeItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKeys.all }),
  });
}
