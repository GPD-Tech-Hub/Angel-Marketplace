import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '@/types';
import { useCart } from '@/hooks';
import { cartItemCardStyles as styles } from '@/styles/cartItemCard';
import { config } from '@/constants/config';
import { colors } from '@/constants/colors';

type Props = {
  item: CartItem;
  /** When provided (API cart), use these instead of local store */
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
  const increment = useApi ? () => onIncrement(item) : () => storeCart.increment(item.productId);
  const decrement = useApi ? () => onDecrement!(item) : () => storeCart.decrement(item.productId);
  const removeFromCart = useApi ? () => onRemove!(item) : () => storeCart.removeFromCart(item.productId);

  // Resolve image — images are already full URLs from the backend
  const imageUri =
    product.images && product.images.length > 0
      ? product.images[0]
      : (product as any).image ?? config.IMAGE_PLACEHOLDER;
  const productImage = typeof imageUri === 'string' ? { uri: imageUri } : imageUri;

  // Use real size/color from cart item if available
  const size = (item as any).size as string | undefined;
  const color = (item as any).color as string | undefined;
  const sizeLabel = size ? `Size ${size}` : color ? `Colour: ${color}` : null;

  const formatPrice = (p: number) =>
    `£${p.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <View style={styles.card}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={productImage}
          style={styles.image}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      </View>

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        <Text style={[styles.productName, { fontSize: Math.round(16 * scale) }]} numberOfLines={2}>
          {product.name}
        </Text>

        {sizeLabel ? (
          <Text style={[styles.sizeText, { fontSize: Math.round(13 * scale) }]}>
            {sizeLabel}
          </Text>
        ) : null}

        {/* Price and Quantity Controls Row */}
        <View style={styles.priceQuantityRow}>
          <Text style={[styles.priceText, { fontSize: Math.round(16 * scale) }]}>
            {formatPrice(price)}
          </Text>

          <View style={styles.quantityContainer}>
            <Pressable
              style={styles.quantityButton}
              onPress={decrement}
              hitSlop={10}
            >
              {({ pressed }) => (
                <Ionicons
                  name="remove"
                  size={Math.round(16 * scale)}
                  color={colors.gray[900]}
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
              onPress={increment}
              hitSlop={10}
            >
              {({ pressed }) => (
                <Ionicons
                  name="add"
                  size={Math.round(16 * scale)}
                  color={colors.gray[900]}
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
        onPress={removeFromCart}
        hitSlop={10}
      >
        {({ pressed }) => (
          <Ionicons
            name="trash-outline"
            size={Math.round(20 * scale)}
            color={colors.error}
            style={{ opacity: pressed ? 0.7 : 1 }}
          />
        )}
      </Pressable>
    </View>
  );
}

export default CartItemCard;
