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
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useStripe } from '@stripe/stripe-react-native';
import { useCart } from '@/hooks';
import { useCreateOrder, useCartQuery } from '@/queries';
import { formatCurrency, resolvePrice } from '@/utils';
import { ShippingAddress, CartItem } from '@/types';
import { config } from '@/constants/config';
import { colors } from '@/constants/colors';
import { paymentService } from '@/services/payment.service';
import { useCurrencyStore } from '@/store/currencyStore';
import { useAuthStore } from '@/store';

/** Compute subtotal in the selected currency — mirrors PHP cart.php getProductPrice() logic */
function computeSubtotal(items: CartItem[], currencyCode: string): number {
  return items.reduce((sum, item) => {
    const { price } = resolvePrice(item.product.prices, item.price, currencyCode);
    return sum + price * item.quantity;
  }, 0);
}

/** Shipping fee per currency (matches PHP settings.json) */
function getShippingFee(currencyCode: string): number {
  return currencyCode === 'NGN' ? 3000 : 5;
}

const PAYMENT_LABELS: Record<string, string> = {
  stripe:        'Credit / Debit Card (Stripe)',
  paypal:        'PayPal',
  bank_transfer: 'Bank Transfer',
  espees:        'Espees',
};

const PAYMENT_ICONS: Record<string, React.ComponentProps<typeof Ionicons>['name']> = {
  stripe:        'card-outline',
  paypal:        'logo-paypal',
  bank_transfer: 'business-outline',
  espees:        'wallet-outline',
};

/** Bank transfer details differ by currency */
function getBankDetails(currencyCode: string): string {
  if (currencyCode === 'NGN') {
    return 'Parallex Bank\nAccount Name: ANGELMP\nAccount Number: 100004476';
  }
  return 'Angel Marketplace · Monzo\nSort Code: 04-00-04\nAccount: 64689014';
}

