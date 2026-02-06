import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { productDetailsStyles as styles } from '@/styles/productDetailsScreen';

const scale = 1;

interface ProductInfoBlockProps {
  category: string;
  name: string;
  rating: number;
  reviews: number;
  description: string;
}

export function ProductInfoBlock({
  category,
  name,
  rating,
  reviews,
  description,
}: ProductInfoBlockProps) {
  return (
    <>
      <Text style={[styles.categoryText, { fontSize: Math.round(13 * scale) }]}>
        {category}
      </Text>
      <Text style={[styles.productName, { fontSize: Math.round(18 * scale) }]}>
        {name}
      </Text>
      <View style={styles.ratingRow}>
        <View style={styles.ratingLeft}>
          <Ionicons name="star" size={Math.round(14 * scale)} color="#FBBF24" />
          <Text style={[styles.ratingText, { fontSize: Math.round(13 * scale) }]}>
            {rating}/5 ({reviews} reviews)
          </Text>
        </View>
        <Ionicons
          name="arrow-forward"
          size={Math.round(14 * scale)}
          color="#6B7280"
          style={{ transform: [{ rotate: '-45deg' }] }}
        />
      </View>
      <Text
        style={[
          styles.description,
          {
            fontSize: Math.round(13 * scale),
            lineHeight: Math.round(20 * scale),
          },
        ]}
        numberOfLines={3}
      >
        {description}
      </Text>
    </>
  );
}
