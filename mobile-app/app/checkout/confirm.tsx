import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useStripe } from '@stripe/stripe-react-native';
import { useCart } from '@/hooks';
import { useCreateOrder } from '@/queries';
import { Button, Card } from '@/components/ui';
import { CartSummary } from '@/components/cart';
import { formatCurrency } from '@/utils';
import { ShippingAddress } from '@/types';
import { config } from '@/constants/config';
import { paymentService } from '@/services/payment.service';

export default function ConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    shippingAddress: string;
    paymentMethod: string;
  }>();
  const { items, subtotal, clearCart } = useCart();
  const createOrderMutation = useCreateOrder();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isProcessing, setIsProcessing] = useState(false);

  const shippingAddress: ShippingAddress = params.shippingAddress
    ? JSON.parse(params.shippingAddress)
    : null;
  const paymentMethod = params.paymentMethod as 'stripe' | 'paystack' | 'flutterwave';

  // Shipping fee matches the settings table value (£5)
  const shipping = 5;
  const total = subtotal + shipping;

  const paymentMethodNames = {
    stripe: 'Credit/Debit Card',
    paystack: 'Paystack',
    flutterwave: 'Flutterwave',
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress || !paymentMethod) {
      Alert.alert('Error', 'Missing order information');
      return;
    }

    setIsProcessing(true);
    try {
      // Create order (backend clears cart and returns order with total)
      const order = await createOrderMutation.mutateAsync({
        shippingAddress,
        paymentMethod,
      });

      if (paymentMethod === 'stripe') {
        // Stripe: create payment intent and present Payment Sheet
        const intent = await paymentService.createPaymentIntent({
          orderId: order.id,
          amount: order.total,
          currency: config.CURRENCY,
          provider: 'stripe',
        });
        if (!intent.clientSecret) {
          Alert.alert('Payment Error', 'Could not start payment. Please try again.');
          setIsProcessing(false);
          return;
        }
        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: intent.clientSecret,
          merchantDisplayName: config.APP_NAME,
        });
        if (initError) {
          Alert.alert('Payment Error', initError.message || 'Could not initialize payment.');
          setIsProcessing(false);
          return;
        }
        const { error: presentError } = await presentPaymentSheet();
        if (presentError) {
          Alert.alert(
            presentError.code === 'Canceled' ? 'Canceled' : 'Payment Failed',
            presentError.message || 'Payment was not completed.'
          );
          setIsProcessing(false);
          return;
        }
        clearCart();
        router.replace(`/order/${order.id}`);
        return;
      }

      // Non-Stripe: order already created and cart cleared by backend
      clearCart();
      router.replace(`/order/${order.id}`);
    } catch (error: any) {
      Alert.alert(
        'Order Failed',
        error.response?.data?.message || 'Failed to place order. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!shippingAddress) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Missing shipping information</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          className="mt-4"
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Order Items */}
        <Card className="mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Order Items ({items.length})
          </Text>
          {items.map((item) => (
            <View
              key={item.id}
              className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0"
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
                <Text className="text-sm text-gray-500">Qty: {item.quantity}</Text>
              </View>
              <Text className="font-semibold text-gray-900">
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Shipping Address */}
        <Card className="mb-4">
          <View className="flex-row items-center mb-3">
            <Ionicons name="location-outline" size={20} color="#F43F5E" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">
              Shipping Address
            </Text>
          </View>
          <Text className="text-gray-900">
            {shippingAddress.firstName} {shippingAddress.lastName}
          </Text>
          <Text className="text-gray-600">
            {shippingAddress.address}
            {shippingAddress.apartment && `, ${shippingAddress.apartment}`}
          </Text>
          <Text className="text-gray-600">
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
          </Text>
          <Text className="text-gray-600">{shippingAddress.country}</Text>
          <Text className="text-gray-600 mt-1">{shippingAddress.phone}</Text>
        </Card>

        {/* Payment Method */}
        <Card className="mb-4">
          <View className="flex-row items-center">
            <Ionicons name="card-outline" size={20} color="#F43F5E" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">
              Payment Method
            </Text>
          </View>
          <Text className="text-gray-600 mt-2">
            {paymentMethodNames[paymentMethod]}
          </Text>
        </Card>

        {/* Order Summary */}
        <CartSummary subtotal={subtotal} shipping={shipping} total={total} />

        <View className="h-8" />
      </ScrollView>

      {/* Place Order Button */}
      <View className="px-4 py-4 bg-white border-t border-gray-100">
        <Button
          title={`Place Order - ${formatCurrency(total)}`}
          onPress={handlePlaceOrder}
          loading={isProcessing}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}
