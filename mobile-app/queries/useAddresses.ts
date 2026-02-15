import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService } from '@/services';
import type { CreateAddressPayload } from '@/services/address.service';
import type { Address } from '@/types/user';

export const addressKeys = {
  all: ['addresses'] as const,
  list: () => [...addressKeys.all, 'list'] as const,
};

export function useAddresses() {
  return useQuery({
    queryKey: addressKeys.list(),
    queryFn: () => addressService.getAddresses(),
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAddressPayload) => addressService.createAddress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateAddressPayload> }) =>
      addressService.updateAddress(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressService.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
    },
  });
}
