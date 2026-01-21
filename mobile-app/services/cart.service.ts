import api from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { Cart, CartItem, AddToCartPayload, UpdateCartItemPayload, ApiResponse } from '@/types';

export const cartService = {
  async getCart(): Promise<Cart> {
    const response = await api.get<ApiResponse<Cart>>(ENDPOINTS.CART.GET);
    return response.data.data;
  },

  async addItem(payload: AddToCartPayload): Promise<CartItem> {
    const response = await api.post<ApiResponse<CartItem>>(
      ENDPOINTS.CART.ADD_ITEM,
      payload
    );
    return response.data.data;
  },

  async updateItem(itemId: string, payload: UpdateCartItemPayload): Promise<CartItem> {
    const response = await api.patch<ApiResponse<CartItem>>(
      ENDPOINTS.CART.UPDATE_ITEM(itemId),
      payload
    );
    return response.data.data;
  },

  async removeItem(itemId: string): Promise<void> {
    await api.delete(ENDPOINTS.CART.REMOVE_ITEM(itemId));
  },

  async clearCart(): Promise<void> {
    await api.delete(ENDPOINTS.CART.CLEAR);
  },
};

export default cartService;
