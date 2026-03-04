import React from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/hooks';
import { CartItemCard, OrderSummary, CheckoutButton } from '@/components/cart';
import { CartItem } from '@/types';
import { cartScreenStyles as styles } from '@/styles/cartScreen';
import { useAuthStore } from '@/store';
import { useCartQuery, useUpdateCartItem, useRemoveCartItem } from '@/queries';


export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: apiCart, isLoading: cartLoading } = useCartQuery({ enabled: isAuthenticated });
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const { items: storeItems, subtotal: storeSubtotal } = useCart();

  const useApiCart = isAuthenticated && apiCart;
  const items: CartItem[] = useApiCart ? (apiCart.items ?? []) : storeItems;
  const subtotal = useApiCart
    ? (apiCart.items ?? []).reduce((sum, i) => sum + i.price * i.quantity, 0)
    : storeSubtotal;

  const handleApiIncrement = (item: CartItem) => {
    updateCartItem.mutate({ itemId: item.id, payload: { quantity: item.quantity + 1 } });
  };
  const handleApiDecrement = (item: CartItem) => {
    if (item.quantity <= 1) removeCartItem.mutate(item.id);
    else updateCartItem.mutate({ itemId: item.id, payload: { quantity: item.quantity - 1 } });
  };
  const handleApiRemove = (item: CartItem) => removeCartItem.mutate(item.id);

  const handleCheckout = () => router.push('/checkout');
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
        {cartLoading && isAuthenticated ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#F43F5E" />
          </View>
        ) : items.length > 0 ? (
          <>
            {items.map((item) => (
              <CartItemCard
                key={item.id}
                item={item}
                {...(useApiCart && {
                  onIncrement: handleApiIncrement,
                  onDecrement: handleApiDecrement,
                  onRemove: handleApiRemove,
                })}
              />
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
            <Image
              source={require('../../assets/icons/Cart-duotone.png')}
              style={[styles.emptyIcon, { width: Math.round(100 * scale), height: Math.round(100 * scale) }]}
              contentFit="contain"
            />
            <Text style={[styles.emptyTitle, { fontSize: Math.round(20 * scale) }]}>
              Your cart is empty
            </Text>
            <Text style={[styles.emptyMessage, { fontSize: Math.round(14 * scale) }]}>
              When you add products, they’ll \n appear here.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
