import React from 'react';
import { View, Text, Pressable, FlatList, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { trendingSectionStyles as styles } from '@/styles/trendingSection';
import { TrendingProductCard, type TrendingProduct } from './TrendingProductCard';

type Props = {
  items: TrendingProduct[];
  horizontalPadding: number;
  onViewAllPress?: () => void;
  onItemPress?: (item: TrendingProduct) => void;
  onFavoritePress?: (item: TrendingProduct) => void;
};

export function TrendingSection({
  items,
  horizontalPadding,
  onViewAllPress,
  onItemPress,
  onFavoritePress,
}: Props) {
  const { width } = useWindowDimensions();
  const gap = 12;
  const cardWidth = (width - horizontalPadding * 2 - gap) / 2;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Trending</Text>
        <Pressable onPress={onViewAllPress} hitSlop={10}>
          {({ pressed }) => (
            <View style={[styles.viewAllWrap, { opacity: pressed ? 0.7 : 1 }]}>
              <Text style={styles.viewAllText}>View all</Text>
              <Image
                source={require('../../assets/icons/arrow-up-right.png')}
                style={styles.viewAllIcon}
                contentFit="contain"
              />
            </View>
          )}
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={{ justifyContent: 'flex-start' }}
        renderItem={({ item, index }) => (
          <TrendingProductCard
            item={item}
            style={{
              width: cardWidth,
              marginRight: index % 2 === 0 ? gap : 0,
            }}
            onPress={onItemPress}
            onFavoritePress={onFavoritePress}
          />
        )}
      />
    </View>
  );
}

export default TrendingSection;

