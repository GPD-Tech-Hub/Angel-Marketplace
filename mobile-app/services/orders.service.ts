import api from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { Order, CreateOrderPayload, ApiResponse, PaginatedResponse } from '@/types';

export const ordersService = {
  async getOrders(page: number = 1, limit: number = 20): Promise<PaginatedResponse<Order>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Order>>>(
      `${ENDPOINTS.ORDERS.LIST}?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  async getOrder(orderId: string): Promise<Order> {
    const response = await api.get<ApiResponse<Order>>(
      ENDPOINTS.ORDERS.DETAIL(orderId)
    );
    return response.data.data;
  },

  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const response = await api.post<ApiResponse<Order>>(
      ENDPOINTS.ORDERS.CREATE,
      payload
    );
    return response.data.data;
  },

  async cancelOrder(orderId: string): Promise<Order> {
    const response = await api.post<ApiResponse<Order>>(
      ENDPOINTS.ORDERS.CANCEL(orderId)
    );
    return response.data.data;
  },

  async leaveReview(orderId: string, rating: number, comment: string): Promise<void> {
    await api.post(ENDPOINTS.ORDERS.REVIEW(orderId), { rating, comment });
  },
};

export default ordersService;
