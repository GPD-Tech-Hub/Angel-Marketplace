import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable } from 'react-native';
import { DiscoverSearchBar } from '@/components/layout/DiscoverSearchBar';
import { RecentSearches, NoResultsFound } from '@/components/search';
import { searchScreenStyles as styles } from '@/styles/searchScreen';
import { useProductSearch } from '@/queries/useProducts';
import { colors } from '@/constants/colors';
import { Product } from '@/types';
import { ProductGrid } from '@/components/products';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Shirts', 'Gift', 'Jacket', 'Gown',
  ]);

  // Only search once the user has actually submitted (or typed ≥2 chars after debounce)
  const { data: searchResults = [], isFetching } = useProductSearch(
    submittedQuery,
    submittedQuery.trim().length >= 2
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Live search as they type (debounced inside useProductSearch at ≥2 chars)
    if (query.trim().length >= 2) {
      setSubmittedQuery(query.trim());
    } else if (query.trim().length === 0) {
      setSubmittedQuery('');
    }
  };

  const handleSearchSubmit = useCallback(() => {
    const q = searchQuery.trim();
    if (!q) return;
    setSubmittedQuery(q);
    if (!recentSearches.includes(q)) {
      setRecentSearches((prev) => [q, ...prev].slice(0, 10));
    }
  }, [searchQuery, recentSearches]);

  const handleClearAll = () => setRecentSearches([]);
  const handleRemoveSearch = (s: string) =>
    setRecentSearches((prev) => prev.filter((r) => r !== s));
  const handleSearchPress = (s: string) => {
    setSearchQuery(s);
    setSubmittedQuery(s);
  };

  useEffect(() => {
    const incomingQuery = typeof params.q === 'string' ? params.q.trim() : '';
    if (!incomingQuery) return;

    setSearchQuery((current) => (current === incomingQuery ? current : incomingQuery));
    setSubmittedQuery((current) => (current === incomingQuery ? current : incomingQuery));
    setRecentSearches((prev) => (prev.includes(incomingQuery) ? prev : [incomingQuery, ...prev].slice(0, 10)));
  }, [params.q]);

  const handleProductPress = (product: Product) => {
    router.push({ pathname: '/product/[slug]', params: { slug: product.slug } } as any);
  };

  const hasQuery = submittedQuery.trim().length >= 2;
  const hasResults = searchResults.length > 0;
  const showRecent = !hasQuery && recentSearches.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <DiscoverSearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onSubmit={handleSearchSubmit}
          onFilterPress={() => {/* TODO: filters */}}
        />
      </View>

      {/* Loading spinner */}
      {hasQuery && isFetching && (
        <View style={{ paddingVertical: 32, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      )}

      {/* Results / recent / no-results */}
      {!isFetching && hasQuery && hasResults ? (
        <ProductGrid
          products={searchResults}
          onEndReached={undefined}
          ListHeaderComponent={
            <Text style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, color: colors.gray[500], fontSize: 13 }}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{submittedQuery}"
            </Text>
          }
        />
      ) : !isFetching && hasQuery && !hasResults ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContentCentered}
          showsVerticalScrollIndicator={false}
        >
          <NoResultsFound searchQuery={submittedQuery} />
        </ScrollView>
      ) : showRecent ? (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContentNormal}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <RecentSearches
            searches={recentSearches}
            onSearchPress={handleSearchPress}
            onClearAll={handleClearAll}
            onRemoveSearch={handleRemoveSearch}
          />
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
}
