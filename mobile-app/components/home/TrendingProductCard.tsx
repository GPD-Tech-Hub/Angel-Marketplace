import React from 'react';
import { View, Text, Pressable, StyleProp, ViewStyle, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { trendingProductCardStyles as styles } from '@/styles/trendingProductCard';
import { useFavoritesStore } from '@/store';

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
  const isFavorite = useFavoritesStore((state) => state.isFavorite(item.id));

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
                <View style={[styles.favButtonInner, isFavorite && styles.favButtonActive, { opacity: favPressed ? 0.8 : 1 }]}>
                  <Image
                    source={
                      isFavorite
                        ? require('../../assets/icons/Heart-duotone.png')
                        : require('../../assets/icons/favorite.png')
                    }
                    style={styles.favIcon}
                    contentFit="contain"
                    tintColor={isFavorite ? '#FFFFFF' : undefined}
                  />
                </View>
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