export default function ConfirmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const params = useLocalSearchParams<{
    shippingAddress: string;
    shippingMethod?: string;
    paymentMethod: string;
    couponCode?: string;
  }>();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { items: storeItems, clearCart } = useCart();
  const { data: apiCart } = useCartQuery({ enabled: isAuthenticated });
  // Use API cart items when authenticated (has prices map + correct quantities)
  // Fall back to local store for guest checkout
  const items: CartItem[] = isAuthenticated && apiCart ? (apiCart.items ?? []) : storeItems;

  const createOrderMutation = useCreateOrder();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isProcessing, setIsProcessing] = useState(false);
  const { currency } = useCurrencyStore();

  const shippingMethod = (params.shippingMethod ?? 'delivery') as 'delivery' | 'pickup';
  const isPickup = shippingMethod === 'pickup';

  // shippingAddress is empty string when pickup
  const shippingAddress: ShippingAddress | null =
    params.shippingAddress && params.shippingAddress !== ''
      ? JSON.parse(params.shippingAddress)
      : null;
  const couponCode = params.couponCode || undefined;

  // Subtotal computed in selected currency — same logic as cart.tsx and PHP cart.php
  const subtotal = computeSubtotal(items, currency.code);
  // Pickup = free; delivery = fee by currency
  const shippingFee = isPickup ? 0 : getShippingFee(currency.code);
  const total = subtotal + shippingFee;

  // Payment method is fixed — chosen on the checkout screen, passed as a param
  const paymentMethod = params.paymentMethod ?? 'bank_transfer';

  // After a successful order, clear the entire checkout stack so pressing back
  // from the order detail page goes to the orders tab — not back into checkout.
  const navigateToOrder = (orderId: string) => {
    // dismiss() pops back through the stack; replace then sets the destination.
    // Using while(router.canDismiss()) ensures we clear checkout/index too.
    if (router.canDismiss()) router.dismissAll();
    router.replace(`/order/${orderId}` as any);
  };

  const handlePlaceOrder = async () => {
    if (!isPickup && !shippingAddress) {
      Alert.alert('Error', 'Missing delivery address');
      return;
    }
    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setIsProcessing(true);
    try {
      // For pickup orders, shippingAddress is null — send a minimal placeholder
      const addressPayload: ShippingAddress = shippingAddress ?? {
        firstName: 'Store',
        lastName: 'Pickup',
        address: 'Store Pickup',
        city: 'N/A',
        state: 'N/A',
        zipCode: 'N/A',
        country: 'N/A',
        phone: '',
      };

      const order = await createOrderMutation.mutateAsync({
        shippingAddress: addressPayload,
        paymentMethod: paymentMethod as any,
        currencyCode: currency.code,
        ...(couponCode ? { couponCode } : {}),
      });

      if (paymentMethod === 'stripe') {
        const intent = await paymentService.createPaymentIntent({
          orderId: order.id,
          amount: order.total,
          currency: currency.code,
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
        navigateToOrder(order.id);
        return;
      }

      if (paymentMethod === 'paypal') {
        clearCart();
        Alert.alert(
          'Order Placed',
          `Please send ${formatCurrency(order.total, currency.code)} via PayPal to:\n\npaypal.me/amp202247\n\nYour order will be confirmed once we receive payment.`,
          [{ text: 'Open PayPal', onPress: () => Linking.openURL('https://paypal.me/amp202247') },
           { text: 'OK', onPress: () => navigateToOrder(order.id) }]
        );
        return;
      }

      if (paymentMethod === 'bank_transfer') {
        clearCart();
        Alert.alert(
          'Order Placed',
          `Please transfer ${formatCurrency(order.total, currency.code)} to:\n\n${getBankDetails(currency.code)}\n\nYour order will be confirmed once we receive payment.`,
          [{ text: 'OK', onPress: () => navigateToOrder(order.id) }]
        );
        return;
      }

      if (paymentMethod === 'espees') {
        clearCart();
        Alert.alert(
          'Order Placed',
          `Please send ${formatCurrency(order.total, currency.code)} via Espees to username:\n\nANGELMP\n\nYour order will be confirmed once we receive payment.`,
          [{ text: 'OK', onPress: () => navigateToOrder(order.id) }]
        );
        return;
      }

      // Fallback
      clearCart();
      navigateToOrder(order.id);
    } catch (error: any) {
      const data = error.response?.data;
      const issues = data?.errors;
      const detail = issues
        ? issues.map((e: any) => `${e.path?.join('.') ?? '?'}: ${e.message}`).join('\n')
        : data?.message || 'Failed to place order. Please try again.';
      Alert.alert('Order Failed', detail);
    } finally {
      setIsProcessing(false);
    }
  };

  // For delivery, address is required; for pickup it's not
  if (!isPickup && !shippingAddress) {
    return (
      <SafeAreaView style={localStyles.container} edges={['top']}>
        <View style={localStyles.errorCenter}>
          <Text style={localStyles.errorText}>Missing delivery address.</Text>
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
                {formatCurrency(
                  resolvePrice(item.product.prices, item.price, currency.code).price * item.quantity,
                  currency.code
                )}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Shipping Method ── */}
        <View style={localStyles.card}>
          <View style={localStyles.cardTitleRow}>
            <Ionicons name="location-outline" size={18} color={colors.brand} />
            <Text style={[localStyles.cardTitle, { fontSize: Math.round(16 * scale), marginLeft: 6 }]}>
              {isPickup ? 'Collection' : 'Delivery Address'}
            </Text>
          </View>
          {isPickup ? (
            <Text style={[localStyles.addrLine, { fontSize: Math.round(13 * scale) }]}>
              Store Pickup — no delivery charge
            </Text>
          ) : shippingAddress ? (
            <>
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
            </>
          ) : null}
        </View>

        {/* ── Payment Method (read-only summary) ── */}
        <View style={localStyles.card}>
          <View style={localStyles.cardTitleRow}>
            <Ionicons name="card-outline" size={18} color={colors.brand} />
            <Text style={[localStyles.cardTitle, { fontSize: Math.round(16 * scale), marginLeft: 6 }]}>
              Payment Method
            </Text>
          </View>
          <View style={localStyles.methodRow}>
            <Ionicons
              name={PAYMENT_ICONS[paymentMethod] ?? 'card-outline'}
              size={20}
              color={colors.brand}
              style={{ marginRight: 10 }}
            />
            <Text style={[localStyles.methodLabel, localStyles.methodLabelSelected, { fontSize: Math.round(14 * scale) }]}>
              {PAYMENT_LABELS[paymentMethod] ?? paymentMethod}
            </Text>
          </View>

          {paymentMethod === 'bank_transfer' && (
            <View style={localStyles.infoBox}>
              <Text style={[localStyles.infoText, { fontSize: Math.round(12 * scale) }]}>
                {getBankDetails(currency.code)}
              </Text>
            </View>
          )}
          {paymentMethod === 'paypal' && (
            <View style={localStyles.infoBox}>
              <Text style={[localStyles.infoText, { fontSize: Math.round(12 * scale) }]}>
                You will be prompted to send payment to:{'\n'}paypal.me/amp202247
              </Text>
            </View>
          )}
          {paymentMethod === 'espees' && (
            <View style={localStyles.infoBox}>
              <Text style={[localStyles.infoText, { fontSize: Math.round(12 * scale) }]}>
                Send payment in the Espees app to username:{'\n'}ANGELMP
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
              {formatCurrency(subtotal, currency.code)}
            </Text>
          </View>
          <View style={localStyles.totalRow}>
            <Text style={[localStyles.totalLabel, { fontSize: Math.round(14 * scale) }]}>Shipping</Text>
            <Text style={[localStyles.totalValue, { fontSize: Math.round(14 * scale) }]}>
              {formatCurrency(shippingFee, currency.code)}
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
              {formatCurrency(total, currency.code)}
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
                    ? `Pay ${formatCurrency(total, currency.code)}`
                    : `Place Order — ${formatCurrency(total, currency.code)}`}
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
  // Payment method rows
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  methodRowSelected: {
    borderColor: colors.brand,
    backgroundColor: '#FEF2F4',
  },
  methodLabel: {
    flex: 1,
    color: '#374151',
    fontWeight: '500',
  },
  methodLabelSelected: {
    color: colors.brand,
    fontWeight: '600',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.brand,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand,
  },
  infoBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  infoText: {
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
