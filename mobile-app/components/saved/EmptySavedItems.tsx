import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { emptySavedItemsStyles as styles } from '@/styles/emptySavedItems';

export function EmptySavedItems() {
  const { width } = useWindowDimensions();
  
  // Responsive scaling
  const scale = Math.max(0.9, Math.min(1.1, width / 390));
  
  const responsiveStyles = {
    icon: {
      width: Math.round(80 * scale),
      height: Math.round(80 * scale),
      marginBottom: Math.round(10 * scale),
    },
    title: {
      fontSize: Math.round(20 * scale),
      lineHeight: Math.round(28 * scale),
      marginBottom: Math.round(12 * scale),
    },
    message: {
      fontSize: Math.round(15 * scale),
      lineHeight: Math.round(22 * scale),
    },
    textContainer: {
      width: width * 0.75,
      maxWidth: 280,
      paddingHorizontal: 16,
    },
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/icons/Heart-duotone.png')}
        style={[styles.icon, responsiveStyles.icon]}
        contentFit="contain"
      />
      <View style={[styles.textContainer, responsiveStyles.textContainer]}>
        <Text style={[styles.title, responsiveStyles.title]}>
          No Saved Items!
        </Text>
        <Text style={[styles.message, responsiveStyles.message]}>
          You don't have any saved items.{'\n'}Go to home and add some.
        </Text>
      </View>
    </View>
  );
}

export default EmptySavedItems;
