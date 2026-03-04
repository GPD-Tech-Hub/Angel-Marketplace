import React, { useState, useCallback, useMemo } from 'react';
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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProducts, useProductSearch, useCategories } from '@/queries';
import { DiscoverSearchBar } from '@/components/layout/DiscoverSearchBar';
import { ProductGrid } from '@/components/products';
import { colors } from '@/constants/colors';
import { ProductFilters } from '@/types';

const { width: SW } = Dimensions.get('window');

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
  const [searchQuery, setSearchQuery]           = useState('');
  const [submittedQuery, setSubmittedQuery]     = useState('');
  const [activeSort, setActiveSort]             = useState<SortOption>('newest');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [refreshing, setRefreshing]             = useState(false);

  // Price filter state
  const [filterVisible, setFilterVisible]     = useState(false);
  const [minPriceInput, setMinPriceInput]     = useState('');
  const [maxPriceInput, setMaxPriceInput]     = useState('');
  const [appliedMin, setAppliedMin]           = useState<number | undefined>();
  const [appliedMax, setAppliedMax]           = useState<number | undefined>();

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

  const { data: categories = [] } = useCategories();

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

  const isLoading  = isSearching ? searchFetching : browseLoading;
  const products   = isSearching ? searchResults  : browseProducts;

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

      {/* ── Search ── */}
      <View style={s.searchWrap}>
        <DiscoverSearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          onSubmit={handleSearchSubmit}
          onFilterPress={openFilter}
        />
      </View>

      {/* ── Active price filter pill ── */}
      {hasActiveFilters && (
        <View style={s.filterPillRow}>
          <View style={s.filterPill}>
            <Ionicons name="pricetag-outline" size={11} color={colors.brand} />
            <Text style={s.filterPillText}>{filterLabel}</Text>
            <Pressable onPress={clearFilters} hitSlop={8}>
              <Ionicons name="close" size={13} color={colors.brand} />
            </Pressable>
          </View>
        </View>
      )}

      {/* ── Sort + Category strips (browse only) ── */}
      {!isSearching && (
        <>
          {/* Sort */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.strip}
          >
            {SORT_OPTIONS.map((opt) => {
              const active = activeSort === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={[s.chip, active && s.chipOn]}
                  onPress={() => setActiveSort(opt.key)}
                >
                  <Text style={[s.chipLabel, active && s.chipLabelOn]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Categories */}
          {categories.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.catStrip}
            >
              <Pressable
                style={[s.catChip, !activeCategoryId && s.catChipOn]}
                onPress={() => setActiveCategoryId(null)}
              >
                <Text style={[s.catLabel, !activeCategoryId && s.catLabelOn]}>All</Text>
              </Pressable>
              {categories.map((cat) => {
                const active = activeCategoryId === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    style={[s.catChip, active && s.catChipOn]}
                    onPress={() => setActiveCategoryId(active ? null : cat.id)}
                  >
                    <Text style={[s.catLabel, active && s.catLabelOn]}>{cat.name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </>
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
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{submittedQuery}&rdquo;
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
                {hasActiveFilters ? 'Try adjusting your price filter' : 'Try a different search or category'}
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

            {/* Inputs */}
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

            {/* Presets */}
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

            {/* Actions */}
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

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAFAFA' },

  // Header
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10 },
  title:     { fontSize: 28, fontWeight: '800', color: colors.gray[900], letterSpacing: -0.5 },
  clearText: { fontSize: 14, fontWeight: '600', color: colors.brand },

  // Search
  searchWrap: { paddingHorizontal: 16, paddingBottom: 10 },

  // Active filter pill
  filterPillRow: { paddingHorizontal: 16, paddingBottom: 8 },
  filterPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start',
    backgroundColor: '#FEF2F4', borderWidth: 1, borderColor: '#FECDD3',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
  },
  filterPillText: { fontSize: 12, fontWeight: '600', color: colors.brand },

  // Sort chips
  strip: { paddingHorizontal: 16, paddingBottom: 8, gap: 6 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: colors.gray[200],
    backgroundColor: '#fff',
  },
  chipOn:      { borderColor: colors.brand, backgroundColor: '#FEF2F4' },
  chipLabel:   { fontSize: 13, fontWeight: '600', color: colors.gray[500] },
  chipLabelOn: { color: colors.brand },

  // Category chips
  catStrip: { paddingHorizontal: 16, paddingBottom: 12, gap: 6 },
  catChip: {
    paddingHorizontal: 13, paddingVertical: 6,
    borderRadius: 20, backgroundColor: colors.gray[100],
  },
  catChipOn:  { backgroundColor: colors.gray[900] },
  catLabel:   { fontSize: 12, fontWeight: '600', color: colors.gray[600] },
  catLabelOn: { color: '#fff' },

  // Loader / empty
  loader:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyWrap:  { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.gray[800], marginTop: 12, textAlign: 'center' },
  emptySub:   { fontSize: 13, color: colors.gray[500], marginTop: 5, textAlign: 'center', lineHeight: 18 },
  emptyBtn:   { marginTop: 18, paddingHorizontal: 22, paddingVertical: 11, backgroundColor: colors.brand, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  resultCount: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 2, fontSize: 12, color: colors.gray[500] },

  // Bottom sheet
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

  // Price inputs
  inputRow:   { flexDirection: 'row', alignItems: 'center', gap: 0 },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: colors.gray[500], letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 },
  inputBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.gray[200],
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11,
    backgroundColor: '#FAFAFA',
  },
  inputPrefix: { fontSize: 15, fontWeight: '600', color: colors.gray[400], marginRight: 4 },
  input:       { flex: 1, fontSize: 16, fontWeight: '600', color: colors.gray[900] },
  inputDivider:{ width: 12 },

  // Presets
  presetsTitle: { fontSize: 13, fontWeight: '700', color: colors.gray[700], marginTop: 22, marginBottom: 10 },
  presetsWrap:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preset: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: colors.gray[200],
    backgroundColor: '#fff',
  },
  presetOn:      { borderColor: colors.brand, backgroundColor: '#FEF2F4' },
  presetLabel:   { fontSize: 13, fontWeight: '600', color: colors.gray[600] },
  presetLabelOn: { color: colors.brand },

  // Sheet actions
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 28 },
  btnClear: {
    flex: 1, paddingVertical: 15, borderRadius: 14,
    borderWidth: 1.5, borderColor: colors.gray[200],
    alignItems: 'center',
  },
  btnClearText: { fontSize: 15, fontWeight: '700', color: colors.gray[700] },
  btnApply: {
    flex: 2, paddingVertical: 15, borderRadius: 14,
    backgroundColor: colors.brand, alignItems: 'center',
  },
  btnApplyText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
