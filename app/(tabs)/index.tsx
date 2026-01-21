import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useProducts, useCategories } from '@/queries';
import { SearchBar } from '@/components/layout';
import { ProductCard, SkeletonProductCard } from '@/components';
import { config } from '@/constants/config';

export default function HomeScreen() {
  const router = useRouter();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: productsData, isLoading: productsLoading } = useProducts();

  const categories = categoriesData || [];
  const products = productsData?.pages.flatMap((page) => page.products) || [];

  const handleSearchFocus = () => {
    router.push('/search');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                {config.APP_NAME}
              </Text>
              <Text className="text-gray-500">Find your perfect product</Text>
            </View>
            <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center shadow-sm">
              <Ionicons name="notifications-outline" size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <TouchableOpacity onPress={handleSearchFocus} activeOpacity={1}>
            <SearchBar placeholder="Search products..." onFocus={handleSearchFocus} />
          </TouchableOpacity>
        </View>

        {/* Banner */}
        <View className="px-4 py-4">
          <View className="bg-primary-500 rounded-2xl p-6 overflow-hidden">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-white text-lg font-semibold mb-1">
                  Special Offer
                </Text>
                <Text className="text-white/80 text-sm mb-3">
                  Get 20% off on your first order
                </Text>
                <TouchableOpacity className="bg-white px-4 py-2 rounded-lg self-start">
                  <Text className="text-primary-600 font-semibold">Shop Now</Text>
                </TouchableOpacity>
              </View>
              <Ionicons name="gift" size={80} color="rgba(255,255,255,0.3)" />
            </View>
          </View>
        </View>

        {/* Categories */}
        <View className="py-4">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-lg font-semibold text-gray-900">Categories</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/categories')}>
              <Text className="text-primary-600 font-medium">See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories.slice(0, 8)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="items-center mr-4"
                onPress={() => router.push(`/category/${item.slug}`)}
              >
                <View className="w-16 h-16 bg-white rounded-2xl items-center justify-center shadow-sm mb-2">
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      className="w-10 h-10"
                      contentFit="contain"
                    />
                  ) : (
                    <Ionicons name="cube-outline" size={28} color="#0ea5e9" />
                  )}
                </View>
                <Text className="text-xs text-gray-600 text-center" numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              categoriesLoading ? (
                <View className="flex-row">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <View key={i} className="items-center mr-4">
                      <View className="w-16 h-16 bg-gray-200 rounded-2xl mb-2" />
                      <View className="w-12 h-3 bg-gray-200 rounded" />
                    </View>
                  ))}
                </View>
              ) : null
            }
          />
        </View>

        {/* Featured Products */}
        <View className="py-4">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              Featured Products
            </Text>
            <TouchableOpacity>
              <Text className="text-primary-600 font-medium">See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={products.slice(0, 10)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className="mr-3">
                <ProductCard product={item} />
              </View>
            )}
            ListEmptyComponent={
              productsLoading ? (
                <View className="flex-row">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <View key={i} className="mr-3">
                      <SkeletonProductCard />
                    </View>
                  ))}
                </View>
              ) : null
            }
          />
        </View>

        {/* New Arrivals */}
        <View className="py-4 pb-8">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-lg font-semibold text-gray-900">
              New Arrivals
            </Text>
            <TouchableOpacity>
              <Text className="text-primary-600 font-medium">See All</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={products.slice(0, 10)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            keyExtractor={(item) => `new-${item.id}`}
            renderItem={({ item }) => (
              <View className="mr-3">
                <ProductCard product={item} variant="compact" />
              </View>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
