import { colors } from '@/constants/colors';
import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useResponsive, useFavorites } from '@/hooks';
import { homeTopSectionStyles as styles } from '@/styles/homeTopSection';
import { DiscoverSearchBar } from '@/components/layout/DiscoverSearchBar';
import { CategoriesRow, type CategoryItem } from '@/components/home/CategoriesRow';
import { HomeBanner } from '@/components/home/HomeBanner';
import { TrendingSection } from '@/components/home/TrendingSection';
import type { TrendingProduct } from '@/components/home/TrendingProductCard';
import { Product } from '@/types';
import { useCategories } from '@/queries/useCategories';
import { useTrendingProducts } from '@/queries/useProducts';
import { useAds } from '@/queries/useAds';
import { config } from '@/constants/config';
import { NewsletterCard } from '@/components/home/NewsletterCard';
import { useCurrencyStore } from '@/store/currencyStore';
import { sortByCurrency } from '@/utils';


export default function HomeScreen() {
  const router = useRouter();
  const { horizontalPadding } = useResponsive();
  const { toggleFavorite } = useFavorites();

  const [refreshing, setRefreshing] = useState(false);

  const { currency } = useCurrencyStore();
  const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories } = useCategories();
  const { data: trendingProducts = [], isLoading: trendingLoading, refetch: refetchTrending } = useTrendingProducts(10);
  const { data: ads = [], refetch: refetchAds } = useAds();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCategories(), refetchTrending(), refetchAds()]);
    setRefreshing(false);
  }, [refetchCategories, refetchTrending, refetchAds]);

  const categoryItems: CategoryItem[] = useMemo(() => {
    return categories
      .filter((c) => !!c.image)
      .map((c) => ({
        id: c.id,
        label: c.name,
        image: { uri: c.image as string },
      }));
  }, [categories]);

  const trendingItems: TrendingProduct[] = useMemo(() => {
    const sorted = sortByCurrency(trendingProducts, currency.code);
    return sorted.map((p: Product & { rating?: number }) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      prices: p.prices,
      rating: p.rating ?? 0,
      image: p.images?.[0] ? { uri: p.images[0] } : { uri: config.IMAGE_PLACEHOLDER },
    }));
  }, [trendingProducts, currency.code]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        }
      >
        <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
          {/* Title + bell */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>Discover</Text>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/notifications' as any)}
            >
              {({ pressed }) => (
                <Image
                  source={require('../../assets/icons/bell.png')}
                  style={[styles.bellIcon, { opacity: pressed ? 0.7 : 1 }]}
                  contentFit="contain"
                />
              )}
            </Pressable>
          </View>

          {/* Tapping the bar or filter icon both go to Shop — home has no local search */}
          <Pressable onPress={() => router.push('/(tabs)/shop' as any)}>
            <DiscoverSearchBar
              placeholder="Search products…"
              onFilterPress={() => router.push('/(tabs)/shop' as any)}
              containerStyle={{ pointerEvents: 'none' }}
            />
          </Pressable>

          {categoryItems.length > 0 && (
            <CategoriesRow
              items={categoryItems}
              onViewAllPress={() => router.push('/(tabs)/shop')}
              onCategoryPress={(item) => {
                router.push({ pathname: '/(tabs)/shop', params: { categoryId: item.id } } as any);
              }}
            />
          )}

          {/* Ad banner — fetched from API, falls back to nothing while loading */}
          <HomeBanner ads={ads} />

          {trendingLoading ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={colors.brand} />
            </View>
          ) : (
            <TrendingSection
              items={trendingItems}
              horizontalPadding={horizontalPadding}
              onViewAllPress={() => router.push('/(tabs)/categories')}
              onItemPress={(item) => {
                const product = trendingProducts.find((p) => p.id === item.id);
                if (product?.slug) {
                  router.push({ pathname: '/product/[slug]', params: { slug: product.slug } } as any);
                } else {
                  router.push({ pathname: '/product-details', params: { productId: item.id } } as any);
                }
              }}
              onFavoritePress={(item) => {
                const product = trendingProducts.find((p) => p.id === item.id);
                const forStore: Product = product
                  ? { ...product, slug: product.slug || item.id }
                  : {
                      id: item.id,
                      name: item.name,
                      slug: item.id.toLowerCase().replace(/\s+/g, '-'),
                      description: '',
                      price: item.price,
                      images: [],
                      stock: 0,
                      categoryId: '',
                      createdAt: new Date().toISOString(),
                    };
                if (toggleFavorite) toggleFavorite(forStore);
              }}
            />
          )}

          {/* Newsletter opt-in */}
          <NewsletterCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
