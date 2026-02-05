import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services';
import type {
  NotificationSettingsData,
  NotificationsListResponse,
} from '@/services/notifications.service';

const NOTIFICATION_REFETCH_INTERVAL_MS = 60 * 1000; // 60s – automatic refresh when screen is focused

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (page?: number, limit?: number) =>
    [...notificationKeys.all, 'list', page ?? 1, limit ?? 20] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
  settings: () => [...notificationKeys.all, 'settings'] as const,
};

export interface UseNotificationsOptions {
  page?: number;
  limit?: number;
  /** Refetch every N ms when query is active (e.g. notifications screen open). Default 60s. Set 0 to disable. */
  refetchInterval?: number;
}

export function useNotifications(options?: UseNotificationsOptions) {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const refetchInterval = options?.refetchInterval ?? NOTIFICATION_REFETCH_INTERVAL_MS;

  return useQuery({
    queryKey: notificationKeys.list(page, limit),
    queryFn: () => notificationsService.getNotifications({ page, limit }),
    refetchInterval: refetchInterval > 0 ? refetchInterval : false,
  });
}

/** Lightweight unread count for profile/tab badge. Auto-refreshes every 60s when active. */
export function useUnreadNotificationCount(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: NOTIFICATION_REFETCH_INTERVAL_MS,
    enabled: options?.enabled !== false,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useNotificationSettings() {
  return useQuery({
    queryKey: notificationKeys.settings(),
    queryFn: () => notificationsService.getSettings(),
  });
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: Partial<Omit<NotificationSettingsData, 'updatedAt'>>) =>
      notificationsService.updateSettings(settings),
    onSuccess: (data) => {
      queryClient.setQueryData(notificationKeys.settings(), data);
    },
  });
}
