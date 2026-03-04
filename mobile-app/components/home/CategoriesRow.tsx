import React from 'react';
import { View, Text, Pressable, ScrollView, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { categoriesRowStyles as styles } from '../../styles/categoriesRow';

export type CategoryItem = {
  id: string;
  label: string;
  image: any;
};

type Props = {
  items: CategoryItem[];
  onViewAllPress?: () => void;
  onCategoryPress?: (item: CategoryItem) => void;
  containerStyle?: StyleProp<ViewStyle>;
};

export function CategoriesRow({
  items,
  onViewAllPress,
  onCategoryPress,
  containerStyle,
}: Props) {
  return (
    <View style={[styles.container, containerStyle]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Categories</Text>
        <Pressable onPress={onViewAllPress} hitSlop={10}>
          {({ pressed }) => (
            <View style={[styles.viewAllWrap, { opacity: pressed ? 0.6 : 1 }]}>
              <Text style={styles.viewAllText}>View all</Text>
              <Ionicons name="arrow-forward" size={14} color="#6B7280" />
            </View>
          )}
        </Pressable>
      </View>

      {/* Horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={styles.item}
            onPress={() => onCategoryPress?.(item)}
            hitSlop={6}
          >
            {({ pressed }) => (
              <>
                <View style={[styles.iconCircle, { opacity: pressed ? 0.75 : 1 }]}>
                  <Image
                    source={item.image}
                    style={styles.iconImage}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                  />
                </View>
                <Text style={styles.itemLabel} numberOfLines={2}>
                  {item.label}
                </Text>
              </>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export default CategoriesRow;
