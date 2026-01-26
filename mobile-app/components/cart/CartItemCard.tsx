import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '@/types';
import { useCart } from '@/hooks';
import { cartItemCardStyles as styles } from '@/styles/cartItemCard';

type Props = {
  item: CartItem;
};

export function CartItemCard({ item }: Props) {
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  const { increment, decrement, removeFromCart } = useCart();
  const { product, quantity, price } = item;

  // Use first image from product, or fallback
  const productImage = product.images && product.images.length > 0 
    ? { uri: product.images[0] }
    : require('../../assets/image/image 2.jpg');

  // Mock size - in real app, this would come from the cart item
  const size = 'L';

  const handleIncrement = () => {
    increment(item.productId);
  };

  const handleDecrement = () => {
    decrement(item.productId);
  };

  const handleDelete = () => {
    removeFromCart(item.productId);
  };

  return (
    <View style={styles.card}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={productImage}
          style={styles.image}
          contentFit="cover"
        />
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        {/* Product Name */}
        <Text style={[styles.productName, { fontSize: Math.round(16 * scale) }]} numberOfLines={1}>
          {product.name}
        </Text>

        {/* Size */}
        <Text style={[styles.sizeText, { fontSize: Math.round(14 * scale) }]}>
          Size {size}
        </Text>

        {/* Price */}
        <Text style={[styles.priceText, { fontSize: Math.round(16 * scale) }]}>
          $ {price.toLocaleString('en-US')}
        </Text>

        {/* Quantity Controls */}
        <View style={styles.quantityContainer}>
          <Pressable
            style={styles.quantityButton}
            onPress={handleDecrement}
            hitSlop={10}
          >
            {({ pressed }) => (
              <Ionicons
                name="remove"
                size={Math.round(16 * scale)}
                color="#111827"
                style={{ opacity: pressed ? 0.7 : 1 }}
              />
            )}
          </Pressable>
          <Text style={[styles.quantityText, { fontSize: Math.round(16 * scale) }]}>
            {quantity}
          </Text>
          <Pressable
            style={styles.quantityButton}
            onPress={handleIncrement}
            hitSlop={10}
          >
            {({ pressed }) => (
              <Ionicons
                name="add"
                size={Math.round(16 * scale)}
                color="#111827"
                style={{ opacity: pressed ? 0.7 : 1 }}
              />
            )}
          </Pressable>
        </View>
      </View>

      {/* Delete Button */}
      <Pressable
        style={styles.deleteButton}
        onPress={handleDelete}
        hitSlop={10}
      >
        {({ pressed }) => (
          <Ionicons
            name="trash-outline"
            size={Math.round(20 * scale)}
            color="#EF4444"
            style={{ opacity: pressed ? 0.7 : 1 }}
          />
        )}
      </Pressable>
    </View>
  );
}

export default CartItemCard;
