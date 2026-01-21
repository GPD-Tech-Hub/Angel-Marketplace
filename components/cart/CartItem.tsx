import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { CartItem as CartItemType } from '@/types';
import { formatCurrency } from '@/utils';
import { useCart } from '@/hooks';
import { config } from '@/constants/config';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { increment, decrement, removeFromCart } = useCart();
  const { product, quantity, price } = item;

  return (
    <View className="flex-row bg-white rounded-xl p-3 mb-3">
      <Image
        source={{ uri: product.images[0] || config.IMAGE_PLACEHOLDER }}
        className="w-24 h-24 rounded-lg"
        contentFit="cover"
      />
      <View className="flex-1 ml-3 justify-between">
        <View>
          <Text className="text-sm font-medium text-gray-900" numberOfLines={2}>
            {product.name}
          </Text>
          <Text className="text-base font-bold text-primary-600 mt-1">
            {formatCurrency(price)}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center bg-gray-100 rounded-lg">
            <TouchableOpacity
              className="w-8 h-8 items-center justify-center"
              onPress={() => decrement(product.id)}
            >
              <Ionicons name="remove" size={18} color="#374151" />
            </TouchableOpacity>
            <Text className="w-8 text-center font-semibold text-gray-900">
              {quantity}
            </Text>
            <TouchableOpacity
              className="w-8 h-8 items-center justify-center"
              onPress={() => increment(product.id)}
            >
              <Ionicons name="add" size={18} color="#374151" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="p-2"
            onPress={() => removeFromCart(product.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default CartItem;
