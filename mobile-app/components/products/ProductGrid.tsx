import React from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  ListRenderItemInfo,
} from 'react-native';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { colors } from '@/constants/colors';

const SCREEN_W = Dimensions.get('window').width;
const H_PAD    = 16;   // matches ProductCard's card width calculation
const GAP      = 10;
const NUM_COL  = 2;
const CARD_W   = (SCREEN_W - H_PAD * 2 - GAP * (NUM_COL - 1)) / NUM_COL;

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  onEndReached?: () => void;
  ListHeaderComponent?: React.ReactElement;
  ListFooterComponent?: React.ReactElement;
  refreshControl?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
}

function SkeletonCard() {
  return (
    <View style={sk.card}>
      <View style={sk.img} />
      <View style={sk.body}>
        <View style={sk.lineWide} />
        <View style={sk.lineShort} />
        <View style={sk.lineThin} />
      </View>
    </View>
  );
}

export function ProductGrid({
  products,
  isLoading = false,
  isFetchingNextPage = false,
  onEndReached,
  ListHeaderComponent,
  ListFooterComponent,
  refreshControl,
  ListEmptyComponent,
}: ProductGridProps) {

  const renderItem = ({ item, index }: ListRenderItemInfo<Product>) => (
    <View style={[s.cell, index % NUM_COL !== 0 && { marginLeft: GAP }]}>
      <ProductCard product={item} width={CARD_W} />
    </View>
  );

  const EmptyComp = () => {
    if (isLoading) {
      // Skeleton placeholder grid
      return (
        <View style={s.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={[s.cell, i % NUM_COL !== 0 && { marginLeft: GAP }]}>
              <SkeletonCard />
            </View>
          ))}
        </View>
      );
    }
    return ListEmptyComponent ?? (
      <View style={s.empty}>
        <Text style={s.emptyText}>No products found</Text>
      </View>
    );
  };

  const FooterComp = () => (
    <>
      {isFetchingNextPage && (
        <View style={s.footerLoader}>
          <ActivityIndicator size="small" color={colors.brand} />
        </View>
      )}
      {ListFooterComponent}
    </>
  );

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={NUM_COL}
      contentContainerStyle={s.content}
      columnWrapperStyle={s.row}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={EmptyComp}
      ListFooterComponent={FooterComp}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.4}
      refreshControl={refreshControl}
      removeClippedSubviews
    />
  );
}

const s = StyleSheet.create({
  content:     { paddingHorizontal: H_PAD, paddingTop: 4, paddingBottom: 120 },
  row:         { justifyContent: 'flex-start', marginBottom: 0 },
  cell:        { width: CARD_W },
  skeletonGrid:{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: H_PAD, paddingTop: 4 },
  empty:       { paddingVertical: 60, alignItems: 'center', justifyContent: 'center' },
  emptyText:   { fontSize: 15, color: colors.gray[500] },
  footerLoader:{ paddingVertical: 24, alignItems: 'center' },
});

// Skeleton card styles
const sk = StyleSheet.create({
  card: {
    width: CARD_W,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.gray[100],
    marginBottom: 10,
  },
  img: {
    width: '100%',
    height: Math.round(CARD_W * 1.15),
    backgroundColor: colors.gray[100],
  },
  body: {
    paddingHorizontal: 10, paddingTop: 8, paddingBottom: 10, gap: 6,
  },
  lineWide:  { height: 12, borderRadius: 6, backgroundColor: colors.gray[100], width: '80%' },
  lineShort: { height: 12, borderRadius: 6, backgroundColor: colors.gray[100], width: '50%' },
  lineThin:  { height: 10, borderRadius: 5, backgroundColor: colors.gray[100], width: '35%', marginTop: 2 },
});

export default ProductGrid;
