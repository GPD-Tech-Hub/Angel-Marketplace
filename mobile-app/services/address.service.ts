import api from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { ApiResponse } from '@/types';
import type { Address } from '@/types/user';

export interface AddressesListResponse {
  addresses: Address[];
}

export interface CreateAddressPayload {
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

export const addressService = {
  async getAddresses(): Promise<AddressesListResponse> {
    const response = await api.get<ApiResponse<AddressesListResponse>>(
      ENDPOINTS.USER.ADDRESSES
    );
    return response.data.data;
  },

  async createAddress(payload: CreateAddressPayload): Promise<Address & { createdAt?: string; updatedAt?: string }> {
    const response = await api.post<ApiResponse<Address & { createdAt?: string; updatedAt?: string }>>(
      ENDPOINTS.USER.ADDRESSES,
      payload
    );
    return response.data.data;
  },

  async updateAddress(
    id: string,
    payload: Partial<CreateAddressPayload>
  ): Promise<Address & { createdAt?: string; updatedAt?: string }> {
    const response = await api.patch<ApiResponse<Address & { createdAt?: string; updatedAt?: string }>>(
      ENDPOINTS.USER.ADDRESS(id),
      payload
    );
    return response.data.data;
  },

  async deleteAddress(id: string): Promise<void> {
    await api.delete(ENDPOINTS.USER.ADDRESS(id));
  },
};

export default addressService;
