import { colors } from '@/constants/colors';
import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { emptyOrdersStyles as styles } from '@/styles/emptyOrders';

interface EmptyOrdersProps {
  status: 'ongoing' | 'completed';
}

export function EmptyOrders({ status }: EmptyOrdersProps) {
  const { width } = useWindowDimensions();
  const router = useRouter();
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
        tintColor={colors.brand}
      />
      <Text style={[styles.title, { fontSize: Math.round(20 * scale) }]}>
        {title}
      </Text>
      <Text style={[styles.description, { fontSize: Math.round(14 * scale) }]}>
        {description}
      </Text>
      {status === 'ongoing' && (
        <Pressable
          onPress={() => router.push('/(tabs)/shop' as any)}
          style={{ marginTop: 20, backgroundColor: colors.brand, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 14 }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: Math.round(15 * scale) }}>Start Shopping</Text>
        </Pressable>
      )}
    </View>
  );
}
