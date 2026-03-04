import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

// Show notifications even when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function usePushNotifications() {
  const isAuthenticated  = useAuthStore((s) => s.isAuthenticated);
  const registeredRef    = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || registeredRef.current) return;

    async function register() {
      try {
        // Push notifications only work on physical devices
        if (!Device.isDevice) {
          console.log('[Push] Skipped: not a physical device');
          return;
        }

        // Request permission
        const { status: existing } = await Notifications.getPermissionsAsync();
        let finalStatus = existing;
        if (existing !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          console.log('[Push] Permission denied');
          return;
        }

        // Android channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('orders', {
            name: 'Order Updates',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#F43F5E',
            sound: 'default',
          });
        }

        // Get Expo push token
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
        });
        const pushToken = tokenData.data;
        console.log('[Push] Token:', pushToken);

        // Register token with backend
        await api.patch('/users/push-token', { pushToken });
        registeredRef.current = true;
      } catch (err) {
        console.warn('[Push] Registration failed:', err);
      }
    }

    register();
  }, [isAuthenticated]);

  // Clear registered flag on logout so re-login re-registers
  useEffect(() => {
    if (!isAuthenticated) {
      registeredRef.current = false;
    }
  }, [isAuthenticated]);
}
