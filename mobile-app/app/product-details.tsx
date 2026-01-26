import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritesStore } from '@/store';
import { DiscoverSearchBar } from '@/components/layout/DiscoverSearchBar';

export default function ProductDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ productId?: string }>();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  
  // State for selections
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('blue');
  
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  
  // Mock product data - in real app, fetch by productId
  const productId = params.productId || 't1';
  const productIsFavorite = isFavorite(productId);
  
  // Product image mapping
  const productImageMap: Record<string, any> = {
    t1: require('../assets/image/image 2.jpg'),
    t2: require('../assets/image/image 1.jpg'),
    t3: require('../assets/image/image 2.jpg'),
    t4: require('../assets/image/image 1.jpg'),
  };
  
  const productImage = productImageMap[productId] || require('../assets/image/image 2.jpg');
  
  // Product data
  const product = {
    category: 'Jacket',
    name: 'Rhapsody Bomber Jacket',
    rating: 4.0,
    reviews: 45,
    description: 'The name says it all, the right size slightly snugs the body leaving enough room for comfort in the sleeves and waist.',
    price: 90,
  };
  
  const sizes = ['S', 'M', 'L'];
  const colors = [
    { id: 'blue', value: '#3B82F6' },
    { id: 'yellow', value: '#FBBF24' },
    { id: 'red', value: '#EF4444' },
  ];
  
  const handleFavoritePress = () => {
    console.log('Toggle favorite for product:', productId);
  };
  
  const handleAddToCart = () => {
    console.log('Add to cart:', { productId, size: selectedSize, color: selectedColor });
  };

  // Dynamic sizes
  const sizeButtonSize = Math.round(50 * scale);
  const colorSwatchSize = Math.round(50 * scale);
  
  return (
    <SafeAreaView style={localStyles.container} edges={['top']}>
      {/* Header */}
      <View style={localStyles.header}>
        <Pressable
          style={localStyles.backButton}
          onPress={() => router.back()}
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </Pressable>
        <Text style={[localStyles.headerTitle, { fontSize: Math.round(24 * scale) }]}>Details</Text>
        <View style={localStyles.headerSpacer} />
      </View>
      
      {/* Search Bar */}
      <View style={localStyles.searchBarContainer}>
        <DiscoverSearchBar onFilterPress={() => {}} />
      </View>
      
      {/* Scrollable Content */}
      <ScrollView
        style={localStyles.scrollView}
        contentContainerStyle={localStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Image */}
        <View style={localStyles.imageContainer}>
          <View style={localStyles.imageWrapper}>
            <Image
              source={productImage}
              style={localStyles.productImage}
              contentFit="contain"
            />
            <Pressable
              style={localStyles.favoriteButton}
              onPress={handleFavoritePress}
              hitSlop={10}
            >
              <View style={localStyles.favoriteButtonInner}>
                <Image
                  source={
                    productIsFavorite
                      ? require('../assets/icons/Heart-duotone.png')
                      : require('../assets/icons/favorite.png')
                  }
                  style={localStyles.favoriteIcon}
                  contentFit="contain"
                />
              </View>
            </Pressable>
          </View>
        </View>
        
        {/* Product Info */}
        <View style={localStyles.productInfo}>
          {/* Category */}
          <Text style={[localStyles.categoryText, { fontSize: Math.round(14 * scale) }]}>
            {product.category}
          </Text>
          
          {/* Product Name */}
          <Text style={[localStyles.productName, { fontSize: Math.round(20 * scale) }]}>
            {product.name}
          </Text>
          
          {/* Rating Row */}
          <View style={localStyles.ratingRow}>
            <View style={localStyles.ratingLeft}>
              <Ionicons name="star" size={Math.round(16 * scale)} color="#FBBF24" />
              <Text style={[localStyles.ratingText, { fontSize: Math.round(14 * scale) }]}>
                {product.rating}/5 ({product.reviews} reviews)
              </Text>
            </View>
            <Ionicons
              name="arrow-forward"
              size={Math.round(16 * scale)}
              color="#6B7280"
              style={{ transform: [{ rotate: '-45deg' }] }}
            />
          </View>
          
          {/* Description */}
          <Text style={[localStyles.description, { fontSize: Math.round(14 * scale), lineHeight: Math.round(22 * scale) }]}>
            {product.description}
          </Text>
          
          {/* Size Selection */}
          <Text style={[localStyles.sectionTitle, { fontSize: Math.round(16 * scale) }]}>
            Choose Size
          </Text>
          <View style={localStyles.optionsRow}>
            {sizes.map((size, index) => {
              const isSelected = size === selectedSize;
              return (
                <Pressable
                  key={size}
                  onPress={() => setSelectedSize(size)}
                >
                  <View
                    style={{
                      width: sizeButtonSize,
                      height: sizeButtonSize,
                      borderRadius: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#FFFFFF',
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? '#F43F5E' : '#E5E7EB',
                      marginRight: index < sizes.length - 1 ? 12 : 0,
                    }}
                  >
                    <Text style={[localStyles.sizeText, { fontSize: Math.round(16 * scale) }]}>
                      {size}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          
          {/* Color Selection */}
          <Text style={[localStyles.sectionTitle, { fontSize: Math.round(16 * scale), marginTop: 20 }]}>
            Choose Color
          </Text>
          <View style={localStyles.optionsRow}>
            {colors.map((color, index) => {
              const isSelected = color.id === selectedColor;
              return (
                <Pressable
                  key={color.id}
                  onPress={() => setSelectedColor(color.id)}
                >
                  <View
                    style={{
                      width: colorSwatchSize,
                      height: colorSwatchSize,
                      borderRadius: 8,
                      backgroundColor: color.value,
                      borderWidth: isSelected ? 2 : 1,
                      borderColor: isSelected ? '#F43F5E' : '#E5E7EB',
                      marginRight: index < colors.length - 1 ? 12 : 0,
                    }}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
        
        {/* Bottom spacing for fixed bar */}
        <View style={{ height: 120 }} />
      </ScrollView>
      
      {/* Fixed Bottom Bar */}
      <View style={[localStyles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={localStyles.priceSection}>
          <Text style={localStyles.priceLabel}>Price</Text>
          <Text style={[localStyles.priceValue, { fontSize: Math.round(24 * scale) }]}>
            ${product.price}
          </Text>
        </View>
        <Pressable style={localStyles.addToCartButton} onPress={handleAddToCart}>
          <View style={localStyles.addToCartInner}>
            <Ionicons name="cart-outline" size={Math.round(20 * scale)} color="#FFFFFF" />
            <Text style={localStyles.addToCartText}>Add to Cart</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// Local styles to avoid external style import conflicts
const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '600',
    color: '#171717',
  },
  headerSpacer: {
    width: 40,
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 12,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
  },
  favoriteButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteIcon: {
    width: 20,
    height: 20,
  },
  productInfo: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  categoryText: {
    color: '#6B7280',
    fontWeight: '400',
    marginBottom: 4,
  },
  productName: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ratingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#111827',
    fontWeight: '400',
    marginLeft: 6,
  },
  description: {
    color: '#6B7280',
    fontWeight: '400',
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sizeText: {
    fontWeight: '500',
    color: '#111827',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
    marginBottom: 2,
  },
  priceValue: {
    fontWeight: '700',
    color: '#111827',
  },
  addToCartButton: {
    flex: 1,
    marginLeft: 16,
  },
  addToCartInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F43F5E',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
