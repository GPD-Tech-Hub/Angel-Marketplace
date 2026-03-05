import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useFavorites } from '@/hooks';
import { useResponsive } from '@/hooks';
import { DiscoverSearchBar } from '@/components/layout/DiscoverSearchBar';
import { SavedItemsGrid } from '@/components/saved';
import { savedScreenStyles as styles } from '@/styles/savedScreen';

export default function SavedScreen() {
  const router = useRouter();
  const { horizontalPadding } = useResponsive();
  const [searchQuery, setSearchQuery] = useState('');

  const { favorites, isLoading, toggleFavorite, isFavorite, refetchFavorites } = useFavorites();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchFavorites();
    } finally {
      setRefreshing(false);
    }
  }, [refetchFavorites]);

  const filtered = searchQuery.trim()
    ? favorites.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : favorites;

  const hasFavorites = filtered.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved</Text>

        {favorites.length > 0 ? (
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{favorites.length}</Text>
          </View>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {/* Search bar — only shown when there are saved items */}
      {favorites.length > 0 && (
        <View style={styles.searchBarContainer}>
          <DiscoverSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmit={() => {}}
            onFilterPress={() => {}}
          />
        </View>
      )}

      {/* Content */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : hasFavorites ? (
        <SavedItemsGrid
          products={filtered}
          horizontalPadding={horizontalPadding}
          onItemPress={(product) =>
            router.push({ pathname: '/product/[slug]', params: { slug: product.slug || product.id } } as any)
          }
          onFavoritePress={toggleFavorite}
          isFavorite={isFavorite}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Image
            source={require('../../assets/icons/Heart-duotone.png')}
            style={[styles.emptyIcon, { width: 100, height: 100 }]}
            contentFit="contain"
          />
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No matches found' : 'Nothing saved yet'}
          </Text>
          <Text style={styles.emptyMessage}>
            {searchQuery
              ? 'Try a different search term'
              : "Items you heart will\nappear here."}
          </Text>
          {!searchQuery && (
            <Pressable style={styles.emptyShopBtn} onPress={() => router.push('/(tabs)/shop' as any)}>
              {({ pressed }) => (
                <Text style={[styles.emptyShopBtnText, { opacity: pressed ? 0.8 : 1 }]}>
                  Browse Products
                </Text>
              )}
            </Pressable>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
