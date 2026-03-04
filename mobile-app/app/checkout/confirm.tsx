import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useStripe } from '@stripe/stripe-react-native';
import { useCart } from '@/hooks';
import { useCreateOrder } from '@/queries';
import { formatCurrency } from '@/utils';
import { ShippingAddress } from '@/types';
import { config } from '@/constants/config';
import { colors } from '@/constants/colors';
import { paymentService } from '@/services/payment.service';

const SHIPPING_FEE = 5;

const PAYMENT_LABELS: Record<string, string> = {
  stripe: 'Credit / Debit Card (Stripe)',
  bank_transfer: 'Bank Transfer',
};

export default function ConfirmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const params = useLocalSearchParams<{
    shippingAddress: string;
    paymentMethod: string;
    couponCode?: string;
  }>();

  const { items, subtotal, clearCart } = useCart();
  const createOrderMutation = useCreateOrder();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isProcessing, setIsProcessing] = useState(false);

  const shippingAddress: ShippingAddress | null = params.shippingAddress
    ? JSON.parse(params.shippingAddress)
    : null;
  const paymentMethod = params.paymentMethod ?? 'stripe';
  const couponCode = params.couponCode || undefined;

  const total = subtotal + SHIPPING_FEE;

  const handlePlaceOrder = async () => {
    if (!shippingAddress || !paymentMethod) {
      Alert.alert('Error', 'Missing order information');
      return;
    }

    setIsProcessing(true);
    try {
      const order = await createOrderMutation.mutateAsync({
        shippingAddress,
        paymentMethod,
        ...(couponCode ? { couponCode } : {}),
      });

      if (paymentMethod === 'stripe') {
        // Stripe Payment Sheet flow
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
          Alert.alert('Payment Error', initError.message || 'Could not initialise payment.');
          setIsProcessing(false);
          return;
        }
        const { error: presentError } = await presentPaymentSheet();
        if (presentError) {
          Alert.alert(
            presentError.code === 'Canceled' ? 'Cancelled' : 'Payment Failed',
            presentError.message || 'Payment was not completed.'
          );
          setIsProcessing(false);
          return;
        }
        clearCart();
        router.replace(`/order/${order.id}`);
        return;
      }

      if (paymentMethod === 'bank_transfer') {
        // Bank transfer: order is pending — show instructions then navigate to order
        clearCart();
        Alert.alert(
          'Order Placed',
          `Please transfer £${order.total.toFixed(2)} to:\n\nAngel Marketplace\nMonzo\nSort Code: 04-00-04\nAccount: 64689014\n\nYour order will be confirmed once we receive payment.`,
          [
            {
              text: 'OK',
              onPress: () => router.replace(`/order/${order.id}`),
            },
          ]
        );
        return;
      }

      // Fallback for any other method
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
      <SafeAreaView style={localStyles.container} edges={['top']}>
        <View style={localStyles.errorCenter}>
          <Text style={localStyles.errorText}>Missing shipping information.</Text>
          <Pressable onPress={() => router.back()} style={localStyles.backButton}>
            <Text style={localStyles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={localStyles.container} edges={['top']}>
      {/* Header */}
      <View style={localStyles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={localStyles.headerBack}>
          {({ pressed }) => (
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.gray[900]}
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          )}
        </Pressable>
        <Text style={[localStyles.headerTitle, { fontSize: Math.round(20 * scale) }]}>
          Review Order
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={localStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Order Items ── */}
        <View style={localStyles.card}>
          <Text style={[localStyles.cardTitle, { fontSize: Math.round(16 * scale) }]}>
            Items ({items.length})
          </Text>
          {items.map((item) => (
            <View key={item.id} style={localStyles.itemRow}>
              <Image
                source={{ uri: item.product.images?.[0] || config.IMAGE_PLACEHOLDER }}
                style={localStyles.itemImage}
                contentFit="cover"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={[localStyles.itemName, { fontSize: Math.round(14 * scale) }]}
                  numberOfLines={2}
                >
                  {item.product.name}
                </Text>
                <Text style={[localStyles.itemQty, { fontSize: Math.round(13 * scale) }]}>
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text style={[localStyles.itemPrice, { fontSize: Math.round(14 * scale) }]}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Shipping Address ── */}
        <View style={localStyles.card}>
          <View style={localStyles.cardTitleRow}>
            <Ionicons name="location-outline" size={18} color={colors.brand} />
            <Text style={[localStyles.cardTitle, { fontSize: Math.round(16 * scale), marginLeft: 6 }]}>
              Delivery Address
            </Text>
          </View>
          <Text style={[localStyles.addrName, { fontSize: Math.round(14 * scale) }]}>
            {shippingAddress.firstName} {shippingAddress.lastName}
          </Text>
          <Text style={[localStyles.addrLine, { fontSize: Math.round(13 * scale) }]}>
            {shippingAddress.address}
            {shippingAddress.apartment ? `, ${shippingAddress.apartment}` : ''}
          </Text>
          <Text style={[localStyles.addrLine, { fontSize: Math.round(13 * scale) }]}>
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
          </Text>
          <Text style={[localStyles.addrLine, { fontSize: Math.round(13 * scale) }]}>
            {shippingAddress.country}
          </Text>
          {shippingAddress.phone ? (
            <Text style={[localStyles.addrLine, { fontSize: Math.round(13 * scale), marginTop: 4 }]}>
              {shippingAddress.phone}
            </Text>
          ) : null}
        </View>

        {/* ── Payment Method ── */}
        <View style={localStyles.card}>
          <View style={localStyles.cardTitleRow}>
            <Ionicons name="card-outline" size={18} color={colors.brand} />
            <Text style={[localStyles.cardTitle, { fontSize: Math.round(16 * scale), marginLeft: 6 }]}>
              Payment
            </Text>
          </View>
          <Text style={[localStyles.addrLine, { fontSize: Math.round(14 * scale), marginTop: 4 }]}>
            {PAYMENT_LABELS[paymentMethod] ?? paymentMethod}
          </Text>
          {paymentMethod === 'bank_transfer' && (
            <View style={localStyles.bankBox}>
              <Text style={[localStyles.bankText, { fontSize: Math.round(12 * scale) }]}>
                Angel Marketplace · Monzo{'\n'}
                Sort Code: 04-00-04{'\n'}
                Account: 64689014
              </Text>
            </View>
          )}
        </View>

        {/* ── Order Totals ── */}
        <View style={localStyles.card}>
          <Text style={[localStyles.cardTitle, { fontSize: Math.round(16 * scale) }]}>
            Order Total
          </Text>
          <View style={localStyles.totalRow}>
            <Text style={[localStyles.totalLabel, { fontSize: Math.round(14 * scale) }]}>Subtotal</Text>
            <Text style={[localStyles.totalValue, { fontSize: Math.round(14 * scale) }]}>
              {formatCurrency(subtotal)}
            </Text>
          </View>
          <View style={localStyles.totalRow}>
            <Text style={[localStyles.totalLabel, { fontSize: Math.round(14 * scale) }]}>Shipping</Text>
            <Text style={[localStyles.totalValue, { fontSize: Math.round(14 * scale) }]}>
              {formatCurrency(SHIPPING_FEE)}
            </Text>
          </View>
          {couponCode && (
            <View style={localStyles.totalRow}>
              <Text style={[localStyles.totalLabel, { fontSize: Math.round(14 * scale) }]}>
                Coupon ({couponCode})
              </Text>
              <Text style={[localStyles.discountValue, { fontSize: Math.round(14 * scale) }]}>
                Applied
              </Text>
            </View>
          )}
          <View style={[localStyles.totalRow, localStyles.grandRow]}>
            <Text style={[localStyles.grandLabel, { fontSize: Math.round(15 * scale) }]}>Total</Text>
            <Text style={[localStyles.grandValue, { fontSize: Math.round(15 * scale) }]}>
              {formatCurrency(total)}
            </Text>
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Place Order Button ── */}
      <View style={[localStyles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={localStyles.placeButton}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          {({ pressed }) => (
            <View style={[localStyles.placeButtonInner, { opacity: pressed || isProcessing ? 0.85 : 1 }]}>
              {isProcessing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={[localStyles.placeButtonText, { fontSize: Math.round(16 * scale) }]}>
                  {paymentMethod === 'stripe'
                    ? `Pay ${formatCurrency(total)}`
                    : `Place Order — ${formatCurrency(total)}`}
                </Text>
              )}
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerBack: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '600',
    color: '#111827',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemName: {
    color: '#111827',
    fontWeight: '500',
  },
  itemQty: {
    color: '#6B7280',
    marginTop: 2,
  },
  itemPrice: {
    color: '#111827',
    fontWeight: '600',
  },
  addrName: {
    color: '#111827',
    fontWeight: '500',
    marginBottom: 4,
  },
  addrLine: {
    color: '#6B7280',
    lineHeight: 20,
  },
  bankBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  bankText: {
    color: '#374151',
    lineHeight: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  totalLabel: {
    color: '#6B7280',
  },
  totalValue: {
    color: '#111827',
    fontWeight: '500',
  },
  discountValue: {
    color: '#22C55E',
    fontWeight: '500',
  },
  grandRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  grandLabel: {
    color: '#111827',
    fontWeight: '700',
  },
  grandValue: {
    color: '#F43F5E',
    fontWeight: '700',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  placeButton: {
    width: '100%',
  },
  placeButtonInner: {
    backgroundColor: '#F43F5E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#6B7280',
    fontSize: 15,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#F43F5E',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
