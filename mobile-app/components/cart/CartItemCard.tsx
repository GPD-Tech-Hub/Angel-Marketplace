import React from 'react';
import { View, Text, Pressable, useWindowDimensions, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CartItem } from '@/types';
import { useCart } from '@/hooks';
import { cartItemCardStyles as styles } from '@/styles/cartItemCard';
import { config } from '@/constants/config';
import { colors } from '@/constants/colors';
import { formatCurrency, resolvePrice } from '@/utils';
import { useCurrencyStore } from '@/store/currencyStore';

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
  const router = useRouter();
  const { product, quantity, price } = item;
  const { currency } = useCurrencyStore();
  // Cart item prices are stored in GBP (base currency from when added).
  // Show in the product's native currency for the selected currency where available.
  const { price: displayUnitPrice, resolvedCurrency } = resolvePrice(
    product.prices,
    price,
    currency.code
  );

  const useApi = !!onIncrement;
  const increment = useApi ? () => onIncrement(item) : () => storeCart.increment(item.productId);
  const decrement = useApi ? () => onDecrement!(item) : () => storeCart.decrement(item.productId);

  const handleRemove = () => {
    Alert.alert(
      'Remove Item',
      `Remove "${product.name}" from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            useApi ? onRemove!(item) : storeCart.removeFromCart(item.productId),
        },
      ]
    );
  };

  const handleProductPress = () => {
    if (product.slug) {
      router.push({ pathname: '/product/[slug]', params: { slug: product.slug } } as any);
    }
  };

  // Resolve image — images are already full URLs from the backend
  const imageUri =
    product.images && product.images.length > 0
      ? product.images[0]
      : (product as any).image ?? config.IMAGE_PLACEHOLDER;
  const productImage = typeof imageUri === 'string' ? { uri: imageUri } : imageUri;

  const size = item.size as string | undefined;
  const color = item.color as string | undefined;
  const variantLabel = size ? `Size: ${size}` : color ? `Colour: ${color}` : null;

  return (
    <View style={styles.card}>
      {/* Tappable image → product page */}
      <Pressable onPress={handleProductPress} style={styles.imageContainer}>
        {({ pressed }) => (
          <Image
            source={productImage}
            style={[styles.image, { opacity: pressed ? 0.85 : 1 }]}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        )}
      </Pressable>

      {/* Product details */}
      <View style={styles.detailsContainer}>
        {/* Tappable name → product page */}
        <Pressable onPress={handleProductPress}>
          {({ pressed }) => (
            <Text
              style={[styles.productName, { fontSize: Math.round(15 * scale), opacity: pressed ? 0.7 : 1 }]}
              numberOfLines={2}
            >
              {product.name}
            </Text>
          )}
        </Pressable>

        {variantLabel ? (
          <Text style={[styles.variantText, { fontSize: Math.round(12 * scale) }]}>
            {variantLabel}
          </Text>
        ) : null}

        <Text style={[styles.priceText, { fontSize: Math.round(16 * scale) }]}>
          {formatCurrency(displayUnitPrice, resolvedCurrency)}
        </Text>

        {/* Quantity stepper */}
        <View style={styles.bottomRow}>
          <View style={styles.quantityContainer}>
            <Pressable style={styles.quantityButton} onPress={decrement} hitSlop={8}>
              {({ pressed }) => (
                <Ionicons
                  name={quantity <= 1 ? 'trash-outline' : 'remove'}
                  size={Math.round(15 * scale)}
                  color={quantity <= 1 ? colors.brand : colors.gray[700]}
                  style={{ opacity: pressed ? 0.6 : 1 }}
                />
              )}
            </Pressable>
            <Text style={[styles.quantityText, { fontSize: Math.round(15 * scale) }]}>
              {quantity}
            </Text>
            <Pressable style={styles.quantityButton} onPress={increment} hitSlop={8}>
              {({ pressed }) => (
                <Ionicons
                  name="add"
                  size={Math.round(15 * scale)}
                  color={colors.brand}
                  style={{ opacity: pressed ? 0.6 : 1 }}
                />
              )}
            </Pressable>
          </View>

          <Text style={[styles.itemTotal, { fontSize: Math.round(15 * scale) }]}>
            {formatCurrency(displayUnitPrice * quantity, resolvedCurrency)}
          </Text>
        </View>
      </View>

      {/* Delete button */}
      <Pressable style={styles.deleteButton} onPress={handleRemove} hitSlop={10}>
        {({ pressed }) => (
          <Ionicons
            name="close"
            size={Math.round(18 * scale)}
            color={colors.gray[400]}
            style={{ opacity: pressed ? 0.5 : 1 }}
          />
        )}
      </Pressable>
    </View>
  );
}

export default CartItemCard;
