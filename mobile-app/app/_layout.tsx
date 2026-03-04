import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/store/authStore';
import { ToastProvider } from '@/components/ui';
import { StripeProviderWrapper } from '@/components/layout/StripeProviderWrapper';
import { useSocket } from '@/hooks/useSocket';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import '../global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

// Runs inside QueryClientProvider so hooks can access the query client
function AppServices() {
  useSocket();
  usePushNotifications();
  return null;
}

export default function RootLayout() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StripeProviderWrapper>
          <SafeAreaProvider>
            <ToastProvider>
              <AppServices />
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
                initialRouteName="index"
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="product/[slug]" options={{ headerShown: false }} />
                <Stack.Screen name="category/[slug]" />
                <Stack.Screen name="checkout" />
                <Stack.Screen name="order/[id]" />
              </Stack>
              <StatusBar style="auto" />
            </ToastProvider>
          </SafeAreaProvider>
        </StripeProviderWrapper>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
