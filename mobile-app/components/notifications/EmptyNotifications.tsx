import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { emptyNotificationsStyles as styles } from '@/styles/emptyNotifications';

export function EmptyNotifications() {
  const { width } = useWindowDimensions();
  
  // Responsive scaling
  const scale = Math.max(0.9, Math.min(1.1, width / 390));
  
  const responsiveStyles = {
    emptyTitle: {
      fontSize: Math.round(22 * scale),
      lineHeight: Math.round(30 * scale),
      marginBottom: Math.round(12 * scale),
    },
    emptySubtitle: {
      fontSize: Math.round(15 * scale),
      lineHeight: Math.round(22 * scale),
    },
    bellContainer: {
      width: Math.round(90 * scale),
      height: Math.round(90 * scale),
      marginBottom: Math.round(0 * scale),
    },
    bellIcon: {
      width: Math.round(80 * scale),
      height: Math.round(80 * scale),
    },
    textContainer: {
      width: width * 0.75,
      maxWidth: 280,
      paddingHorizontal: 16,
    },
  };

  return (
    <View style={styles.container}>
      <View style={[styles.bellContainer, responsiveStyles.bellContainer]}>
        <Image
          source={require('../../assets/icons/Bell-duotone.png')}
          style={[styles.bellIcon, responsiveStyles.bellIcon]}
          contentFit="contain"
        />
      </View>
      <View style={[styles.textContainer, responsiveStyles.textContainer]}>
        <Text style={[styles.emptyTitle, responsiveStyles.emptyTitle]}>
          You haven't gotten any notifications yet!
        </Text>
        <Text style={[styles.emptySubtitle, responsiveStyles.emptySubtitle]}>
          We'll alert you when something cool happens.
        </Text>
      </View>
    </View>
  );
}

export default EmptyNotifications;
