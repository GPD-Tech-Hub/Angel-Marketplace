import React from 'react';
import { View, FlatList, RefreshControl, Text, ActivityIndicator } from 'react-native';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { SkeletonProductCard } from '@/components/ui';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  ListHeaderComponent?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
  numColumns?: number;
}

export function ProductGrid({
  products,
  isLoading = false,
  isRefreshing = false,
  isFetchingNextPage = false,
  hasNextPage = false,
  onRefresh,
  onEndReached,
  ListHeaderComponent,
  ListEmptyComponent,
  numColumns = 2,
}: ProductGridProps) {
  const renderItem = ({ item }: { item: Product }) => (
    <View className="flex-1 p-2">
      <ProductCard product={item} />
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#0ea5e9" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="flex-row flex-wrap p-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} className="w-1/2 p-2">
              <SkeletonProductCard />
            </View>
          ))}
        </View>
      );
    }

    if (ListEmptyComponent) return ListEmptyComponent;

    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-gray-500 text-base">No products found</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={products}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      contentContainerStyle={{ paddingHorizontal: 8 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      onEndReached={hasNextPage ? onEndReached : undefined}
      onEndReachedThreshold={0.5}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#0ea5e9"
          />
        ) : undefined
      }
    />
  );
}

export default ProductGrid;
