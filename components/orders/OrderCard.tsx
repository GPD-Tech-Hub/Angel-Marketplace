import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '@/types';
import { formatCurrency, formatOrderDate } from '@/utils';
import { Badge } from '@/components/ui';
import { config } from '@/constants/config';

interface OrderCardProps {
  order: Order;
}

const statusConfig = {
  PENDING: { label: 'Pending', variant: 'warning' as const },
  CONFIRMED: { label: 'Confirmed', variant: 'primary' as const },
  PROCESSING: { label: 'Processing', variant: 'primary' as const },
  SHIPPED: { label: 'Shipped', variant: 'info' as const },
  DELIVERED: { label: 'Delivered', variant: 'success' as const },
  CANCELLED: { label: 'Cancelled', variant: 'error' as const },
};

export function OrderCard({ order }: OrderCardProps) {
  const router = useRouter();
  const { label, variant } = statusConfig[order.status];

  const handlePress = () => {
    router.push(`/order/${order.id}`);
  };

  // Show up to 3 product images
  const displayImages = order.items.slice(0, 3);
  const remainingCount = order.items.length - 3;

  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3"
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-xs text-gray-500">
            {formatOrderDate(order.createdAt)}
          </Text>
          <Text className="text-sm font-semibold text-gray-900">
            #{order.orderNumber}
          </Text>
        </View>
        <Badge label={label} variant={variant} size="sm" />
      </View>

      {/* Product Images */}
      <View className="flex-row mb-3">
        {displayImages.map((item, index) => (
          <Image
            key={item.id}
            source={{ uri: item.product.images[0] || config.IMAGE_PLACEHOLDER }}
            className="w-16 h-16 rounded-lg mr-2"
            contentFit="cover"
          />
        ))}
        {remainingCount > 0 && (
          <View className="w-16 h-16 rounded-lg bg-gray-100 items-center justify-center">
            <Text className="text-sm font-semibold text-gray-600">
              +{remainingCount}
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View className="flex-row items-center justify-between border-t border-gray-100 pt-3">
        <Text className="text-gray-600">
          {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-base font-bold text-gray-900">
            {formatCurrency(order.total)}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default OrderCard;
