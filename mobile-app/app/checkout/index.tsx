import React, { useState, useMemo } from 'react';
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
import { useCurrencyStore } from '@/store/currencyStore';
import { resolvePrice, formatCurrency } from '@/utils';
import type { Address } from '@/types/user';
import type { CartItem } from '@/types';

// ── Shipping ──────────────────────────────────────────────────────────────────

type ShippingMethod = 'delivery' | 'pickup';

/** Standard delivery fee per currency — mirrors PHP settings.json */
function getDeliveryFee(currencyCode: string): number {
  return currencyCode === 'NGN' ? 3000 : 5;
}

/** Compute subtotal in selected currency — same logic as cart.tsx */
function computeSubtotal(items: CartItem[], currencyCode: string): number {
  return items.reduce((sum, item) => {
    const { price } = resolvePrice(item.product.prices, item.price, currencyCode);
    return sum + price * item.quantity;
  }, 0);
}

// ── Payment methods — mirrors PHP getPaymentMethodsForCurrency() ──────────────

type PaymentMethodId = 'stripe' | 'paypal' | 'bank_transfer' | 'espees';

interface PaymentOption {
  id: PaymentMethodId;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const ALL_PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'stripe',
    label: 'Credit / Debit Card',
    description: 'Secure payment via Stripe',
    icon: 'card-outline',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    description: 'Pay via paypal.me/amp202247',
    icon: 'logo-paypal',
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    description: 'Direct bank transfer',
    icon: 'business-outline',
  },
  {
    id: 'espees',
    label: 'Espees',
    description: 'Send to username: ANGELMP',
    icon: 'wallet-outline',
  },
];

function getPaymentMethods(currencyCode: string): PaymentMethodId[] {
  switch (currencyCode) {
    case 'GBP':
    case 'USD':
    case 'EUR':
      return ['stripe', 'paypal', 'bank_transfer'];
    case 'NGN':
      return ['stripe', 'bank_transfer'];
    case 'ESP':
      return ['espees'];
    default:
      return ['bank_transfer'];
  }
}

function getBankDescription(currencyCode: string): string {
  if (currencyCode === 'NGN') {
    return 'Parallex Bank · Account: 100004476 · Name: ANGELMP';
  }
  return 'Monzo · Sort Code: 04-00-04 · Account: 64689014 · Angel Marketplace';
}

