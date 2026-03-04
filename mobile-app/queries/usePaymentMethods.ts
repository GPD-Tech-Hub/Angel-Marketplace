import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import { ENDPOINTS } from '@/constants/endpoints';
import { ApiResponse } from '@/types';

export interface SavedPaymentMethod {
  id: string;
  type: string;
  brand?: string;
  last4?: string;
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddPaymentMethodPayload {
  type: string;
  brand?: string;
  last4?: string;
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

const PAYMENT_METHODS_KEY = ['payments', 'methods'] as const;

async function fetchPaymentMethods(): Promise<SavedPaymentMethod[]> {
  const res = await api.get<ApiResponse<{ paymentMethods: SavedPaymentMethod[] }>>(
    ENDPOINTS.PAYMENTS.LIST
  );
  return res.data.data.paymentMethods ?? [];
}

export function usePaymentMethods() {
  return useQuery({
    queryKey: PAYMENT_METHODS_KEY,
    queryFn: fetchPaymentMethods,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAddPaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AddPaymentMethodPayload): Promise<SavedPaymentMethod> => {
      const res = await api.post<ApiResponse<SavedPaymentMethod>>(
        ENDPOINTS.PAYMENTS.ADD,
        payload
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_METHODS_KEY });
    },
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await api.delete(ENDPOINTS.PAYMENTS.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_METHODS_KEY });
    },
  });
}

export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<SavedPaymentMethod> => {
      const res = await api.patch<ApiResponse<SavedPaymentMethod>>(
        ENDPOINTS.PAYMENTS.UPDATE(id),
        { isDefault: true }
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_METHODS_KEY });
    },
  });
}
