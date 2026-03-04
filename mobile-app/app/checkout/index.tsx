import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/hooks';
import { useAuthStore } from '@/store';
import { useCartQuery, useAddresses } from '@/queries';
import { OrderSummary } from '@/components/cart';
import { CouponCodeInput } from '@/components/checkout';
import { checkoutScreenStyles as styles } from '@/styles/checkoutScreen';
import { colors } from '@/constants/colors';
import type { Address } from '@/types/user';

const SHIPPING_FEE = 5;

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { subtotal: storeSubtotal } = useCart();
  const { data: apiCart } = useCartQuery({ enabled: isAuthenticated });
  const { data: addressData, isLoading: addressLoading } = useAddresses();

  const subtotal = isAuthenticated && apiCart
    ? (apiCart.items ?? []).reduce((sum, i) => sum + i.price * i.quantity, 0)
    : storeSubtotal;
  const total = subtotal + SHIPPING_FEE;

  // Pick default address, or first address if no default
  const addresses: Address[] = addressData?.addresses ?? [];
  const selectedAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

  const [selectedPaymentMethod] = useState<'stripe'>('stripe');
  const [couponCode, setCouponCode] = useState<string | undefined>(undefined);

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to place an order.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    if (!selectedAddress) {
      Alert.alert(
        'No Address',
        'Please add a delivery address before placing your order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Address', onPress: () => router.push('/new-address') },
        ]
      );
      return;
    }

    // Build the ShippingAddress payload expected by the confirm screen
    const shippingAddress = {
      firstName: selectedAddress.firstName,
      lastName: selectedAddress.lastName,
      address: selectedAddress.address,
      apartment: selectedAddress.apartment,
      city: selectedAddress.city,
      state: selectedAddress.state,
      zipCode: selectedAddress.zipCode,
      country: selectedAddress.country,
      phone: selectedAddress.phone,
    };

    router.push({
      pathname: '/checkout/confirm',
      params: {
        shippingAddress: JSON.stringify(shippingAddress),
        paymentMethod: selectedPaymentMethod,
        ...(couponCode ? { couponCode } : {}),
      },
    } as any);
  };

  const handleChangeAddress = () => router.push('/address');

  const addressLine = selectedAddress
    ? `${selectedAddress.address}${selectedAddress.apartment ? `, ${selectedAddress.apartment}` : ''}, ${selectedAddress.city}`
    : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
          {({ pressed }) => (
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.gray[900]}
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          )}
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize: Math.round(20 * scale) }]}>Checkout</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery Address */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
          <Text style={[styles.sectionTitle, { fontSize: Math.round(16 * scale) }]}>
            Delivery Address
          </Text>
          {addressLoading ? (
            <ActivityIndicator size="small" color={colors.brand} style={{ marginTop: 8 }} />
          ) : selectedAddress ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: Math.round(14 * scale), color: colors.gray[900], fontWeight: '500' }}>
                  {selectedAddress.firstName} {selectedAddress.lastName}
                </Text>
                <Text style={{ fontSize: Math.round(13 * scale), color: colors.gray[500], marginTop: 2 }} numberOfLines={2}>
                  {addressLine}
                </Text>
              </View>
              <Pressable onPress={handleChangeAddress} hitSlop={8}>
                {({ pressed }) => (
                  <Text style={{ color: colors.brand, fontSize: Math.round(14 * scale), opacity: pressed ? 0.6 : 1, marginLeft: 12 }}>
                    Change
                  </Text>
                )}
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => router.push('/new-address')}
              style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center' }}
            >
              {({ pressed }) => (
                <>
                  <Ionicons name="add-circle-outline" size={20} color={colors.brand} style={{ opacity: pressed ? 0.6 : 1 }} />
                  <Text style={{ color: colors.brand, fontSize: Math.round(14 * scale), marginLeft: 6, opacity: pressed ? 0.6 : 1 }}>
                    Add delivery address
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        <View style={styles.divider} />

        {/* Payment Method */}
        <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}>
          <Text style={[styles.sectionTitle, { fontSize: Math.round(16 * scale) }]}>
            Payment Method
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.gray[100], alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <Ionicons name="card-outline" size={20} color={colors.brand} />
            </View>
            <Text style={{ fontSize: Math.round(14 * scale), color: colors.gray[900] }}>
              Credit / Debit Card (Stripe)
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Order Summary */}
        <View style={styles.orderSummaryContainer}>
          <Text style={[styles.sectionTitle, { fontSize: Math.round(16 * scale) }]}>
            Order Summary
          </Text>
        </View>
        <OrderSummary subtotal={subtotal} shippingFee={SHIPPING_FEE} total={total} />

        {/* Coupon */}
        <CouponCodeInput onAdd={(code) => setCouponCode(code)} />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Place Order button */}
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
