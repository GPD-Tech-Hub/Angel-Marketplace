import api from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import { ApiResponse } from '@/types';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  data?:
    | {
        orderId?: string;
        route?: string;
        productSlug?: string;
        categorySlug?: string;
      }
    | null;
  createdAt: string;
}

export interface NotificationSettingsData {
  general:  boolean;   // master switch — all notifications
  orders:   boolean;   // order placed + cancelled
  payments: boolean;   // payment received (Stripe)
  updatedAt: string;
}

export interface NotificationsListResponse {
  notifications: NotificationItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export const notificationsService = {
  async getNotifications(params?: {
    page?: number;
    limit?: number;
  }): Promise<NotificationsListResponse> {
    const response = await api.get<ApiResponse<NotificationsListResponse>>(
      ENDPOINTS.NOTIFICATIONS.LIST,
      { params: { page: params?.page ?? 1, limit: params?.limit ?? 20 } }
    );
    return response.data.data;
  },

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await api.get<ApiResponse<{ unreadCount: number }>>(
      ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    );
    return response.data.data;
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    const response = await api.patch<ApiResponse<NotificationItem>>(
      ENDPOINTS.NOTIFICATIONS.MARK_READ(id)
    );
    return response.data.data;
  },

  async markAllAsRead(): Promise<void> {
    await api.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
  },

  async getSettings(): Promise<NotificationSettingsData> {
    const response = await api.get<ApiResponse<NotificationSettingsData>>(
      ENDPOINTS.NOTIFICATIONS.SETTINGS
    );
    return response.data.data;
  },

  async updateSettings(
    settings: Partial<Omit<NotificationSettingsData, 'updatedAt'>>
  ): Promise<NotificationSettingsData> {
    const response = await api.patch<ApiResponse<NotificationSettingsData>>(
      ENDPOINTS.NOTIFICATIONS.SETTINGS,
      settings
    );
    return response.data.data;
  },
};

export default notificationsService;
