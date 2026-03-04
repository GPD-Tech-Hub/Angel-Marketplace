import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { config } from '@/constants/config';
import { notificationKeys } from '@/queries/useNotifications';
import { orderKeys } from '@/queries/useOrders';

// Strip /api suffix — socket connects to the server root
const SOCKET_URL = config.API_URL.replace(/\/api\/?$/, '');

export function useSocket() {
  const queryClient    = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const getAccessToken  = useAuthStore((s) => s.getAccessToken);
  const socketRef       = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    let cancelled = false;

    async function connect() {
      const token = await getAccessToken();
      if (!token || cancelled) return;

      // Don't reconnect if already connected
      if (socketRef.current?.connected) return;

      const socket = io(SOCKET_URL, {
        path: '/socket.io',
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 10,
      });

      socket.on('connect', () => {
        console.log('[Socket] Connected:', socket.id);
      });

      socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
      });

      socket.on('connect_error', (err) => {
        console.warn('[Socket] Connection error:', err.message);
      });

      // ── Real-time notification ──────────────────────────────────────────
      socket.on('notification', (payload) => {
        // Immediately invalidate the notifications list so the screen
        // re-fetches and shows the new item, and update the unread badge
        queryClient.invalidateQueries({ queryKey: notificationKeys.all });

        // If this is an order notification, also refresh the orders list
        // and any open order detail so the status updates in real time
        if (payload?.type === 'order') {
          queryClient.invalidateQueries({ queryKey: orderKeys.all });
        }
      });

      socketRef.current = socket;
    }

    connect();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated]);
}
