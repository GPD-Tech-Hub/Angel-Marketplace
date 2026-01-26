import React from 'react';
import { View, Text, Pressable, StyleProp, ViewStyle, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { savedProductCardStyles as styles } from '@/styles/savedProductCard';
import { Product } from '@/types';

type Props = {
  product: Product;
  style?: StyleProp<ViewStyle>;
  onPress?: (product: Product) => void;
  onFavoritePress?: (product: Product) => void;
  isFavorite: boolean;
};

export function SavedProductCard({ product, style, onPress, onFavoritePress, isFavorite }: Props) {
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  const starSize = Math.round(13 * scale);

  // Use first image from product, or fallback
  const productImage = product.images && product.images.length > 0 
    ? { uri: product.images[0] }
    : require('../../assets/image/image 2.jpg');

  return (
    <Pressable
      style={[styles.card, style]}
      onPress={() => onPress?.(product)}
    >
      {({ pressed }) => (
        <>
          <View style={[styles.imageWrap, { opacity: pressed ? 0.97 : 1 }]}>
            <Image 
              source={productImage} 
              style={styles.image} 
              contentFit="cover" 
            />

            <Pressable
              style={styles.favButton}
              onPress={() => onFavoritePress?.(product)}
              hitSlop={10}
            >
              {({ pressed: favPressed }) => (
                <View style={[styles.favButtonInner, { opacity: favPressed ? 0.8 : 1 }]}>
                  <Image
                    source={require('../../assets/icons/Heart-duotone.png')}
                    style={styles.favIcon}
                    contentFit="contain"
                  />
                </View>
              )}
            </Pressable>
          </View>

          <Text numberOfLines={1} style={styles.name}>
            {product.name}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.price}>${product.price}</Text>
            <View style={styles.ratingWrap}>
              <Ionicons name="star" size={starSize} color="#FBBF24" />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>
        </>
      )}
    </Pressable>
  );
}

export default SavedProductCard;
