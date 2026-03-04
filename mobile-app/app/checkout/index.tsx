import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
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

type PaymentMethodId = 'stripe' | 'bank_transfer';

interface PaymentOption {
  id: PaymentMethodId;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'stripe',
    label: 'Credit / Debit Card',
    description: 'Pay securely with Visa or Mastercard via Stripe',
    icon: 'card-outline',
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    description: 'Monzo · Sort Code 04-00-04 · Acc 64689014',
    icon: 'business-outline',
  },
];

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

  const addresses: Address[] = addressData?.addresses ?? [];
  const selectedAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodId>('stripe');
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
        paymentMethod: selectedPayment,
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
        {/* ── Delivery Address ── */}
        <View style={localStyles.section}>
          <Text style={[styles.sectionTitle, { fontSize: Math.round(16 * scale) }]}>
            Delivery Address
          </Text>
          {addressLoading ? (
            <ActivityIndicator size="small" color={colors.brand} style={{ marginTop: 8 }} />
          ) : selectedAddress ? (
            <View style={localStyles.addressRow}>
              <View style={{ flex: 1 }}>
                <Text style={[localStyles.addressName, { fontSize: Math.round(14 * scale) }]}>
                  {selectedAddress.firstName} {selectedAddress.lastName}
                </Text>
                <Text
                  style={[localStyles.addressLine, { fontSize: Math.round(13 * scale) }]}
                  numberOfLines={2}
                >
                  {addressLine}
                </Text>
              </View>
              <Pressable onPress={handleChangeAddress} hitSlop={8}>
                {({ pressed }) => (
                  <Text style={[localStyles.changeLink, { fontSize: Math.round(14 * scale), opacity: pressed ? 0.6 : 1 }]}>
                    Change
                  </Text>
                )}
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => router.push('/new-address')}
              style={localStyles.addAddressRow}
            >
              {({ pressed }) => (
                <>
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={colors.brand}
                    style={{ opacity: pressed ? 0.6 : 1 }}
                  />
                  <Text style={[localStyles.addAddressText, { fontSize: Math.round(14 * scale), opacity: pressed ? 0.6 : 1 }]}>
                    Add delivery address
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        <View style={styles.divider} />

        {/* ── Payment Method ── */}
        <View style={localStyles.section}>
          <Text style={[styles.sectionTitle, { fontSize: Math.round(16 * scale) }]}>
            Payment Method
          </Text>
          {PAYMENT_OPTIONS.map((opt) => {
            const selected = selectedPayment === opt.id;
            return (
              <Pressable
                key={opt.id}
                style={[localStyles.paymentOption, selected && localStyles.paymentOptionSelected]}
                onPress={() => setSelectedPayment(opt.id)}
              >
                <View style={[localStyles.paymentIconBox, selected && localStyles.paymentIconBoxSelected]}>
                  <Ionicons
                    name={opt.icon}
                    size={20}
                    color={selected ? colors.brand : colors.gray[500]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[localStyles.paymentLabel, { fontSize: Math.round(14 * scale) }]}>
                    {opt.label}
                  </Text>
                  <Text style={[localStyles.paymentDesc, { fontSize: Math.round(12 * scale) }]}>
                    {opt.description}
                  </Text>
                </View>
                <View style={[localStyles.radio, selected && localStyles.radioSelected]}>
                  {selected && <View style={localStyles.radioDot} />}
                </View>
              </Pressable>
            );
          })}

          {/* Bank Transfer notice */}
          {selectedPayment === 'bank_transfer' && (
            <View style={localStyles.bankNotice}>
              <Ionicons name="information-circle-outline" size={16} color="#6B7280" style={{ marginRight: 6, marginTop: 1 }} />
              <Text style={[localStyles.bankNoticeText, { fontSize: Math.round(12 * scale) }]}>
                Your order will be held as pending until we confirm receipt of your transfer. You'll need to send payment to: Angel Marketplace · Monzo · Sort Code 04-00-04 · Account 64689014.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* ── Order Summary ── */}
        <View style={styles.orderSummaryContainer}>
          <Text style={[styles.sectionTitle, { fontSize: Math.round(16 * scale) }]}>
            Order Summary
          </Text>
        </View>
        <OrderSummary subtotal={subtotal} shippingFee={SHIPPING_FEE} total={total} couponCode={couponCode} />

        {/* ── Coupon ── */}
        <CouponCodeInput onAdd={(code) => setCouponCode(code)} />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Place Order button ── */}
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

const localStyles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  addressName: {
    color: '#111827',
    fontWeight: '500',
  },
  addressLine: {
    color: '#6B7280',
    marginTop: 2,
  },
  changeLink: {
    color: '#F43F5E',
    marginLeft: 12,
  },
  addAddressRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addAddressText: {
    color: '#F43F5E',
    marginLeft: 6,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  paymentOptionSelected: {
    borderColor: '#F43F5E',
    backgroundColor: '#FFF5F7',
  },
  paymentIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentIconBoxSelected: {
    backgroundColor: '#FFE4E8',
  },
  paymentLabel: {
    color: '#111827',
    fontWeight: '500',
  },
  paymentDesc: {
    color: '#6B7280',
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  radioSelected: {
    borderColor: '#F43F5E',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F43F5E',
  },
  bankNotice: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  bankNoticeText: {
    color: '#6B7280',
    flex: 1,
    lineHeight: 18,
  },
});
