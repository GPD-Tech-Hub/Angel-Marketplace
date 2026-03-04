import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useProducts, useProductSearch, useCategories } from '@/queries';
import { DiscoverSearchBar } from '@/components/layout/DiscoverSearchBar';
import { ProductGrid } from '@/components/products';
import { colors } from '@/constants/colors';
import { ProductFilters } from '@/types';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'name';

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'newest',     label: 'Newest' },
  { key: 'price_asc',  label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
  { key: 'name',       label: 'A – Z' },
];

const PRICE_PRESETS: { label: string; min?: number; max?: number }[] = [
  { label: 'Under £25',   min: undefined, max: 25 },
  { label: '£25 – £50',  min: 25,        max: 50 },
  { label: '£50 – £100', min: 50,        max: 100 },
  { label: 'Over £100',  min: 100,       max: undefined },
];

function sortToParams(sort: SortOption): Pick<ProductFilters, 'sortBy' | 'sortOrder'> {
  switch (sort) {
    case 'price_asc':  return { sortBy: 'price',     sortOrder: 'asc' };
    case 'price_desc': return { sortBy: 'price',     sortOrder: 'desc' };
    case 'name':       return { sortBy: 'name',      sortOrder: 'asc' };
    default:           return { sortBy: 'createdAt', sortOrder: 'desc' };
  }
}

