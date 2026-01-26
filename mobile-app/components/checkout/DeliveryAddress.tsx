import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { deliveryAddressStyles as styles } from '@/styles/deliveryAddress';

type Props = {
  addressLabel?: string;
  address: string;
  onChangePress?: () => void;
};

export function DeliveryAddress({
  addressLabel = 'Home',
  address,
  onChangePress,
}: Props) {
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { fontSize: Math.round(16 * scale) }]}>
          Delivery Address
        </Text>
        <Pressable onPress={onChangePress} hitSlop={10}>
          {({ pressed }) => (
            <Text
              style={[
                styles.changeButton,
                { fontSize: Math.round(14 * scale), opacity: pressed ? 0.7 : 1 },
              ]}
            >
              Change
            </Text>
          )}
        </Pressable>
      </View>

      {/* Address Details */}
      <View style={styles.addressContainer}>
        <Image
          source={require('../../assets/icons/map-pin.png')}
          style={[styles.icon, { width: Math.round(20 * scale), height: Math.round(20 * scale) }]}
          contentFit="contain"
        />
        <View style={styles.addressTextContainer}>
          <Text style={[styles.addressLabel, { fontSize: Math.round(16 * scale) }]}>
            {addressLabel}
          </Text>
          <Text style={[styles.addressText, { fontSize: Math.round(14 * scale) }]}>
            {address}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default DeliveryAddress;
