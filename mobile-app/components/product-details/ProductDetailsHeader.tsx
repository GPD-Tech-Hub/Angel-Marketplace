import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { DiscoverSearchBar } from '@/components/layout/DiscoverSearchBar';
import { productDetailsStyles as styles } from '@/styles/productDetailsScreen';

const scale = 1;

interface ProductDetailsHeaderProps {
  isFavorite?: boolean;
  onFavoritePress?: () => void;
}

export function ProductDetailsHeader({
  isFavorite = false,
  onFavoritePress,
}: ProductDetailsHeaderProps) {
  const router = useRouter();
  const favoriteScale = useSharedValue(1);

  const favoriteAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: favoriteScale.value }],
  }));

  const handleFavoritePress = () => {
    favoriteScale.value = withSequence(
      withTiming(1.2, { duration: 60, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 100, easing: Easing.out(Easing.ease) })
    );
    onFavoritePress?.();
  };

  return (
    <>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize: Math.round(22 * scale) }]}>
          Details
        </Text>
        {onFavoritePress ? (
          <Pressable
            style={styles.headerFavoriteButton}
            onPress={handleFavoritePress}
            hitSlop={10}
          >
            {({ pressed }) => (
              <Animated.View
                style={[
                  styles.headerFavoriteButtonInner,
                  isFavorite && styles.headerFavoriteButtonActive,
                  { opacity: pressed ? 0.8 : 1 },
                  favoriteAnimatedStyle,
                ]}
              >
                <Image
                  source={
                    isFavorite
                      ? require('../../assets/icons/Heart-duotone.png')
                      : require('../../assets/icons/favorite.png')
                  }
                  style={styles.headerFavoriteIcon}
                  contentFit="contain"
                  tintColor={isFavorite ? '#FFFFFF' : undefined}
                />
              </Animated.View>
            )}
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>
      <View style={styles.searchBarContainer}>
        <DiscoverSearchBar onFilterPress={() => {}} />
      </View>
    </>
  );
}
