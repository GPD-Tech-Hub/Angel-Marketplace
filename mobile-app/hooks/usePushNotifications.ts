import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

export function usePushNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || registeredRef.current) {
      return;
    }

    async function register() {
      try {
        // Expo Go is not a reliable target for this notifications setup.
        if (Constants.appOwnership === 'expo') {
          console.log('[Push] Skipped in Expo Go');
          return;
        }

        const Notifications = await import('expo-notifications');
        const Device = await import('expo-device');

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          }),
        });

        if (!Device.isDevice) {
          console.log('[Push] Skipped: not a physical device');
          return;
        }

        const { status: existing } = await Notifications.getPermissionsAsync();
        let finalStatus = existing;

        if (existing !== 'granted') {
          const permission = await Notifications.requestPermissionsAsync();
          finalStatus = permission.status;
        }

        if (finalStatus !== 'granted') {
          console.log('[Push] Permission denied');
          return;
        }

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('orders', {
            name: 'Order Updates',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#F43F5E',
            sound: 'default',
          });
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
        });

        await api.patch('/users/push-token', { pushToken: tokenData.data });
        registeredRef.current = true;
      } catch (err) {
        console.warn('[Push] Registration failed:', err);
      }
    }

    register();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      registeredRef.current = false;
    }
  }, [isAuthenticated]);
}
