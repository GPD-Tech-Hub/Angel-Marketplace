import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { productDetailsStyles as styles } from '@/styles/productDetailsScreen';

const scale = 1;

interface ProductDetailsBottomBarProps {
  price: number;
  onAddToCart: () => void;
}

export function ProductDetailsBottomBar({
  price,
  onAddToCart,
}: ProductDetailsBottomBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <View style={styles.priceSection}>
        <Text style={styles.priceLabel}>Price</Text>
        <Text style={[styles.priceValue, { fontSize: Math.round(22 * scale) }]}>
          ${price}
        </Text>
      </View>
      <Pressable style={styles.addToCartButton} onPress={onAddToCart}>
        <View style={styles.addToCartInner}>
          <Ionicons name="cart-outline" size={Math.round(18 * scale)} color="#FFFFFF" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </View>
      </Pressable>
    </View>
  );
}
