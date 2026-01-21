import React from 'react';
import { View, Text, Pressable, StyleProp, ViewStyle, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { trendingProductCardStyles as styles } from '@/styles/trendingProductCard';

export type TrendingProduct = {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: any;
};

type Props = {
  item: TrendingProduct;
  style?: StyleProp<ViewStyle>;
  onPress?: (item: TrendingProduct) => void;
  onFavoritePress?: (item: TrendingProduct) => void;
};

export function TrendingProductCard({ item, style, onPress, onFavoritePress }: Props) {
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  const starSize = Math.round(13 * scale);

  return (
    <Pressable
      style={[styles.card, style]}
      onPress={() => onPress?.(item)}
    >
      {({ pressed }) => (
        <>
          <View style={[styles.imageWrap, { opacity: pressed ? 0.97 : 1 }]}>
            <Image source={item.image} style={styles.image} contentFit="cover" />

            <Pressable
              style={styles.favButton}
              onPress={() => onFavoritePress?.(item)}
              hitSlop={10}
            >
              {({ pressed: favPressed }) => (
                <Image
                  source={require('../../assets/icons/favorite.png')}
                  style={[styles.favIcon, { opacity: favPressed ? 0.7 : 1 }]}
                  contentFit="contain"
                />
              )}
            </Pressable>
          </View>

          <Text numberOfLines={1} style={styles.name}>
            {item.name}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.price}>${item.price}</Text>
            <View style={styles.ratingWrap}>
              <Ionicons name="star" size={starSize} color="#FBBF24" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          </View>
        </>
      )}
    </Pressable>
  );
}

export default TrendingProductCard;

