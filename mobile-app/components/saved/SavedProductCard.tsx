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
  const favScale = useSharedValue(1);
  const favAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: favScale.value }],
  }));

  const handleFavoritePress = () => {
    favScale.value = withSequence(
      withTiming(1.2, { duration: 60, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 100, easing: Easing.out(Easing.ease) })
    );
    onFavoritePress?.(product);
  };

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
              onPress={handleFavoritePress}
              hitSlop={10}
            >
              {({ pressed: favPressed }) => (
                <Animated.View
                  style={[
                    styles.favButtonInner,
                    { opacity: favPressed ? 0.8 : 1 },
                    favAnimatedStyle,
                  ]}
                >
                  <Image
                    source={require('../../assets/icons/Heart-duotone.png')}
                    style={styles.favIcon}
                    contentFit="contain"
                  />
                </Animated.View>
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
