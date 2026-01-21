import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useOrder } from '@/queries';
import { OrderTimeline } from '@/components/orders';
import { Button, Card, Badge } from '@/components/ui';
import { formatCurrency, formatOrderDate } from '@/utils';
import { config } from '@/constants/config';

const statusConfig = {
  PENDING: { label: 'Pending', variant: 'warning' as const },
  CONFIRMED: { label: 'Confirmed', variant: 'primary' as const },
  PROCESSING: { label: 'Processing', variant: 'primary' as const },
  SHIPPED: { label: 'Shipped', variant: 'primary' as const },
  DELIVERED: { label: 'Delivered', variant: 'success' as const },
  CANCELLED: { label: 'Cancelled', variant: 'error' as const },
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: order, isLoading, error, refetch } = useOrder(id);

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
        <Text className="text-gray-600 text-center mt-4">
          Failed to load order details
        </Text>
        <Button title="Try Again" onPress={() => refetch()} className="mt-4" />
      </View>
    );
  }

  const { label, variant } = statusConfig[order.status];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: `Order #${order.orderNumber}`,
          headerBackTitle: 'Back',
        }}
      />
      <ScrollView className="flex-1 bg-gray-50 px-4 pt-4">
        {/* Order Header */}
        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-gray-500">
                {formatOrderDate(order.createdAt)}
              </Text>
              <Text className="text-lg font-semibold text-gray-900">
                #{order.orderNumber}
              </Text>
            </View>
            <Badge label={label} variant={variant} />
          </View>
        </Card>

        {/* Order Timeline */}
        <View className="mb-4">
          <OrderTimeline
            currentStatus={order.status}
            createdAt={order.createdAt}
            updatedAt={order.updatedAt}
          />
        </View>

        {/* Tracking Info */}
        {order.trackingNumber && (
          <Card className="mb-4">
            <View className="flex-row items-center">
              <Ionicons name="airplane-outline" size={20} color="#0ea5e9" />
              <Text className="text-base font-semibold text-gray-900 ml-2">
                Tracking
              </Text>
            </View>
            <TouchableOpacity className="mt-2 flex-row items-center">
              <Text className="text-primary-600 font-medium">
                {order.trackingNumber}
              </Text>
              <Ionicons name="copy-outline" size={16} color="#0ea5e9" className="ml-2" />
            </TouchableOpacity>
          </Card>
        )}

        {/* Order Items */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Items ({order.items.length})
          </Text>
          {order.items.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
              onPress={() => router.push(`/product/${item.product.slug}`)}
            >
              <Image
                source={{ uri: item.product.images[0] || config.IMAGE_PLACEHOLDER }}
                className="w-16 h-16 rounded-lg"
                contentFit="cover"
              />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                  {item.product.name}
                </Text>
                <Text className="text-sm text-gray-500">
                  {formatCurrency(item.price)} x {item.quantity}
                </Text>
              </View>
              <Text className="font-semibold text-gray-900">
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Shipping Address */}
        <Card className="mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="location-outline" size={20} color="#0ea5e9" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">
              Shipping Address
            </Text>
          </View>
          <Text className="text-gray-900">
            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
          </Text>
          <Text className="text-gray-600">
            {order.shippingAddress.address}
            {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}
          </Text>
          <Text className="text-gray-600">
            {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
            {order.shippingAddress.zipCode}
          </Text>
          <Text className="text-gray-600">{order.shippingAddress.country}</Text>
        </Card>

        {/* Order Summary */}
        <Card className="mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Order Summary
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Subtotal</Text>
            <Text className="text-gray-900">{formatCurrency(order.subtotal)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Shipping</Text>
            <Text className="text-gray-900">
              {order.shipping > 0 ? formatCurrency(order.shipping) : 'Free'}
            </Text>
          </View>
          <View className="border-t border-gray-200 mt-2 pt-3">
            <View className="flex-row justify-between">
              <Text className="text-lg font-semibold text-gray-900">Total</Text>
              <Text className="text-lg font-bold text-primary-600">
                {formatCurrency(order.total)}
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </>
  );
}
