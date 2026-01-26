import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { addressCardStyles as styles } from '@/styles/addressCard';

type Props = {
  label: string;
  address: string;
  isDefault?: boolean;
  isSelected: boolean;
  onPress: () => void;
};

export function AddressCard({
  label,
  address,
  isDefault = false,
  isSelected,
  onPress,
}: Props) {
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  return (
    <Pressable
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        { marginBottom: 12 },
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        {/* Location Icon */}
        <Image
          source={require('../../assets/icons/map-pin.png')}
          style={[styles.icon, { width: Math.round(20 * scale), height: Math.round(20 * scale) }]}
          contentFit="contain"
        />

        {/* Address Info */}
        <View style={styles.addressInfo}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { fontSize: Math.round(16 * scale) }]}>
              {label}
            </Text>
            {isDefault && (
              <View style={styles.defaultTag}>
                <Text style={[styles.defaultText, { fontSize: Math.round(12 * scale) }]}>
                  Default
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[styles.addressText, { fontSize: Math.round(14 * scale) }]}
            numberOfLines={1}
          >
            {address}
          </Text>
        </View>

        {/* Radio Button */}
        <View
          style={[
            styles.radioButton,
            isSelected && styles.radioButtonSelected,
          ]}
        >
          {isSelected && <View style={styles.radioButtonInner} />}
        </View>
      </View>
    </Pressable>
  );
}

export default AddressCard;
