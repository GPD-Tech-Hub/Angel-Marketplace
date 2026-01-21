import React from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '@/queries';
import { OrderCard } from '@/components/orders';
import { Button } from '@/components/ui';
import { useAuthStore } from '@/store';

export default function OrdersScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOrders();

  const orders = data?.pages.flatMap((page) => page.data) || [];

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleStartShopping = () => {
    router.push('/(tabs)');
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="person-outline" size={48} color="#9ca3af" />
        </View>
        <Text className="text-xl font-semibold text-gray-900 mb-2">
          Sign in to view orders
        </Text>
        <Text className="text-gray-500 text-center mb-6">
          Please sign in to see your order history
        </Text>
        <Button title="Sign In" onPress={handleLogin} fullWidth />
      </View>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="receipt-outline" size={48} color="#9ca3af" />
        </View>
        <Text className="text-xl font-semibold text-gray-900 mb-2">
          No orders yet
        </Text>
        <Text className="text-gray-500 text-center mb-6">
          When you place an order, it will appear here
        </Text>
        <Button title="Start Shopping" onPress={handleStartShopping} fullWidth />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={orders}
        renderItem={({ item }) => <OrderCard order={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#0ea5e9"
          />
        }
        onEndReached={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#0ea5e9" />
            </View>
          ) : null
        }
      />
    </View>
  );
}
