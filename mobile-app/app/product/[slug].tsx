import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useProduct, useAddCartItem } from '@/queries';
import { useCart, useFavorites } from '@/hooks';
import { useAuthStore } from '@/store';
import { Button } from '@/components/ui';
import { formatCurrency, calculateDiscountPercentage } from '@/utils';
import { config } from '@/constants/config';
import { colors } from '@/constants/colors';

const { width: screenWidth } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: product, isLoading, error } = useProduct(slug);
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const addCartItemMutation = useAddCartItem();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const isLiked = product ? isFavorite(product.id) : false;
  const inCart = product ? isInCart(product.id) : false;
  const cartQuantity = product ? getItemQuantity(product.id) : 0;
  const hasDiscount = product?.comparePrice && product.comparePrice > product.price;

  const handleAddToCart = async () => {
    if (!product) return;
    setAddingToCart(true);
    try {
      if (isAuthenticated) {
        // Authenticated: persist to API cart
        await addCartItemMutation.mutateAsync({ productId: product.id, quantity });
      } else {
        // Guest: persist to local Zustand store
        addToCart(product, quantity);
      }
    } catch {
      Alert.alert('Error', 'Could not add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await handleAddToCart();
    router.push('/checkout');
  };

  const handleToggleFavorite = () => {
    if (product) toggleFavorite(product);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color={colors.brand} />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text className="text-gray-600 text-center mt-4">Failed to load product</Text>
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
                  cachePolicy="memory-disk"
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

          {/* Image indicators */}
          {product.images.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center">
              {product.images.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    marginHorizontal: 4,
                    backgroundColor: index === selectedImageIndex ? colors.brand : colors.gray[300],
                  }}
                />
              ))}
            </View>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <View
              className="absolute top-16 left-4 px-3 py-1 rounded-full"
              style={{ backgroundColor: colors.brand }}
            >
              <Text className="text-white font-bold text-sm">
                -{calculateDiscountPercentage(product.comparePrice!, product.price)}%
              </Text>
            </View>
          )}

          {/* Back button */}
          <TouchableOpacity
            className="absolute top-12 left-4 w-10 h-10 bg-white rounded-full items-center justify-center"
            style={{ shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color={colors.gray[900]} />
          </TouchableOpacity>

          {/* Favourite button */}
          <TouchableOpacity
            className="absolute top-12 right-4 w-10 h-10 bg-white rounded-full items-center justify-center"
            style={{ shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={isLiked ? colors.brand : colors.gray[700]}
            />
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View className="px-4 py-6">
          {product.category && (
            <Text className="text-sm font-medium mb-2" style={{ color: colors.brand }}>
              {product.category.name}
            </Text>
          )}

          <Text className="text-2xl font-bold text-gray-900 mb-2">{product.name}</Text>

          {/* Rating */}
          {(product as any).rating > 0 && (
            <View className="flex-row items-center mb-3">
              <Ionicons name="star" size={16} color="#FBBF24" />
              <Text className="ml-1 text-gray-600 text-sm">
                {(product as any).rating.toFixed(1)}
                {(product as any).reviewsCount > 0
                  ? ` (${(product as any).reviewsCount} reviews)`
                  : ''}
              </Text>
            </View>
          )}

          {/* Price */}
          <View className="flex-row items-center mb-4">
            <Text className="text-2xl font-bold" style={{ color: colors.brand }}>
              {formatCurrency(product.price)}
            </Text>
            {hasDiscount && (
              <Text className="ml-3 text-lg text-gray-400 line-through">
                {formatCurrency(product.comparePrice!)}
              </Text>
            )}
          </View>

          {/* Stock status */}
          {product.stock > 0 ? (
            <View className="flex-row items-center mb-4">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <Text className="text-green-600 text-sm">In Stock ({product.stock} available)</Text>
            </View>
          ) : (
            <View className="flex-row items-center mb-4">
              <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
              <Text className="text-red-600 text-sm">Out of Stock</Text>
            </View>
          )}

          {/* Description */}
          <Text className="text-base font-semibold text-gray-900 mb-2">Description</Text>
          <Text className="text-gray-600 leading-6 mb-6">{product.description}</Text>

          {/* Quantity selector */}
          <View className="flex-row items-center mb-6">
            <Text className="text-base font-medium text-gray-900 mr-4">Quantity:</Text>
            <View className="flex-row items-center bg-gray-100 rounded-xl overflow-hidden">
              <TouchableOpacity
                className="w-10 h-10 items-center justify-center"
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={20} color={colors.gray[700]} />
              </TouchableOpacity>
              <Text className="w-10 text-center font-semibold text-gray-900">{quantity}</Text>
              <TouchableOpacity
                className="w-10 h-10 items-center justify-center"
                onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={quantity >= product.stock ? colors.gray[400] : colors.gray[700]}
                />
              </TouchableOpacity>
            </View>
            {inCart && (
              <Text className="ml-4 text-sm" style={{ color: colors.gray[500] }}>
                ({cartQuantity} in cart)
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <SafeAreaView edges={['bottom']} className="bg-white border-t border-gray-100">
        <View className="flex-row px-4 py-3 gap-3">
          <Button
            title={addingToCart ? 'Adding…' : inCart ? 'In Cart' : 'Add to Cart'}
            variant="outline"
            onPress={handleAddToCart}
            disabled={product.stock === 0 || addingToCart}
            className="flex-1"
          />
          <Button
            title="Buy Now"
            onPress={handleBuyNow}
            disabled={product.stock === 0 || addingToCart}
            className="flex-1"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}
