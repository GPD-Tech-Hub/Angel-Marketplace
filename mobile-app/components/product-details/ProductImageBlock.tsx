import React, { useState, useCallback } from 'react';
import {
  View,
  ImageSourcePropType,
  FlatList,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Image } from 'expo-image';
import { productDetailsStyles as styles } from '@/styles/productDetailsScreen';

interface ProductImageBlockProps {
  /** Single image or array for gallery (carousel) */
  sources: ImageSourcePropType | ImageSourcePropType[];
}

export function ProductImageBlock({ sources }: ProductImageBlockProps) {
  const { width } = useWindowDimensions();
  const images = Array.isArray(sources) ? sources : [sources];
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offset = e.nativeEvent.contentOffset.x;
      const index = Math.round(offset / width);
      setActiveIndex(Math.min(index, images.length - 1));
    },
    [width, images.length]
  );

  const galleryHeight = width;

  const renderSlide = useCallback(
    ({ item }: { item: ImageSourcePropType }) => (
      <View style={[styles.imageSlide, { width, height: galleryHeight }]}>
        <Image source={item} style={styles.productImage} contentFit="contain" cachePolicy="memory-disk" />
      </View>
    ),
    [width, galleryHeight]
  );

  return (
    <View style={styles.imageContainer}>
      <View style={[styles.imageGalleryWrapper, { height: galleryHeight }]}>
        <FlatList
          data={images}
          renderItem={renderSlide}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          bounces={false}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
        />
      </View>
      {images.length > 1 && (
        <View style={styles.paginationDots}>
          {images.map((_, i) => (
            <View
              key={i}
              style={[
                i === activeIndex ? styles.paginationDotActive : styles.paginationDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}
