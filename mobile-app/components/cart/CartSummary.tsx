import React from 'react';
import { View, Text } from 'react-native';
import { formatCurrency } from '@/utils';

interface CartSummaryProps {
  subtotal: number;
  shipping?: number;
  discount?: number;
  total?: number;
}

export function CartSummary({
  subtotal,
  shipping = 0,
  discount = 0,
  total,
}: CartSummaryProps) {
  const calculatedTotal = total ?? subtotal + shipping - discount;

  return (
    <View className="bg-white rounded-xl p-4">
      <Text className="text-lg font-semibold text-gray-900 mb-3">
        Order Summary
      </Text>
      
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-600">Subtotal</Text>
        <Text className="text-gray-900 font-medium">{formatCurrency(subtotal)}</Text>
      </View>
      
      <View className="flex-row justify-between mb-2">
        <Text className="text-gray-600">Shipping</Text>
        <Text className="text-gray-900 font-medium">
          {shipping > 0 ? formatCurrency(shipping) : 'Free'}
        </Text>
      </View>
      
      {discount > 0 && (
        <View className="flex-row justify-between mb-2">
          <Text className="text-green-600">Discount</Text>
          <Text className="text-green-600 font-medium">
            -{formatCurrency(discount)}
          </Text>
        </View>
      )}
      
      <View className="border-t border-gray-200 mt-2 pt-3">
        <View className="flex-row justify-between">
          <Text className="text-lg font-semibold text-gray-900">Total</Text>
          <Text className="text-lg font-bold text-primary-600">
            {formatCurrency(calculatedTotal)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default CartSummary;
