import React from 'react';
import { View, FlatList, useWindowDimensions } from 'react-native';
import { Product } from '@/types';
import { SavedProductCard } from './SavedProductCard';
import { savedItemsGridStyles as styles } from '@/styles/savedItemsGrid';

type Props = {
  products: Product[];
  horizontalPadding: number;
  onItemPress?: (product: Product) => void;
  onFavoritePress?: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
};

export function SavedItemsGrid({
  products,
  horizontalPadding,
  onItemPress,
  onFavoritePress,
  isFavorite,
}: Props) {
  const { width } = useWindowDimensions();
  const gap = 12;
  const cardWidth = (width - horizontalPadding * 2 - gap) / 2;

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      columnWrapperStyle={{ justifyContent: 'flex-start', paddingHorizontal: horizontalPadding }}
      contentContainerStyle={styles.listContent}
      style={styles.container}
      renderItem={({ item, index }) => (
        <SavedProductCard
          product={item}
          isFavorite={isFavorite(item.id)}
          style={{
            width: cardWidth,
            marginRight: index % 2 === 0 ? gap : 0,
          }}
          onPress={onItemPress}
          onFavoritePress={onFavoritePress}
        />
      )}
    />
  );
}

export default SavedItemsGrid;
