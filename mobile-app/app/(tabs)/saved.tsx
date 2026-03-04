import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '@/hooks';
import { useResponsive } from '@/hooks';
import { DiscoverSearchBar } from '@/components/layout/DiscoverSearchBar';
import { SavedItemsGrid } from '@/components/saved';
import { savedScreenStyles as styles } from '@/styles/savedScreen';
import { colors } from '@/constants/colors';

export default function SavedScreen() {
  const router = useRouter();
  const { horizontalPadding } = useResponsive();
  const [searchQuery, setSearchQuery] = useState('');

  const { favorites, isLoading, toggleFavorite, isFavorite } = useFavorites();

  // Client-side filter when a search query is present
  const filtered = searchQuery.trim()
    ? favorites.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : favorites;

  const hasFavorites = filtered.length > 0;

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
          onChangeText={setSearchQuery}
          onSubmit={() => {}}
          onFilterPress={() => {}}
        />
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : hasFavorites ? (
        <SavedItemsGrid
          products={filtered}
          horizontalPadding={horizontalPadding}
          onItemPress={(product) => {
            router.push({
              pathname: '/product/[slug]',
              params: { slug: product.slug || product.id },
            } as any);
          }}
          onFavoritePress={toggleFavorite}
          isFavorite={isFavorite}
        />
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={[styles.scrollContentCentered, { paddingHorizontal: horizontalPadding }]}
          showsVerticalScrollIndicator={false}
        >
          <Ionicons name="heart-outline" size={56} color={colors.gray[300]} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.gray[900], marginTop: 16, textAlign: 'center' }}>
            {searchQuery ? 'No matches found' : 'Nothing saved yet'}
          </Text>
          <Text style={{ fontSize: 14, color: colors.gray[500], marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
            {searchQuery
              ? 'Try a different search term'
              : 'Items you heart will appear here'}
          </Text>
          {!searchQuery && (
            <Pressable
              onPress={() => router.push('/(tabs)/shop' as any)}
              style={{ marginTop: 24, backgroundColor: colors.brand, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 14 }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Browse Products</Text>
            </Pressable>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
