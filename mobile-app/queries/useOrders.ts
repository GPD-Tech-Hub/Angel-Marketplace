import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { ordersService } from '@/services';
import { CreateOrderPayload, Order } from '@/types';
import { config } from '@/constants/config';

// Query keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: () => [...orderKeys.lists()] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

// Get user orders (infinite scroll). Pass { enabled: isAuthenticated } to avoid 401 when logged out.
export function useOrders(options?: { enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: orderKeys.list(),
    queryFn: ({ pageParam = 1 }) =>
      ordersService.getOrders(pageParam, config.PAGINATION_LIMIT),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: options?.enabled !== false,
  });
}

// Get single order by ID
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => ordersService.getOrder(orderId),
    enabled: !!orderId,
  });
}

// Create order mutation
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersService.createOrder(payload),
    onSuccess: (newOrder) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      // Add the new order to cache
      queryClient.setQueryData(orderKeys.detail(newOrder.id), newOrder);
    },
  });
}

// Cancel order mutation
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => ordersService.cancelOrder(orderId),
    onSuccess: (updatedOrder) => {
      // Update the order in cache
      queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder);
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
