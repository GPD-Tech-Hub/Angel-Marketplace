import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useCategories } from '@/queries';
import { Category } from '@/types';

export default function CategoriesScreen() {
  const router = useRouter();
  const { data: categories, isLoading, error, refetch } = useCategories();

  const handleCategoryPress = (category: Category) => {
    router.push(`/category/${category.slug}`);
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      className="flex-1 m-2 bg-white rounded-2xl overflow-hidden shadow-sm"
      onPress={() => handleCategoryPress(item)}
      activeOpacity={0.7}
    >
      <View className="aspect-square items-center justify-center p-4">
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            className="w-20 h-20"
            contentFit="contain"
          />
        ) : (
          <View className="w-20 h-20 bg-primary-50 rounded-full items-center justify-center">
            <Ionicons name="cube-outline" size={40} color="#0ea5e9" />
          </View>
        )}
      </View>
      <View className="p-3 pt-0">
        <Text className="text-base font-semibold text-gray-900 text-center" numberOfLines={1}>
          {item.name}
        </Text>
        {item.productCount !== undefined && (
          <Text className="text-sm text-gray-500 text-center mt-1">
            {item.productCount} products
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-4">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="text-gray-600 text-center mt-4">
          Failed to load categories
        </Text>
        <TouchableOpacity
          className="mt-4 bg-primary-600 px-6 py-3 rounded-xl"
          onPress={() => refetch()}
        >
          <Text className="text-white font-semibold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 8 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500">No categories found</Text>
          </View>
        }
      />
    </View>
  );
}
