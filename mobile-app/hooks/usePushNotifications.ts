import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import Constants from 'expo-constants';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

export function usePushNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const registeredTokenRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  function getProjectId(): string | undefined {
    const maybeConstants = Constants as unknown as {
      easConfig?: { projectId?: string };
      expoConfig?: { extra?: { eas?: { projectId?: string } } };
    };

    return (
      maybeConstants.easConfig?.projectId ||
      maybeConstants.expoConfig?.extra?.eas?.projectId ||
      process.env.EXPO_PUBLIC_PROJECT_ID
    );
  }

  function normalizeTokenData(
    tokenData: { data: unknown; type?: string } | null | undefined,
  ): string | null {
    if (!tokenData) {
      return null;
    }

    if (typeof tokenData.data === 'string') {
      return tokenData.data;
    }

    if (
      tokenData.data &&
      typeof tokenData.data === 'object' &&
      'token' in tokenData.data &&
      typeof (tokenData.data as { token?: unknown }).token === 'string'
    ) {
      return (tokenData.data as { token: string }).token;
    }

    return null;
  }

  useEffect(() => {
    async function register() {
      if (!isAuthenticated || inFlightRef.current) {
        return false;
      }

      try {
        // Expo Go is not a reliable target for this notifications setup.
        if (Constants.appOwnership === 'expo') {
          console.log('[Push] Skipped in Expo Go');
          return false;
        }

        inFlightRef.current = true;

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
          return false;
        }

        const { status: existing } = await Notifications.getPermissionsAsync();
        let finalStatus = existing;

        if (existing !== 'granted') {
          const permission = await Notifications.requestPermissionsAsync();
          finalStatus = permission.status;
        }

        if (finalStatus !== 'granted') {
          console.log('[Push] Permission denied');
          return false;
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

        const tokenData =
          Platform.OS === 'android'
            ? await Notifications.getDevicePushTokenAsync()
            : (
                getProjectId()
                  ? await Notifications.getExpoPushTokenAsync({ projectId: getProjectId() })
                  : await Notifications.getExpoPushTokenAsync()
              );

        const pushToken = normalizeTokenData(tokenData);
        if (!pushToken) {
          return false;
        }

        if (registeredTokenRef.current === pushToken) {
          return true;
        }

        await api.patch('/users/push-token', { pushToken });
        registeredTokenRef.current = pushToken;
        return true;
      } catch (err) {
        console.warn('[Push] Registration failed:', err);
        return false;
      } finally {
        inFlightRef.current = false;
      }
    }

    void register();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void register();
      }
    });

    return () => {
      sub.remove();
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      registeredTokenRef.current = null;
      inFlightRef.current = false;
    }
  }, [isAuthenticated]);
}
