import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useProduct } from '@/queries';
import { useCart, useFavorites } from '@/hooks';
import { Button } from '@/components/ui';
import { formatCurrency, calculateDiscountPercentage } from '@/utils';
import { config } from '@/constants/config';

const { width: screenWidth } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const { data: product, isLoading, error } = useProduct(slug);
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const isLiked = product ? isFavorite(product.id) : false;
  const inCart = product ? isInCart(product.id) : false;
  const cartQuantity = product ? getItemQuantity(product.id) : 0;
  const hasDiscount = product?.comparePrice && product.comparePrice > product.price;

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      router.push('/checkout');
    }
  };

  const handleToggleFavorite = () => {
    if (product) {
      toggleFavorite(product);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="text-gray-600 text-center mt-4">
          Failed to load product
        </Text>
        <Button title="Go Back" onPress={() => router.back()} className="mt-4" />
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
              setSelectedImageIndex(index);
            }}
          >
            {product.images.length > 0 ? (
              product.images.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={{ width: screenWidth, height: screenWidth }}
                  contentFit="cover"
                />
              ))
            ) : (
              <Image
                source={{ uri: config.IMAGE_PLACEHOLDER }}
                style={{ width: screenWidth, height: screenWidth }}
                contentFit="cover"
              />
            )}
          </ScrollView>

          {/* Image Indicators */}
          {product.images.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
              {product.images.map((_, index) => (
                <View
                  key={index}
                  className={`w-2 h-2 rounded-full mx-1 ${
                    index === selectedImageIndex ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </View>
          )}

          {/* Discount Badge */}
          {hasDiscount && (
            <View className="absolute top-16 left-4 bg-red-500 px-3 py-1 rounded-full">
              <Text className="text-white font-bold">
                -{calculateDiscountPercentage(product.comparePrice!, product.price)}%
              </Text>
            </View>
          )}

          {/* Favorite Button */}
          <TouchableOpacity
            className="absolute top-16 right-4 w-10 h-10 bg-white rounded-full items-center justify-center shadow-md"
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? '#ef4444' : '#374151'}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View className="px-4 py-6">
          {/* Category */}
          {product.category && (
            <Text className="text-primary-600 text-sm font-medium mb-2">
              {product.category.name}
            </Text>
          )}

          {/* Name */}
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {product.name}
          </Text>

          {/* Price */}
          <View className="flex-row items-center mb-4">
            <Text className="text-2xl font-bold text-primary-600">
              {formatCurrency(product.price)}
            </Text>
            {hasDiscount && (
              <Text className="ml-3 text-lg text-gray-400 line-through">
                {formatCurrency(product.comparePrice!)}
              </Text>
            )}
          </View>

          {/* Stock Status */}
          {product.stock > 0 ? (
            <View className="flex-row items-center mb-4">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <Text className="text-green-600">
                In Stock ({product.stock} available)
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center mb-4">
              <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
              <Text className="text-red-600">Out of Stock</Text>
            </View>
          )}

          {/* Description */}
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            Description
          </Text>
          <Text className="text-gray-600 leading-6 mb-6">
            {product.description}
          </Text>

          {/* Quantity Selector */}
          <View className="flex-row items-center mb-6">
            <Text className="text-base font-medium text-gray-900 mr-4">
              Quantity:
            </Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl">
              <TouchableOpacity
                className="w-10 h-10 items-center justify-center"
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={20} color="#374151" />
              </TouchableOpacity>
              <Text className="w-10 text-center font-semibold text-gray-900">
                {quantity}
              </Text>
              <TouchableOpacity
                className="w-10 h-10 items-center justify-center"
                onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={quantity >= product.stock ? '#9ca3af' : '#374151'}
                />
              </TouchableOpacity>
            </View>
            {inCart && (
              <Text className="ml-4 text-gray-500">
                ({cartQuantity} in cart)
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <SafeAreaView edges={['bottom']} className="bg-white border-t border-gray-100">
        <View className="flex-row px-4 py-3 gap-3">
          <Button
            title="Add to Cart"
            variant="outline"
            onPress={handleAddToCart}
            disabled={product.stock === 0}
            className="flex-1"
          />
          <Button
            title="Buy Now"
            onPress={handleBuyNow}
            disabled={product.stock === 0}
            className="flex-1"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