export default function ShopScreen() {
  const { categoryId: paramCategoryId } = useLocalSearchParams<{ categoryId?: string }>();

  const [searchQuery, setSearchQuery]           = useState('');
  const [submittedQuery, setSubmittedQuery]     = useState('');
  const [activeSort, setActiveSort]             = useState<SortOption>('newest');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(paramCategoryId ?? null);
  const [refreshing, setRefreshing]             = useState(false);

  // Sync category filter whenever the param changes (including cleared to undefined)
  useEffect(() => {
    setActiveCategoryId(paramCategoryId ?? null);
  }, [paramCategoryId]);

  const [filterVisible, setFilterVisible]   = useState(false);
  const [minPriceInput, setMinPriceInput]   = useState('');
  const [maxPriceInput, setMaxPriceInput]   = useState('');
  const [appliedMin, setAppliedMin]         = useState<number | undefined>();
  const [appliedMax, setAppliedMax]         = useState<number | undefined>();

  const hasActiveFilters = appliedMin !== undefined || appliedMax !== undefined;

  const filters: ProductFilters = useMemo(() => ({
    ...sortToParams(activeSort),
    categoryId: activeCategoryId ?? undefined,
    minPrice: appliedMin,
    maxPrice: appliedMax,
  }), [activeSort, activeCategoryId, appliedMin, appliedMax]);

  const {
    data: browseData,
    isLoading: browseLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchBrowse,
  } = useProducts(filters);

  const isSearching = submittedQuery.trim().length >= 2;
  const {
    data: searchResults = [],
    isFetching: searchFetching,
    refetch: refetchSearch,
  } = useProductSearch(submittedQuery, isSearching);

  // Always fetch categories — used to know if the strip row should show
  const { data: categories = [], isLoading: catsLoading } = useCategories();

  const browseProducts = useMemo(
    () => (browseData?.pages ?? []).flatMap((p) => p.products ?? []),
    [browseData]
  );

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isSearching) await refetchSearch();
    else await refetchBrowse();
    setRefreshing(false);
  }, [isSearching, refetchBrowse, refetchSearch]);

  const openFilter = () => {
    setMinPriceInput(appliedMin !== undefined ? String(appliedMin) : '');
    setMaxPriceInput(appliedMax !== undefined ? String(appliedMax) : '');
    setFilterVisible(true);
  };

  const applyFilters = () => {
    const min = parseFloat(minPriceInput);
    const max = parseFloat(maxPriceInput);
    setAppliedMin(!isNaN(min) && minPriceInput.trim() ? min : undefined);
    setAppliedMax(!isNaN(max) && maxPriceInput.trim() ? max : undefined);
    setFilterVisible(false);
  };

  const clearFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    setAppliedMin(undefined);
    setAppliedMax(undefined);
    setFilterVisible(false);
  };

  const applyPreset = (preset: typeof PRICE_PRESETS[number]) => {
    setMinPriceInput(preset.min !== undefined ? String(preset.min) : '');
    setMaxPriceInput(preset.max !== undefined ? String(preset.max) : '');
  };

  const presetActive = (preset: typeof PRICE_PRESETS[number]) =>
    appliedMin === preset.min && appliedMax === preset.max;

  const isLoading = isSearching ? searchFetching : browseLoading;
  const products  = isSearching ? searchResults  : browseProducts;

  const filterLabel = [
    appliedMin !== undefined && `From £${appliedMin}`,
    appliedMax !== undefined && `To £${appliedMax}`,
  ].filter(Boolean).join(' · ');

  return (
    <SafeAreaView style={s.screen} edges={['top']}>

      {/* ── Header ── */}
      <View style={s.header}>
        <Text style={s.title}>Shop</Text>
        {isSearching && (
          <Pressable onPress={handleClearSearch} hitSlop={10}>
            <Text style={s.clearText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {/* ── Search bar ── */}
      <View style={s.searchWrap}>
        <DiscoverSearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onSubmit={handleSearchSubmit}
          onFilterPress={openFilter}
          hasActiveFilter={hasActiveFilters}
        />
      </View>

      {/* ── Filter/Sort toolbar — always reserves height, hidden during search ── */}
      {!isSearching && (
        <View style={s.toolbar}>

          {/* Row 1: Sort pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.pillRow}
          >
            {SORT_OPTIONS.map((opt) => {
              const on = activeSort === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={[s.pill, on && s.pillActive]}
                  onPress={() => setActiveSort(opt.key)}
                >
                  <Text style={[s.pillText, on && s.pillTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}

            {/* Price filter pill — lives in same row */}
            <Pressable
              style={[s.pill, s.filterPill, hasActiveFilters && s.filterPillActive]}
              onPress={openFilter}
            >
              <Ionicons
                name="options-outline"
                size={13}
                color={hasActiveFilters ? colors.brand : colors.gray[500]}
              />
              <Text style={[s.pillText, hasActiveFilters && s.pillTextActive]}>
                {hasActiveFilters ? filterLabel : 'Price'}
              </Text>
              {hasActiveFilters && (
                <Pressable
                  onPress={(e) => { e.stopPropagation(); clearFilters(); }}
                  hitSlop={6}
                >
                  <Ionicons name="close" size={12} color={colors.brand} />
                </Pressable>
              )}
            </Pressable>
          </ScrollView>

          {/* Row 2: Category pills — fixed height prevents layout jump */}
          <View style={s.catRowWrap}>
            {catsLoading ? (
              // Skeleton placeholders so height is reserved immediately
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                contentContainerStyle={s.pillRow}
              >
                {[72, 100, 80, 90, 65].map((w, i) => (
                  <View key={i} style={[s.catSkeleton, { width: w }]} />
                ))}
              </ScrollView>
            ) : categories.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.pillRow}
              >
                <Pressable
                  style={[s.catPill, !activeCategoryId && s.catPillActive]}
                  onPress={() => setActiveCategoryId(null)}
                >
                  <Text style={[s.catPillText, !activeCategoryId && s.catPillTextActive]}>
                    All
                  </Text>
                </Pressable>
                {categories.map((cat) => {
                  const on = activeCategoryId === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      style={[s.catPill, on && s.catPillActive]}
                      onPress={() => setActiveCategoryId(on ? null : cat.id)}
                    >
                      <Text style={[s.catPillText, on && s.catPillTextActive]}>
                        {cat.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : null}
          </View>
        </View>
      )}

      {/* ── Products ── */}
      {isLoading && !refreshing ? (
        <View style={s.loader}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : (
        <ProductGrid
          products={products}
          isFetchingNextPage={isFetchingNextPage}
          onEndReached={!isSearching && hasNextPage ? () => fetchNextPage() : undefined}
          ListHeaderComponent={
            isSearching ? (
              <Text style={s.resultCount}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}{' '}
                for &ldquo;{submittedQuery}&rdquo;
              </Text>
            ) : undefined
          }
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Ionicons name="search-outline" size={44} color={colors.gray[300]} />
              <Text style={s.emptyTitle}>
                {isSearching ? `No results for "${submittedQuery}"` : 'No products found'}
              </Text>
              <Text style={s.emptySub}>
                {hasActiveFilters
                  ? 'Try adjusting your price filter'
                  : 'Try a different search or category'}
              </Text>
              {isSearching && (
                <Pressable style={s.emptyBtn} onPress={handleClearSearch}>
                  <Text style={s.emptyBtnText}>Clear search</Text>
                </Pressable>
              )}
              {hasActiveFilters && (
                <Pressable style={s.emptyBtn} onPress={clearFilters}>
                  <Text style={s.emptyBtnText}>Clear filters</Text>
                </Pressable>
              )}
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brand}
              colors={[colors.brand]}
            />
          }
        />
      )}

      {/* ── Price filter bottom sheet ── */}
      <Modal
        visible={filterVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterVisible(false)}
      >
        <Pressable style={s.backdrop} onPress={() => setFilterVisible(false)} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={s.sheetOuter}
        >
          <View style={s.sheet}>
            <View style={s.handle} />
            <Text style={s.sheetTitle}>Filter by Price</Text>
            <Text style={s.sheetSub}>Enter a price range in GBP (£)</Text>

            <View style={s.inputRow}>
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>Min</Text>
                <View style={s.inputBox}>
                  <Text style={s.inputPrefix}>£</Text>
                  <TextInput
                    style={s.input}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.gray[400]}
                    value={minPriceInput}
                    onChangeText={setMinPriceInput}
                    returnKeyType="next"
                  />
                </View>
              </View>
              <View style={s.inputDivider} />
              <View style={s.inputGroup}>
                <Text style={s.inputLabel}>Max</Text>
                <View style={s.inputBox}>
                  <Text style={s.inputPrefix}>£</Text>
                  <TextInput
                    style={s.input}
                    keyboardType="decimal-pad"
                    placeholder="Any"
                    placeholderTextColor={colors.gray[400]}
                    value={maxPriceInput}
                    onChangeText={setMaxPriceInput}
                    returnKeyType="done"
                    onSubmitEditing={applyFilters}
                  />
                </View>
              </View>
            </View>

            <Text style={s.presetsTitle}>Quick ranges</Text>
            <View style={s.presetsWrap}>
              {PRICE_PRESETS.map((p) => {
                const on = presetActive(p);
                return (
                  <Pressable
                    key={p.label}
                    style={[s.preset, on && s.presetOn]}
                    onPress={() => applyPreset(p)}
                  >
                    <Text style={[s.presetLabel, on && s.presetLabelOn]}>{p.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={s.sheetActions}>
              <Pressable style={s.btnClear} onPress={clearFilters}>
                <Text style={s.btnClearText}>Clear</Text>
              </Pressable>
              <Pressable style={s.btnApply} onPress={applyFilters}>
                <Text style={s.btnApplyText}>Show results</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ── Sort/category pill constants ─────────────────────────────────────────────
const PILL_H        = 32;   // fixed height for all pills — prevents layout shift
const CAT_ROW_H     = 40;   // fixed height for category row — reserved even while loading

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },

  // Header
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 10 },
  title:     { fontSize: 26, fontWeight: '800', color: colors.gray[900], letterSpacing: -0.5 },
  clearText: { fontSize: 14, fontWeight: '600', color: colors.brand },

  // Search
  searchWrap: { paddingHorizontal: 16, paddingBottom: 8 },

  // Toolbar wrapper — rendered once, stable height
  toolbar: { paddingBottom: 4 },

  // Shared pill row (used for both sort + category rows)
  pillRow: { paddingHorizontal: 16, gap: 6, alignItems: 'center' },

  // ── Sort + Price pills ──────────────────────────────────────────────────────
  pill: {
    height: PILL_H,
    paddingHorizontal: 13,
    borderRadius: PILL_H / 2,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  pillActive: {
    backgroundColor: colors.gray[900],
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray[600],
    lineHeight: PILL_H,   // prevents text from affecting chip height
  },
  pillTextActive: {
    color: '#fff',
  },

  // Price filter pill variant (lives in same sort row)
  filterPill: {
    backgroundColor: colors.gray[100],
  },
  filterPillActive: {
    backgroundColor: colors.brand,
  },

  // ── Category pills ──────────────────────────────────────────────────────────
  catRowWrap: {
    height: CAT_ROW_H,   // reserved height — prevents the jump when cats load
    justifyContent: 'center',
    marginTop: 4,
  },
  catPill: {
    height: PILL_H,
    paddingHorizontal: 13,
    borderRadius: PILL_H / 2,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  catPillActive: {
    backgroundColor: colors.gray[900],
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray[600],
    lineHeight: PILL_H,
  },
  catPillTextActive: {
    color: '#fff',
  },

  // Skeleton placeholder pills
  catSkeleton: {
    height: PILL_H,
    borderRadius: PILL_H / 2,
    backgroundColor: colors.gray[100],
  },

  // Loader / empty
  loader:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap:  { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.gray[800], marginTop: 12, textAlign: 'center' },
  emptySub:   { fontSize: 13, color: colors.gray[500], marginTop: 5, textAlign: 'center', lineHeight: 18 },
  emptyBtn:   { marginTop: 18, paddingHorizontal: 22, paddingVertical: 11, backgroundColor: colors.brand, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  resultCount: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 2, fontSize: 12, color: colors.gray[500] },

  // ── Bottom sheet ─────────────────────────────────────────────────────────────
  backdrop:   { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheetOuter: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingBottom: 40,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.gray[200],
    alignSelf: 'center', marginTop: 10, marginBottom: 20,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: colors.gray[900] },
  sheetSub:   { fontSize: 13, color: colors.gray[500], marginTop: 3, marginBottom: 22 },

  inputRow:     { flexDirection: 'row', alignItems: 'center' },
  inputGroup:   { flex: 1 },
  inputLabel:   { fontSize: 11, fontWeight: '700', color: colors.gray[500], letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.gray[200],
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11,
    backgroundColor: '#FAFAFA',
  },
  inputPrefix:  { fontSize: 15, fontWeight: '600', color: colors.gray[400], marginRight: 4 },
  input:        { flex: 1, fontSize: 16, fontWeight: '600', color: colors.gray[900] },
  inputDivider: { width: 12 },

  presetsTitle: { fontSize: 13, fontWeight: '700', color: colors.gray[700], marginTop: 22, marginBottom: 10 },
  presetsWrap:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preset: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: colors.gray[200],
    backgroundColor: '#fff',
  },
  presetOn:       { borderColor: colors.brand, backgroundColor: '#FEF2F4' },
  presetLabel:    { fontSize: 13, fontWeight: '600', color: colors.gray[600] },
  presetLabelOn:  { color: colors.brand },

  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 28 },
  btnClear: {
    flex: 1, paddingVertical: 15, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.gray[200], alignItems: 'center',
  },
  btnClearText: { fontSize: 15, fontWeight: '700', color: colors.gray[700] },
  btnApply: {
    flex: 2, paddingVertical: 15, borderRadius: 14,
    backgroundColor: colors.brand, alignItems: 'center',
  },
  btnApplyText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
