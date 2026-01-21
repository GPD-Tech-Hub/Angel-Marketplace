import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/hooks';
import { CartItem, CartSummary } from '@/components/cart';
import { Button } from '@/components/ui';

export default function CartScreen() {
  const router = useRouter();
  const { items, itemCount, subtotal, clearCart } = useCart();

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleContinueShopping = () => {
    router.push('/(tabs)');
  };

  if (itemCount === 0) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
          <Ionicons name="cart-outline" size={48} color="#9ca3af" />
        </View>
        <Text className="text-xl font-semibold text-gray-900 mb-2">
          Your cart is empty
        </Text>
        <Text className="text-gray-500 text-center mb-6">
          Looks like you haven't added anything to your cart yet
        </Text>
        <Button
          title="Start Shopping"
          onPress={handleContinueShopping}
          fullWidth
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Cart Items Header */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-semibold text-gray-900">
            Cart ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </Text>
          <TouchableOpacity onPress={clearCart}>
            <Text className="text-red-500 font-medium">Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Cart Items */}
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}

        {/* Order Summary */}
        <View className="mt-4 mb-6">
          <CartSummary subtotal={subtotal} />
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View className="px-4 py-4 bg-white border-t border-gray-100">
        <Button
          title={`Checkout - ${subtotal.toFixed(2)}`}
          onPress={handleCheckout}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}
