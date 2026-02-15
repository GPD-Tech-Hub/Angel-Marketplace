import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '@/types';
import { useCart } from '@/hooks';
import { cartItemCardStyles as styles } from '@/styles/cartItemCard';
import { config } from '@/constants/config';

type Props = {
  item: CartItem;
  /** When provided (e.g. API cart), use these instead of store */
  onIncrement?: (item: CartItem) => void;
  onDecrement?: (item: CartItem) => void;
  onRemove?: (item: CartItem) => void;
};

export function CartItemCard({ item, onIncrement, onDecrement, onRemove }: Props) {
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  const storeCart = useCart();
  const { product, quantity, price } = item;
  const useApi = !!onIncrement;
  const increment = useApi ? () => onIncrement?.(item) : () => storeCart.increment(item.productId);
  const decrement = useApi ? () => onDecrement?.(item) : () => storeCart.decrement(item.productId);
  const removeFromCart = useApi ? () => onRemove?.(item) : () => storeCart.removeFromCart(item.productId);

  const getProductImage = () => {
    if (!product.images || product.images.length === 0) {
      return { uri: config.IMAGE_PLACEHOLDER };
    }
    const imagePath = product.images[0];
    if (typeof imagePath === 'string' && (imagePath.startsWith('http') || imagePath.startsWith('data:'))) {
      return { uri: imagePath };
    }
    if (imagePath === 'image 2.jpg') return require('../../assets/image/image 2.jpg');
    if (imagePath === 'image 1.jpg') return require('../../assets/image/image 1.jpg');
    return { uri: typeof imagePath === 'string' ? imagePath : config.IMAGE_PLACEHOLDER };
  };
  const productImage = getProductImage();

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

        {/* Price and Quantity Controls Row */}
        <View style={styles.priceQuantityRow}>
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
            <View style={styles.quantityDivider} />
            <Text style={[styles.quantityText, { fontSize: Math.round(16 * scale) }]}>
              {quantity}
            </Text>
            <View style={styles.quantityDivider} />
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
