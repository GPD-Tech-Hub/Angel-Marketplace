import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { noResultsFoundStyles as styles } from '@/styles/noResultsFound';

type Props = {
  searchQuery?: string;
};

export function NoResultsFound({ searchQuery }: Props) {
  const { width } = useWindowDimensions();
  
  // Responsive scaling
  const scale = Math.max(0.9, Math.min(1.1, width / 390));
  
  const responsiveStyles = {
    icon: {
      width: Math.round(80 * scale),
      height: Math.round(80 * scale),
      marginBottom: Math.round(24 * scale),
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
        source={require('../../assets/icons/Search-duotone.png')}
        style={[styles.icon, responsiveStyles.icon]}
        contentFit="contain"
        tintColor="#F43F5E"
      />
      <View style={[styles.textContainer, responsiveStyles.textContainer]}>
        <Text style={[styles.title, responsiveStyles.title]}>
          No Results Found!
        </Text>
        <Text style={[styles.message, responsiveStyles.message]}>
          Try a similar word or something more general.
        </Text>
      </View>
    </View>
  );
}

export default NoResultsFound;
