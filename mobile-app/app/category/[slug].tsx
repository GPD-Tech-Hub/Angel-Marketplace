import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCategory, useCategoryProducts } from '@/queries';
import { ProductGrid } from '@/components/products';

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data: category } = useCategory(slug);
  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCategoryProducts(slug);

  const products = data?.pages.flatMap((page) => page.products) || [];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: category?.name || 'Category',
          headerBackTitle: 'Back',
        }}
      />
      <View className="flex-1 bg-gray-50">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#F43F5E" />
          </View>
        ) : (
          <ProductGrid
            products={products}
            isLoading={isLoading}
            isRefreshing={isRefetching}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onRefresh={refetch}
            onEndReached={fetchNextPage}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20">
                <Ionicons name="cube-outline" size={48} color="#9ca3af" />
                <Text className="text-gray-500 mt-4">
                  No products in this category
                </Text>
              </View>
            }
          />
        )}
      </View>
    </>
  );
}
