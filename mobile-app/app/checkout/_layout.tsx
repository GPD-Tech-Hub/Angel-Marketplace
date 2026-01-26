import React from 'react';
import { Stack } from 'expo-router';

export default function CheckoutLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Checkout',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="payment"
        options={{
          title: 'Payment',
        }}
      />
      <Stack.Screen
        name="confirm"
        options={{
          title: 'Confirm Order',
        }}
      />
    </Stack>
  );
}
