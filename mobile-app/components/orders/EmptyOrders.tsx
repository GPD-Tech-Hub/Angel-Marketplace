import React from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { emptyOrdersStyles as styles } from '@/styles/emptyOrders';

interface EmptyOrdersProps {
  status: 'ongoing' | 'completed';
}

export function EmptyOrders({ status }: EmptyOrdersProps) {
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const title = status === 'ongoing' ? 'No Ongoing Orders!' : 'No Completed Orders!';
  const description =
    status === 'ongoing'
      ? "You don't have any ongoing orders\nat this time."
      : "You don't have any completed orders\nat this time.";

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/icons/Box-duotone.png')}
        style={[
          styles.icon,
          { width: Math.round(120 * scale), height: Math.round(120 * scale) },
        ]}
        contentFit="contain"
        tintColor="#F43F5E"
      />
      <Text style={[styles.title, { fontSize: Math.round(20 * scale) }]}>
        {title}
      </Text>
      <Text style={[styles.description, { fontSize: Math.round(14 * scale) }]}>
        {description}
      </Text>
    </View>
  );
}
