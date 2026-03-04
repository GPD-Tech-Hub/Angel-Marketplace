import React from 'react';
import { View, Text, Pressable, StyleProp, ViewStyle, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { trendingProductCardStyles as styles } from '@/styles/trendingProductCard';
import { useFavorites } from '@/hooks/useFavorites';
import { formatCurrency, resolvePrice } from '@/utils';
import { useCurrencyStore } from '@/store/currencyStore';

export type TrendingProduct = {
  id: string;
  name: string;
  price: number;
  prices?: Record<string, number>;
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
  const { isFavorite: checkFavorite } = useFavorites();
  const isFavorite = checkFavorite(item.id);
  const { currency } = useCurrencyStore();
  const { price: displayPrice, resolvedCurrency } = resolvePrice(item.prices, item.price, currency.code);
  const favScale = useSharedValue(1);
  const favAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: favScale.value }],
  }));

  const handleFavoritePress = () => {
    favScale.value = withSequence(
      withTiming(1.2, { duration: 60, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 100, easing: Easing.out(Easing.ease) })
    );
    onFavoritePress?.(item);
  };

  return (
    <Pressable
      style={[styles.card, style]}
      onPress={() => onPress?.(item)}
    >
      {({ pressed }) => (
        <>
          <View style={[styles.imageWrap, { opacity: pressed ? 0.97 : 1 }]}>
            <Image source={item.image} style={styles.image} contentFit="cover" cachePolicy="memory-disk" />

            <Pressable
              style={styles.favButton}
              onPress={handleFavoritePress}
              hitSlop={10}
            >
              {({ pressed: favPressed }) => (
                <Animated.View
                  style={[
                    styles.favButtonInner,
                    isFavorite && styles.favButtonActive,
                    { opacity: favPressed ? 0.8 : 1 },
                    favAnimatedStyle,
                  ]}
                >
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
                </Animated.View>
              )}
            </Pressable>
          </View>

          <Text numberOfLines={1} style={styles.name}>
            {item.name}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.price}>{formatCurrency(displayPrice, resolvedCurrency)}</Text>
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

