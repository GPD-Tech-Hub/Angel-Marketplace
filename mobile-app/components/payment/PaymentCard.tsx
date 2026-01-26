import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { paymentCardStyles as styles } from '@/styles/paymentCard';

type Props = {
  brand: 'visa' | 'mastercard';
  cardNumber: string;
  isDefault?: boolean;
  isSelected: boolean;
  onPress: () => void;
};

export function PaymentCard({
  brand,
  cardNumber,
  isDefault = false,
  isSelected,
  onPress,
}: Props) {
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  // Get card brand icon
  const getBrandIcon = () => {
    if (brand === 'visa') {
      return require('../../assets/icons/visa.png');
    }
    return require('../../assets/icons/mastercard.png');
  };

  return (
    <Pressable
      style={[styles.card, { marginBottom: 12 }]}
      onPress={onPress}
    >
      <View style={styles.content}>
        {/* Card Brand Icon/Text */}
        <View style={styles.brandContainer}>
          {brand === 'visa' ? (
            <Image
              source={getBrandIcon()}
              style={[styles.brandIcon, { width: Math.round(40 * scale), height: Math.round(24 * scale) }]}
              contentFit="contain"
            />
          ) : (
            <Image
              source={getBrandIcon()}
              style={[styles.brandIcon, { width: Math.round(32 * scale), height: Math.round(32 * scale) }]}
              contentFit="contain"
            />
          )}
          <Text style={[styles.cardNumber, { fontSize: Math.round(14 * scale) }]}>
            {cardNumber}
          </Text>
          {isDefault && (
            <View style={styles.defaultTag}>
              <Text style={[styles.defaultText, { fontSize: Math.round(12 * scale) }]}>
                Default
              </Text>
            </View>
          )}
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

export default PaymentCard;
