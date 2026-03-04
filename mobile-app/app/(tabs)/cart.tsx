import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/hooks';
import { CartItemCard, OrderSummary, CheckoutButton } from '@/components/cart';
import { CartItem } from '@/types';
import { cartScreenStyles as styles } from '@/styles/cartScreen';
import { useAuthStore } from '@/store';
import { useCartQuery, useUpdateCartItem, useRemoveCartItem, useClearCart } from '@/queries';
import { colors } from '@/constants/colors';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: apiCart, isLoading: cartLoading, refetch } = useCartQuery({ enabled: isAuthenticated });
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const clearCartMutation = useClearCart();
  const { items: storeItems, subtotal: storeSubtotal, clearCart: clearLocalCart } = useCart();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setRefreshing(true);
    try { await refetch(); } finally { setRefreshing(false); }
  }, [isAuthenticated, refetch]);

  const useApiCart = isAuthenticated && apiCart;
  const items: CartItem[] = useApiCart ? (apiCart.items ?? []) : storeItems;
  const subtotal = useApiCart
    ? (apiCart.items ?? []).reduce((sum, i) => sum + i.price * i.quantity, 0)
    : storeSubtotal;

  const handleApiIncrement = (item: CartItem) =>
    updateCartItem.mutate({ itemId: item.id, payload: { quantity: item.quantity + 1 } });

  const handleApiDecrement = (item: CartItem) => {
    if (item.quantity <= 1) removeCartItem.mutate(item.id);
    else updateCartItem.mutate({ itemId: item.id, payload: { quantity: item.quantity - 1 } });
  };

  // Removal confirmation is handled inside CartItemCard via Alert
  const handleApiRemove = (item: CartItem) => removeCartItem.mutate(item.id);

  const handleClearCart = () => {
    Alert.alert(
      'Empty Cart',
      'Remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Empty Cart',
          style: 'destructive',
          onPress: () => {
            if (isAuthenticated) clearCartMutation.mutate();
            else clearLocalCart();
          },
        },
      ]
    );
  };

  const SHIPPING_FEE = 5;
  const total = subtotal + SHIPPING_FEE;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
          {({ pressed }) => (
            <Ionicons name="chevron-back" size={22} color={colors.gray[900]} style={{ opacity: pressed ? 0.6 : 1 }} />
          )}
        </Pressable>

        <Text style={styles.headerTitle}>My Cart</Text>

        {items.length > 0 ? (
          <Pressable style={styles.clearButton} onPress={handleClearCart} hitSlop={10}>
            {({ pressed }) => (
              <Ionicons name="trash-outline" size={20} color={colors.error} style={{ opacity: pressed ? 0.5 : 1 }} />
            )}
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          isAuthenticated ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} colors={[colors.brand]} />
          ) : undefined
        }
      >
        {cartLoading && isAuthenticated && !refreshing ? (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.brand} />
          </View>
        ) : items.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </Text>

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

            <OrderSummary subtotal={subtotal} shippingFee={SHIPPING_FEE} total={total} />
            <CheckoutButton onPress={() => router.push('/checkout')} />
            <View style={{ height: Math.max(insets.bottom, 20) + 80 }} />
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Image
              source={require('../../assets/icons/Cart-duotone.png')}
              style={[styles.emptyIcon, { width: 100, height: 100 }]}
              contentFit="contain"
            />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyMessage}>
              {"When you add products,\nthey'll appear here."}
            </Text>
            <Pressable style={styles.emptyShopBtn} onPress={() => router.push('/(tabs)/categories' as any)}>
              {({ pressed }) => (
                <Text style={[styles.emptyShopBtnText, { opacity: pressed ? 0.8 : 1 }]}>
                  Start Shopping
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
