import React from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/hooks';
import { CartItemCard, OrderSummary, CheckoutButton } from '@/components/cart';
import { cartScreenStyles as styles } from '@/styles/cartScreen';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  
  const { items, itemCount, subtotal } = useCart();

  const handleCheckout = () => {
    // TODO: Navigate to checkout screen
    console.log('Proceed to checkout');
  };

  // Mock VAT calculation (0% in the design)
  const vat = 0;
  const shippingFee = 80;
  const total = subtotal + vat + shippingFee;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Custom Header */}
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
          My Cart
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cart Items */}
        {items.length > 0 ? (
          <>
            {items.map((item) => (
              <CartItemCard key={item.id} item={item} />
            ))}

            {/* Order Summary */}
            <OrderSummary
              subtotal={subtotal}
              vat={vat}
              shippingFee={shippingFee}
              total={total}
            />

            {/* Checkout Button */}
            <CheckoutButton onPress={handleCheckout} />

            {/* Bottom spacing for safe area */}
            <View style={{ height: Math.max(insets.bottom, 20) + 80 }} />
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={64} color="#9CA3AF" />
            <Text style={[styles.emptyTitle, { fontSize: Math.round(20 * scale) }]}>
              Your cart is empty
            </Text>
            <Text style={[styles.emptyMessage, { fontSize: Math.round(14 * scale) }]}>
              Looks like you haven't added anything to your cart yet
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
