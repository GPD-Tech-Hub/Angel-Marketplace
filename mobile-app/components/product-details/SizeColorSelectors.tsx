import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { productDetailsStyles as styles } from '@/styles/productDetailsScreen';

const scale = 1;
const sizeButtonSize = Math.round(44 * scale);
const colorSwatchSize = Math.round(44 * scale);

interface SizeColorSelectorsProps {
  sizes: string[];
  colors: { id: string; value: string }[];
  selectedSize: string;
  selectedColor: string;
  onSizeSelect: (size: string) => void;
  onColorSelect: (colorId: string) => void;
}

export function SizeColorSelectors({
  sizes,
  colors,
  selectedSize,
  selectedColor,
  onSizeSelect,
  onColorSelect,
}: SizeColorSelectorsProps) {
  return (
    <>
      <Text style={[styles.sectionTitle, { fontSize: Math.round(15 * scale) }]}>
        Choose Size
      </Text>
      <View style={[styles.optionsRow, { marginBottom: 4 }]}>
        {sizes.map((size, index) => {
          const isSelected = size === selectedSize;
          return (
            <Pressable key={size} onPress={() => onSizeSelect(size)}>
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
                  marginRight: index < sizes.length - 1 ? 10 : 0,
                }}
              >
                <Text style={[styles.sizeText, { fontSize: Math.round(14 * scale) }]}>
                  {size}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <Text
        style={[
          styles.sectionTitle,
          { fontSize: Math.round(15 * scale), marginTop: 14 },
        ]}
      >
        Choose Color
      </Text>
      <View style={styles.optionsRow}>
        {colors.map((color, index) => {
          const isSelected = color.id === selectedColor;
          return (
            <Pressable key={color.id} onPress={() => onColorSelect(color.id)}>
              <View
                style={{
                  width: colorSwatchSize,
                  height: colorSwatchSize,
                  borderRadius: 8,
                  backgroundColor: color.value,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? '#F43F5E' : '#E5E7EB',
                  marginRight: index < colors.length - 1 ? 10 : 0,
                }}
              />
            </Pressable>
          );
        })}
      </View>
    </>
  );
}
