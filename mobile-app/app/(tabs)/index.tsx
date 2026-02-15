import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useResponsive } from '@/hooks';
import { useFavoritesStore } from '@/store';
import { homeTopSectionStyles as styles } from '@/styles/homeTopSection';
import { DiscoverSearchBar } from '@/components/layout/DiscoverSearchBar';
import { CategoriesRow, type CategoryItem } from '@/components/home/CategoriesRow';
import { HomeBanner } from '@/components/home/HomeBanner';
import { TrendingSection } from '@/components/home/TrendingSection';
import type { TrendingProduct } from '@/components/home/TrendingProductCard';
import { Product } from '@/types';
import { useCategories } from '@/queries/useCategories';
import { useTrendingProducts } from '@/queries/useProducts';
import { config } from '@/constants/config';

const FALLBACK_CATEGORY_IMAGE = require('../../assets/image/image 5.png');

export default function HomeScreen() {
  const router = useRouter();
  const { horizontalPadding } = useResponsive();
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: trendingProducts = [], isLoading: trendingLoading } = useTrendingProducts(10);

  const categoryItems: CategoryItem[] = useMemo(() => {
    if (categories.length === 0) {
      return [
        { id: 'apparels', label: 'Apparels', image: require('../../assets/image/image 5.png') },
        { id: 'footwear', label: 'Footwear', image: require('../../assets/image/image 6.png') },
        { id: 'household', label: 'Household', image: require('../../assets/image/image 7.png') },
        { id: 'accessories', label: 'Accessories', image: require('../../assets/image/image 3.png') },
      ];
    }
    return categories.map((c) => ({
      id: c.id,
      label: c.name,
      image: c.image ? { uri: c.image } : FALLBACK_CATEGORY_IMAGE,
    }));
  }, [categories]);

  const trendingItems: TrendingProduct[] = useMemo(() => {
    return trendingProducts.map((p: Product & { rating?: number }) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      rating: p.rating ?? 0,
      image: p.images?.[0] ? { uri: p.images[0] } : { uri: config.IMAGE_PLACEHOLDER },
    }));
  }, [trendingProducts]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Top section (Discover) */}
        <View style={[styles.container, { paddingHorizontal: horizontalPadding }]}>
          {/* Title + bell */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>Discover</Text>

            <Pressable
              style={styles.iconButton}
              onPress={() => {
                router.push('/notifications' as any);
              }}
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

          <DiscoverSearchBar
            onFilterPress={() => {
              // TODO: filters
            }}
          />

          <CategoriesRow
            items={categoryItems}
            onViewAllPress={() => router.push('/(tabs)/categories')}
            onCategoryPress={(item) => {
              const cat = categories.find((c) => c.id === item.id || c.slug === item.id);
              if (cat?.slug) router.push({ pathname: '/(tabs)/categories', params: { slug: cat.slug } } as any);
              else router.push('/(tabs)/categories');
            }}
          />

          <HomeBanner
            source={require('../../assets/image/Frame 45.png')}
            onPress={() => {
              // TODO: banner pressed
            }}
          />

          {trendingLoading ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#F43F5E" />
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
        </View>

        {/* Next: Categories row, banner, trending, etc. */}
      </ScrollView>
    </SafeAreaView>
  );
}
