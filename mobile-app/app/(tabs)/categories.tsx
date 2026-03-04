import React from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useCategories } from '@/queries';
import { Category } from '@/types';
import { categoriesScreenStyles as styles } from '@/styles/categoriesScreen';

const PLACEHOLDER_IMAGE = require('../../assets/image/image 5.png');

export default function CategoriesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { data: categories = [], isLoading, isError, error, refetch, isRefetching } = useCategories();

  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  const numColumns = 2;

  const handleCategoryPress = (category: Category) => {
    router.push(`/category/${category.slug}`);
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const imageSource = item.image
      ? { uri: item.image }
      : PLACEHOLDER_IMAGE;

    return (
      <Pressable
        style={styles.card}
        onPress={() => handleCategoryPress(item)}
        android_ripple={null}
      >
        {({ pressed }) => (
          <View style={{ opacity: pressed ? 0.85 : 1, alignItems: 'center' }}>
            <View style={styles.iconCircle}>
              <Image
                source={imageSource}
                style={styles.iconImage}
                contentFit="contain"
              />
            </View>
            <Text style={[styles.cardTitle, { fontSize: Math.round(15 * scale) }]} numberOfLines={2}>
              {item.name}
            </Text>
            {item.productCount != null && (
              <Text style={[styles.cardCount, { fontSize: Math.round(13 * scale) }]}>
                {item.productCount} product{item.productCount !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        )}
      </Pressable>
    );
  };

  if (isLoading && categories.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { fontSize: Math.round(24 * scale) }]}>
            Categories
          </Text>
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#F43F5E" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { fontSize: Math.round(24 * scale) }]}>
            Categories
          </Text>
        </View>
        <View style={styles.errorWrap}>
          <Ionicons name="alert-circle-outline" size={48} color="#F43F5E" style={styles.errorIcon} />
          <Text style={styles.errorText}>
            Failed to load categories. Check your connection and try again.
          </Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            {({ pressed }) => (
              <Text style={[styles.retryText, { opacity: pressed ? 0.9 : 1 }]}>
                Try again
              </Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontSize: Math.round(24 * scale) }]}>
          Categories
        </Text>
      </View>

      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ marginBottom: 16, justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && categories.length > 0}
            onRefresh={refetch}
            colors={['#F43F5E']}
            tintColor="#F43F5E"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="folder-open-outline" size={48} color="#D4D4D4" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>No categories yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
