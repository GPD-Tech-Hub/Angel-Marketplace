import React from 'react';
import { View, Text, Pressable, StyleProp, ViewStyle, useWindowDimensions } from 'react-native';
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
  const { width } = useWindowDimensions();
  // Scale down on small devices, slight scale up on large ones
  const scale = Math.max(0.85, Math.min(1.0, width / 390));

  const dynamic = {
    title: { fontSize: Math.round(18 * scale) },
    viewAllText: { fontSize: Math.round(13 * scale) },
    viewAllIcon: { size: Math.round(16 * scale) },
    itemWidth: { width: Math.round(70 * scale) },
    circle: {
      width: Math.round(56 * scale),
      height: Math.round(56 * scale),
      borderRadius: Math.round(28 * scale),
      marginBottom: Math.round(8 * scale),
    },
    icon: { width: Math.round(32 * scale), height: Math.round(32 * scale) },
    label: { fontSize: Math.round(14 * scale) },
  } as const;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, dynamic.title]}>Categories</Text>
        <Pressable onPress={onViewAllPress} hitSlop={10}>
          {({ pressed }) => (
            <View style={[styles.viewAllWrap, { opacity: pressed ? 0.7 : 1 }]}>
              <Text style={[styles.viewAllText, dynamic.viewAllText]}>View all</Text>
              <Ionicons
                name="arrow-forward"
                size={dynamic.viewAllIcon.size}
                color="#737373"
              />
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.itemsRow}>
        {items.slice(0, 4).map((item) => (
          <Pressable
            key={item.id}
            style={[styles.item, dynamic.itemWidth]}
            onPress={() => onCategoryPress?.(item)}
            hitSlop={8}
          >
            {({ pressed }) => (
              <>
                <View style={[styles.iconCircle, dynamic.circle, { opacity: pressed ? 0.9 : 1 }]}>
                  <Image source={item.image} style={[styles.iconImage, dynamic.icon]} contentFit="contain" />
                </View>
                <Text style={[styles.itemLabel, dynamic.label]}>{item.label}</Text>
              </>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default CategoriesRow;

