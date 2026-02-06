import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useFavoritesStore } from '@/store';
import { Product } from '@/types';
import {
  ProductDetailsHeader,
  ProductImageBlock,
  ProductInfoBlock,
  SizeColorSelectors,
  ProductDetailsBottomBar,
} from '@/components/product-details';
import { productDetailsStyles as styles } from '@/styles/productDetailsScreen';

const PRODUCT_IMAGE_MAP: Record<string, any> = {
  t1: require('../assets/image/image 2.jpg'),
  t2: require('../assets/image/image 1.jpg'),
  t3: require('../assets/image/image 2.jpg'),
  t4: require('../assets/image/image 1.jpg'),
};

const SIZES = ['S', 'M', 'L'];
const COLORS = [
  { id: 'blue', value: '#3B82F6' },
  { id: 'yellow', value: '#FBBF24' },
  { id: 'red', value: '#EF4444' },
];

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams<{ productId?: string }>();
  const productId = params.productId || 't1';
  const productIsFavorite = useFavoritesStore((state) => state.isFavorite(productId));

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('blue');

  const mainImage =
    PRODUCT_IMAGE_MAP[productId] || require('../assets/image/image 2.jpg');
  const productImages = [
    mainImage,
    require('../assets/image/image 1.jpg'),
  ];
  const product = {
    category: 'Jacket',
    name: 'Rhapsody Bomber Jacket',
    rating: 4.0,
    reviews: 45,
    description:
      'The name says it all, the right size slightly snugs the body leaving enough room for comfort in the sleeves and waist.',
    price: 90,
  };

  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const productForStore: Product = {
    id: productId,
    name: product.name,
    slug: productId.toLowerCase().replace(/\s+/g, '-'),
    description: product.description,
    price: product.price,
    images: [],
    stock: 0,
    categoryId: '',
    createdAt: new Date().toISOString(),
  };

  const handleFavoritePress = () => {
    toggleFavorite(productForStore);
  };

  const handleAddToCart = () => {
    console.log('Add to cart:', { productId, size: selectedSize, color: selectedColor });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProductDetailsHeader
        isFavorite={productIsFavorite}
        onFavoritePress={handleFavoritePress}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProductImageBlock sources={productImages} />

        <View style={styles.productInfo}>
          <ProductInfoBlock
            category={product.category}
            name={product.name}
            rating={product.rating}
            reviews={product.reviews}
            description={product.description}
          />
          <SizeColorSelectors
            sizes={SIZES}
            colors={COLORS}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
            onSizeSelect={setSelectedSize}
            onColorSelect={setSelectedColor}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <ProductDetailsBottomBar price={product.price} onAddToCart={handleAddToCart} />
    </SafeAreaView>
  );
}
