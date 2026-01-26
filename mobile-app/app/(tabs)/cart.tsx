import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/hooks';
import { useCartStore } from '@/store';
import { CartItemCard, OrderSummary, CheckoutButton } from '@/components/cart';
import { CartItem, Product } from '@/types';
import { cartScreenStyles as styles } from '@/styles/cartScreen';

// Mock data matching the design image
const MOCK_CART_ITEMS: CartItem[] = [
  {
    id: 'mock-1',
    productId: 'p1',
    product: {
      id: 'p1',
      name: 'Regular Fit Slogan',
      slug: 'regular-fit-slogan-1',
      description: 'Regular fit slogan t-shirt',
      price: 1190,
      images: ['image 2.jpg'], // Dark blue t-shirt
      stock: 10,
      categoryId: 'cat1',
      createdAt: new Date().toISOString(),
    },
    quantity: 2,
    price: 1190,
  },
  {
    id: 'mock-2',
    productId: 'p2',
    product: {
      id: 'p2',
      name: 'Regular Fit Slogan',
      slug: 'regular-fit-slogan-2',
      description: 'Regular fit slogan polo',
      price: 1190,
      images: ['image 1.jpg'], // Teal/turquoise shirt
      stock: 10,
      categoryId: 'cat1',
      createdAt: new Date().toISOString(),
    },
    quantity: 1,
    price: 1190,
  },
  {
    id: 'mock-3',
    productId: 'p3',
    product: {
      id: 'p3',
      name: 'Regular Fit Slogan',
      slug: 'regular-fit-slogan-3',
      description: 'Regular fit slogan t-shirt',
      price: 1190,
      images: ['image 2.jpg'], // Dark blue t-shirt
      stock: 10,
      categoryId: 'cat1',
      createdAt: new Date().toISOString(),
    },
    quantity: 1,
    price: 1190,
  },
];

// Use mock data for now (set to true to show mock data, false to use real cart)
const USE_MOCK_DATA = true;

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  
  const { items: realItems, itemCount: realItemCount, subtotal: realSubtotal } = useCart();
  const setItems = useCartStore((state) => state.setItems);

  // Initialize mock data in cart store when using mock data
  useEffect(() => {
    if (USE_MOCK_DATA) {
      // Add mock items to cart store so increment/decrement work
      setItems(MOCK_CART_ITEMS);
    }
  }, [setItems]);

  // Use cart store items (which will be mock data if USE_MOCK_DATA is true)
  // The useEffect above initializes the store with mock data
  const items = realItems;
  const itemCount = realItemCount;
  // Calculate subtotal from items if using mock data, otherwise use store subtotal
  const calculatedSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = USE_MOCK_DATA && calculatedSubtotal > 0 ? calculatedSubtotal : realSubtotal;

  const handleCheckout = () => {
    router.push('/checkout');
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