// ─────────────────────────────────────────────────────────────────────────────

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { items: storeItems } = useCart();
  const { data: apiCart } = useCartQuery({ enabled: isAuthenticated });
  const { data: addressData, isLoading: addressLoading } = useAddresses();
  const { currency } = useCurrencyStore();

  // Items from API cart or local store
  const items: CartItem[] = isAuthenticated && apiCart ? (apiCart.items ?? []) : storeItems;

  // Currency-aware subtotal
  const subtotal = useMemo(() => computeSubtotal(items, currency.code), [items, currency.code]);

  // Shipping method state — default delivery
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('delivery');
  const deliveryFee = getDeliveryFee(currency.code);
  const shippingFee = shippingMethod === 'pickup' ? 0 : deliveryFee;
  const total = subtotal + shippingFee;

  // Address
  const addresses: Address[] = addressData?.addresses ?? [];
  const selectedAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

  // Payment methods — restricted by currency
  const availableMethodIds = getPaymentMethods(currency.code);
  const availableOptions = ALL_PAYMENT_OPTIONS.filter((o) => availableMethodIds.includes(o.id));
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodId>(availableMethodIds[0]);

  // Update selected payment if currency changes and current method is no longer valid
  const effectivePayment = availableMethodIds.includes(selectedPayment)
    ? selectedPayment
    : availableMethodIds[0];

  const [couponCode, setCouponCode] = useState<string | undefined>(undefined);

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      Alert.alert('Sign In Required', 'Please sign in to place an order.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign In', onPress: () => router.push('/(auth)/login') },
      ]);
      return;
    }

    // Address is only required for delivery, not pickup
    if (shippingMethod === 'delivery' && !selectedAddress) {
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

    const shippingAddress = selectedAddress
      ? {
          firstName: selectedAddress.firstName ?? '',
          lastName: selectedAddress.lastName ?? '',
          address: selectedAddress.address ?? '',
          // apartment is nullable in DB — omit if null/empty so Zod .nullish() coerces cleanly
          ...(selectedAddress.apartment ? { apartment: selectedAddress.apartment } : {}),
          city: selectedAddress.city ?? '',
          state: selectedAddress.state ?? '',
          zipCode: selectedAddress.zipCode ?? '',
          country: selectedAddress.country ?? '',
          phone: selectedAddress.phone ?? '',
        }
      : null;

    router.push({
      pathname: '/checkout/confirm',
      params: {
        shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : '',
        shippingMethod,
        paymentMethod: effectivePayment,
        ...(couponCode ? { couponCode } : {}),
      },
    } as any);
  };

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

        {/* ── 1. Shipping Method ── */}
        <View style={ls.section}>
          <Text style={[ls.sectionTitle, { fontSize: Math.round(16 * scale) }]}>
            Shipping Method
          </Text>

          {/* Standard Delivery */}
          <Pressable
            style={[ls.methodCard, shippingMethod === 'delivery' && ls.methodCardSelected]}
            onPress={() => setShippingMethod('delivery')}
          >
            <View style={[ls.methodIcon, shippingMethod === 'delivery' && ls.methodIconSelected]}>
              <Ionicons name="car-outline" size={20} color={shippingMethod === 'delivery' ? colors.brand : colors.gray[500]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[ls.methodLabel, { fontSize: Math.round(14 * scale) }]}>
                Standard Delivery
              </Text>
              <Text style={[ls.methodSub, { fontSize: Math.round(12 * scale) }]}>
                Delivered to your doorstep
              </Text>
            </View>
            <Text style={[ls.methodCost, { fontSize: Math.round(14 * scale) }, shippingMethod === 'delivery' && ls.methodCostSelected]}>
              {formatCurrency(deliveryFee, currency.code)}
            </Text>
            <View style={[ls.radio, shippingMethod === 'delivery' && ls.radioSelected]}>
              {shippingMethod === 'delivery' && <View style={ls.radioDot} />}
            </View>
          </Pressable>

          {/* Store Pickup */}
          <Pressable
            style={[ls.methodCard, shippingMethod === 'pickup' && ls.methodCardSelected]}
            onPress={() => setShippingMethod('pickup')}
          >
            <View style={[ls.methodIcon, shippingMethod === 'pickup' && ls.methodIconSelected]}>
              <Ionicons name="storefront-outline" size={20} color={shippingMethod === 'pickup' ? colors.brand : colors.gray[500]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[ls.methodLabel, { fontSize: Math.round(14 * scale) }]}>
                Store Pickup
              </Text>
              <Text style={[ls.methodSub, { fontSize: Math.round(12 * scale) }]}>
                Collect from our store — no address needed
              </Text>
            </View>
            <Text style={[ls.methodCostFree, { fontSize: Math.round(14 * scale) }]}>
              Free
            </Text>
            <View style={[ls.radio, shippingMethod === 'pickup' && ls.radioSelected]}>
              {shippingMethod === 'pickup' && <View style={ls.radioDot} />}
            </View>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* ── 2. Delivery Address — hidden for pickup ── */}
        {shippingMethod === 'delivery' && (
          <>
            <View style={ls.section}>
              <Text style={[ls.sectionTitle, { fontSize: Math.round(16 * scale) }]}>
                Delivery Address
              </Text>
              {addressLoading ? (
                <ActivityIndicator size="small" color={colors.brand} style={{ marginTop: 8 }} />
              ) : selectedAddress ? (
                <View style={ls.addressRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[ls.addressName, { fontSize: Math.round(14 * scale) }]}>
                      {selectedAddress.firstName} {selectedAddress.lastName}
                    </Text>
                    <Text style={[ls.addressLine, { fontSize: Math.round(13 * scale) }]} numberOfLines={2}>
                      {addressLine}
                    </Text>
                  </View>
                  <Pressable onPress={() => router.push('/address')} hitSlop={8}>
                    {({ pressed }) => (
                      <Text style={[ls.changeLink, { fontSize: Math.round(14 * scale), opacity: pressed ? 0.6 : 1 }]}>
                        Change
                      </Text>
                    )}
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={() => router.push('/new-address')} style={ls.addAddressRow}>
                  {({ pressed }) => (
                    <>
                      <Ionicons name="add-circle-outline" size={20} color={colors.brand} style={{ opacity: pressed ? 0.6 : 1 }} />
                      <Text style={[ls.addAddressText, { fontSize: Math.round(14 * scale), opacity: pressed ? 0.6 : 1 }]}>
                        Add delivery address
                      </Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>
            <View style={styles.divider} />
          </>
        )}

        {/* ── 3. Payment Method ── */}
        <View style={ls.section}>
          <Text style={[ls.sectionTitle, { fontSize: Math.round(16 * scale) }]}>
            Payment Method
          </Text>
          {availableOptions.map((opt) => {
            const selected = effectivePayment === opt.id;
            // Dynamic description for bank_transfer (differs by currency)
            const description = opt.id === 'bank_transfer'
              ? getBankDescription(currency.code)
              : opt.description;
            return (
              <Pressable
                key={opt.id}
                style={[ls.paymentOption, selected && ls.paymentOptionSelected]}
                onPress={() => setSelectedPayment(opt.id)}
              >
                <View style={[ls.paymentIconBox, selected && ls.paymentIconBoxSelected]}>
                  <Ionicons
                    name={opt.icon}
                    size={20}
                    color={selected ? colors.brand : colors.gray[500]}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[ls.paymentLabel, { fontSize: Math.round(14 * scale) }]}>
                    {opt.label}
                  </Text>
                  <Text style={[ls.paymentDesc, { fontSize: Math.round(12 * scale) }]}>
                    {description}
                  </Text>
                </View>
                <View style={[ls.radio, selected && ls.radioSelected]}>
                  {selected && <View style={ls.radioDot} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.divider} />

        {/* ── 4. Order Summary ── */}
        <View style={styles.orderSummaryContainer}>
          <Text style={[ls.sectionTitle, { fontSize: Math.round(16 * scale), paddingHorizontal: 20, paddingTop: 16 }]}>
            Order Summary
          </Text>
        </View>
        <OrderSummary
          subtotal={subtotal}
          shippingFee={shippingFee}
          total={total}
          couponCode={couponCode}
        />

        {/* ── 5. Coupon ── */}
        <CouponCodeInput onAdd={(code) => setCouponCode(code)} />

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Place Order button ── */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable style={styles.placeOrderButton} onPress={handlePlaceOrder}>
          {({ pressed }) => (
            <View style={[styles.placeOrderButtonInner, { opacity: pressed ? 0.9 : 1 }]}>
              <Text style={[styles.placeOrderButtonText, { fontSize: Math.round(16 * scale) }]}>
                {`Review Order — ${formatCurrency(total, currency.code)}`}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const ls = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  // ── Shipping method cards ──
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  methodCardSelected: {
    borderColor: colors.brand,
    backgroundColor: '#FFF5F7',
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconSelected: {
    backgroundColor: '#FFE4E8',
  },
  methodLabel: {
    fontWeight: '600',
    color: '#111827',
  },
  methodSub: {
    color: '#6B7280',
    marginTop: 2,
  },
  methodCost: {
    fontWeight: '700',
    color: '#111827',
  },
  methodCostSelected: {
    color: colors.brand,
  },
  methodCostFree: {
    fontWeight: '700',
    color: '#16A34A',
  },

  // ── Address ──
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
    color: colors.brand,
    marginLeft: 12,
    fontWeight: '600',
  },
  addAddressRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addAddressText: {
    color: colors.brand,
    fontWeight: '500',
  },

  // ── Payment options ──
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
    borderColor: colors.brand,
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
    fontWeight: '600',
  },
  paymentDesc: {
    color: '#6B7280',
    marginTop: 2,
  },

  // ── Shared radio ──
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
    borderColor: colors.brand,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.brand,
  },
});
