import React from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/hooks';
import {
  DeliveryAddress,
  PaymentMethodSelector,
  CouponCodeInput,
} from '@/components/checkout';
import { OrderSummary } from '@/components/cart';
import { checkoutScreenStyles as styles } from '@/styles/checkoutScreen';

// Mock data
const MOCK_ADDRESS = {
  label: 'Home',
  address: '925 S Chugach St #APT 10, Alaska 99645',
};

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const { subtotal } = useCart();

  // Mock calculations
  const vat = 0;
  const shippingFee = 80;
  const total = subtotal + vat + shippingFee;

  const handlePlaceOrder = () => {
    // TODO: Implement place order logic
    console.log('Place order');
  };

  const handleChangeAddress = () => {
    router.push('/address');
  };

  const handleEditCard = () => {
    // TODO: Navigate to card editing
    console.log('Edit card');
  };

  const handleCouponAdd = (code: string) => {
    // TODO: Apply coupon code
    console.log('Apply coupon:', code);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={10}
        >
          {({ pressed }) => (
            <Ionicons
              name="chevron-back"
              size={24}
              color="#111827"
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          )}
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize: Math.round(20 * scale) }]}>
          Checkout
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Address */}
        <DeliveryAddress
          addressLabel={MOCK_ADDRESS.label}
          address={MOCK_ADDRESS.address}
          onNavigateToAddress={handleChangeAddress}
        />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Payment Method */}
        <PaymentMethodSelector
          selectedMethod="card"
          cardNumber="**** **** **** 2512"
          onEditCard={handleEditCard}
        />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Order Summary */}
        <View style={styles.orderSummaryContainer}>
          <Text style={[styles.sectionTitle, { fontSize: Math.round(20 * scale) }]}>
            Order Summary
          </Text>
        </View>
        <OrderSummary
          subtotal={subtotal}
          vat={vat}
          shippingFee={shippingFee}
          total={total}
        />

        {/* Coupon Code Input */}
        <CouponCodeInput onAdd={handleCouponAdd} />

        {/* Bottom spacing for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable style={styles.placeOrderButton} onPress={handlePlaceOrder}>
          {({ pressed }) => (
            <View style={[styles.placeOrderButtonInner, { opacity: pressed ? 0.9 : 1 }]}>
              <Text style={[styles.placeOrderButtonText, { fontSize: Math.round(16 * scale) }]}>
                Place Order
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
