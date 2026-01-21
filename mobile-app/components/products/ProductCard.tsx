import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types';
import { formatCurrency, calculateDiscountPercentage } from '@/utils';
import { useFavorites } from '@/hooks';
import { config } from '@/constants/config';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isLiked = isFavorite(product.id);
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;

  const handlePress = () => {
    router.push(`/product/${product.slug}`);
  };

  const handleFavoritePress = () => {
    toggleFavorite(product);
  };

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        className="flex-row items-center bg-white rounded-xl p-3"
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: product.images[0] || config.IMAGE_PLACEHOLDER }}
          className="w-20 h-20 rounded-lg"
          contentFit="cover"
        />
        <View className="flex-1 ml-3">
          <Text className="text-sm font-medium text-gray-900" numberOfLines={2}>
            {product.name}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-base font-bold text-primary-600">
              {formatCurrency(product.price)}
            </Text>
            {hasDiscount && (
              <Text className="ml-2 text-sm text-gray-400 line-through">
                {formatCurrency(product.comparePrice!)}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={handleFavoritePress} className="p-2">
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={22}
            color={isLiked ? '#ef4444' : '#9ca3af'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  if (variant === 'compact') {
    return (
      <TouchableOpacity
        className="w-36 bg-white rounded-xl overflow-hidden"
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View className="relative">
          <Image
            source={{ uri: product.images[0] || config.IMAGE_PLACEHOLDER }}
            className="w-full h-36"
            contentFit="cover"
          />
          {hasDiscount && (
            <View className="absolute top-2 left-2 bg-red-500 px-2 py-0.5 rounded-full">
              <Text className="text-xs font-bold text-white">
                -{calculateDiscountPercentage(product.comparePrice!, product.price)}%
              </Text>
            </View>
          )}
        </View>
        <View className="p-2">
          <Text className="text-xs text-gray-900" numberOfLines={1}>
            {product.name}
          </Text>
          <Text className="text-sm font-bold text-primary-600 mt-0.5">
            {formatCurrency(product.price)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // Default variant
  return (
    <TouchableOpacity
      className="w-44 bg-white rounded-2xl overflow-hidden shadow-sm"
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View className="relative">
        <Image
          source={{ uri: product.images[0] || config.IMAGE_PLACEHOLDER }}
          className="w-full h-44"
          contentFit="cover"
        />
        {hasDiscount && (
          <View className="absolute top-2 left-2 bg-red-500 px-2 py-1 rounded-full">
            <Text className="text-xs font-bold text-white">
              -{calculateDiscountPercentage(product.comparePrice!, product.price)}%
            </Text>
          </View>
        )}
        <TouchableOpacity
          className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full items-center justify-center shadow-sm"
          onPress={handleFavoritePress}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={18}
            color={isLiked ? '#ef4444' : '#9ca3af'}
          />
        </TouchableOpacity>
      </View>
      <View className="p-3">
        <Text className="text-sm font-medium text-gray-900" numberOfLines={2}>
          {product.name}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text className="text-base font-bold text-primary-600">
            {formatCurrency(product.price)}
          </Text>
          {hasDiscount && (
            <Text className="ml-2 text-xs text-gray-400 line-through">
              {formatCurrency(product.comparePrice!)}
            </Text>
          )}
        </View>
        {product.stock <= 5 && product.stock > 0 && (
          <Text className="text-xs text-amber-600 mt-1">
            Only {product.stock} left
          </Text>
        )}
        {product.stock === 0 && (
          <Text className="text-xs text-red-500 mt-1">Out of stock</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default ProductCard;
