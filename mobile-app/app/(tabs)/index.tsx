import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
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

export default function HomeScreen() {
  const router = useRouter();
  const { horizontalPadding } = useResponsive();
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const categoryItems: CategoryItem[] = [
    { id: 'apparels', label: 'Apparels', image: require('../../assets/image/image 5.png') },
    { id: 'footwear', label: 'Footwear', image: require('../../assets/image/image 6.png') },
    { id: 'household', label: 'Household', image: require('../../assets/image/image 7.png') },
    { id: 'accessories', label: 'Accessories', image: require('../../assets/image/image 3.png') },
  ];
  const trendingItems: TrendingProduct[] = [
    { id: 't1', name: 'Rhapsody Bomber Jacket', price: 90, rating: 4.8, image: require('../../assets/image/image 2.jpg') },
    { id: 't2', name: 'Rhapsody Premium Bomb...', price: 90, rating: 4.8, image: require('../../assets/image/image 1.jpg') },
    { id: 't3', name: 'Rhapsody Bomber Jacket', price: 90, rating: 4.8, image: require('../../assets/image/image 2.jpg') },
    { id: 't4', name: 'Rhapsody Premium Bomb...', price: 90, rating: 4.8, image: require('../../assets/image/image 1.jpg') },
  ];

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
            onViewAllPress={() => {
              // TODO: view all categories
            }}
            onCategoryPress={() => {
              // TODO: category pressed
            }}
          />

          <HomeBanner
            source={require('../../assets/image/Frame 45.png')}
            onPress={() => {
              // TODO: banner pressed
            }}
          />

          <TrendingSection
            items={trendingItems}
            horizontalPadding={horizontalPadding}
            onViewAllPress={() => {
              // TODO: view all trending
            }}
            onItemPress={(item) => {
              router.push({
                pathname: '/product-details',
                params: { productId: item.id },
              } as any);
            }}
            onFavoritePress={(item) => {
              // Convert TrendingProduct to Product format for the store
              const product: Product = {
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
              if (toggleFavorite) {
                toggleFavorite(product);
              }
            }}
          />
        </View>

        {/* Next: Categories row, banner, trending, etc. */}
      </ScrollView>
    </SafeAreaView>
  );
}
