import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { BottomNavBar } from '@/components/layout/BottomNavBar';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          // Hide default bottom tab bar - we use custom floating nav
          tabBarStyle: { display: 'none' },
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: 'Saved',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="categories"
          options={{
            title: 'Categories',
            headerShown: true,
          }}
        />
        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Account',
            headerShown: false,
          }}
        />
      </Tabs>
      <BottomNavBar />
    </View>
  );
}
