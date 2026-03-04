import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritesStore } from '@/store';
import { useResponsive } from '@/hooks';
import { DiscoverSearchBar } from '@/components/layout/DiscoverSearchBar';
import { EmptySavedItems, SavedItemsGrid } from '@/components/saved';
import { savedScreenStyles as styles } from '@/styles/savedScreen';

export default function SavedScreen() {
  const router = useRouter();
  const { horizontalPadding } = useResponsive();
  const [searchQuery, setSearchQuery] = useState('');
  const favorites = useFavoritesStore((state) => state.items);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Filter favorites based on search
  };

  const handleFavoritePress = (product: any) => {
    toggleFavorite(product);
  };

  const hasFavorites = favorites.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={10}
        >
          {({ pressed }) => (
            <Ionicons
              name="chevron-back"
              size={24}
              color="#111827"
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          )}
        </Pressable>
        <Text style={styles.headerTitle}>Saved Items</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <DiscoverSearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onSubmit={() => {
            // TODO: Perform search
          }}
          onFilterPress={() => {
            // TODO: Open filters
          }}
        />
      </View>

      {/* Content */}
      {hasFavorites ? (
        <SavedItemsGrid
          products={favorites}
          horizontalPadding={horizontalPadding}
          onItemPress={(product) => {
            router.push({
              pathname: '/product/[slug]',
              params: { slug: product.slug || product.id },
            } as any);
          }}
          onFavoritePress={handleFavoritePress}
          isFavorite={isFavorite}
        />
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContentCentered}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <EmptySavedItems />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
