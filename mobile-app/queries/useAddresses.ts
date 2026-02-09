import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addressService } from '@/services';
import type { CreateAddressPayload } from '@/services/address.service';
import type { Address } from '@/types/user';

export const addressKeys = {
  all: ['addresses'] as const,
  list: () => [...addressKeys.all, 'list'] as const,
};

/** Mock addresses for frontend-only dev (backend not hosted yet) */
const MOCK_ADDRESSES: Address[] = [
  {
    id: 'mock-1',
    userId: 'mock-user',
    firstName: 'Jane',
    lastName: 'Doe',
    address: '925 S Chugach St',
    apartment: 'APT 10',
    city: 'Anchorage',
    state: 'Alaska',
    zipCode: '99645',
    country: 'USA',
    phone: '+1 555 123 4567',
    isDefault: true,
  },
  {
    id: 'mock-2',
    userId: 'mock-user',
    firstName: 'John',
    lastName: 'Smith',
    address: '123 Main St',
    apartment: undefined,
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    country: 'USA',
    phone: '+1 555 987 6543',
    isDefault: false,
  },
];

export function useAddresses() {
  return useQuery({
    queryKey: addressKeys.list(),
    queryFn: async () => {
      if (__DEV__) {
        return { addresses: MOCK_ADDRESSES };
      }
      return addressService.getAddresses();
    },
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
