import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useProducts, useProductSearch, useCategories } from '@/queries';
import { DiscoverSearchBar } from '@/components/layout/DiscoverSearchBar';
import { ProductGrid } from '@/components/products';
import { colors } from '@/constants/colors';
import { Product, ProductFilters } from '@/types';
import { config } from '@/constants/config';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name';

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'newest',     label: 'Newest' },
  { key: 'price_asc',  label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
  { key: 'name',       label: 'A – Z' },
];

export default function ShopScreen() {
  const router = useRouter();

  const [searchQuery, setSearchQuery]     = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [activeSort, setActiveSort]       = useState<SortOption>('newest');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [refreshing, setRefreshing]       = useState(false);

  const filters: ProductFilters = useMemo(() => ({
    sortBy: activeSort === 'name' ? undefined : activeSort === 'price_asc' ? 'price' : activeSort === 'price_desc' ? 'price' : 'newest',
    sortOrder: activeSort === 'price_desc' ? 'desc' : activeSort === 'price_asc' ? 'asc' : undefined,
    categoryId: activeCategoryId ?? undefined,
  }), [activeSort, activeCategoryId]);

  // All products (browsing mode)
  const {
    data: browseData,
    isLoading: browseLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchBrowse,
  } = useProducts(filters);

  // Search mode
  const isSearching = submittedQuery.trim().length >= 2;
  const { data: searchResults = [], isFetching: searchFetching, refetch: refetchSearch } = useProductSearch(
    submittedQuery,
    isSearching
  );

  // Categories for filter strip
  const { data: categories = [] } = useCategories();

  const browseProducts = useMemo(() => {
    return (browseData?.pages ?? []).flatMap((p) => p.products ?? []);
  }, [browseData]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (q.trim().length >= 2) setSubmittedQuery(q.trim());
    else if (q.trim().length === 0) setSubmittedQuery('');
  };

  const handleSearchSubmit = useCallback(() => {
    const q = searchQuery.trim();
    if (q) setSubmittedQuery(q);
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSubmittedQuery('');
  };

  const handleProductPress = (product: Product) => {
    router.push({ pathname: '/product/[slug]', params: { slug: product.slug } } as any);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isSearching) await refetchSearch();
    else await refetchBrowse();
    setRefreshing(false);
  }, [isSearching, refetchBrowse, refetchSearch]);

  const isLoading = isSearching ? searchFetching : browseLoading;
  const products  = isSearching ? searchResults : browseProducts;
  const hasResults = products.length > 0;

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Shop</Text>
        {isSearching && (
          <Pressable onPress={handleClearSearch} hitSlop={10} style={s.clearBtn}>
            <Text style={s.clearBtnText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {/* Search bar */}
      <View style={s.searchWrap}>
        <DiscoverSearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onSubmit={handleSearchSubmit}
          onFilterPress={() => {}}
        />
      </View>

      {/* Sort chips — hidden during search */}
      {!isSearching && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.sortStrip}
        >
          {SORT_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              style={[s.chip, activeSort === opt.key && s.chipActive]}
              onPress={() => setActiveSort(opt.key)}
            >
              <Text style={[s.chipText, activeSort === opt.key && s.chipTextActive]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Category filter strip — hidden during search */}
      {!isSearching && categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.catStrip}
        >
          <Pressable
            style={[s.catChip, !activeCategoryId && s.catChipActive]}
            onPress={() => setActiveCategoryId(null)}
          >
            <Text style={[s.catChipText, !activeCategoryId && s.catChipTextActive]}>All</Text>
          </Pressable>
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              style={[s.catChip, activeCategoryId === cat.id && s.catChipActive]}
              onPress={() => setActiveCategoryId(cat.id === activeCategoryId ? null : cat.id)}
            >
              <Text style={[s.catChipText, activeCategoryId === cat.id && s.catChipTextActive]}>
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Results */}
      {isLoading && !refreshing ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : hasResults ? (
        <ProductGrid
          products={products}
          onEndReached={!isSearching && hasNextPage ? () => fetchNextPage() : undefined}
          ListHeaderComponent={
            isSearching ? (
              <Text style={s.resultCount}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{submittedQuery}"
              </Text>
            ) : undefined
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.brand} />
              </View>
            ) : undefined
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} colors={[colors.brand]} />
          }
        />
      ) : (
        <View style={s.center}>
          <Ionicons name="search-outline" size={48} color={colors.gray[300]} />
          <Text style={s.emptyTitle}>
            {isSearching ? `No results for "${submittedQuery}"` : 'No products found'}
          </Text>
          <Text style={s.emptySubtitle}>Try a different search or category</Text>
          {isSearching && (
            <Pressable style={s.clearSearchBtn} onPress={handleClearSearch}>
              <Text style={s.clearSearchBtnText}>Clear search</Text>
            </Pressable>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  clearBtn:     { paddingHorizontal: 12, paddingVertical: 6 },
  clearBtnText: { fontSize: 14, fontWeight: '600', color: colors.brand },

  searchWrap: { paddingHorizontal: 16, paddingBottom: 8 },

  sortStrip: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  chip:          { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  chipActive:    { borderColor: colors.brand, backgroundColor: '#FFF0F3' },
  chipText:      { fontSize: 13, fontWeight: '600', color: colors.gray[600] },
  chipTextActive:{ color: colors.brand },

  catStrip: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  catChip:          { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F3F4F6' },
  catChipActive:    { backgroundColor: '#111827' },
  catChipText:      { fontSize: 12, fontWeight: '600', color: colors.gray[600] },
  catChipTextActive:{ color: '#fff' },

  resultCount:   { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, fontSize: 13, color: colors.gray[500] },

  emptyTitle:   { fontSize: 17, fontWeight: '700', color: '#111827', marginTop: 14, textAlign: 'center' },
  emptySubtitle:{ fontSize: 13, color: colors.gray[500], marginTop: 6, textAlign: 'center' },
  clearSearchBtn:     { marginTop: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.brand, borderRadius: 10 },
  clearSearchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
