import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { checkoutButtonStyles as styles } from '@/styles/checkoutButton';

type Props = {
  onPress: () => void;
};

export function CheckoutButton({ onPress }: Props) {
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  return (
    <Pressable style={styles.button} onPress={onPress}>
      {({ pressed }) => (
        <View style={[styles.buttonInner, { opacity: pressed ? 0.9 : 1 }]}>
          <Text style={[styles.buttonText, { fontSize: Math.round(16 * scale) }]}>
            Proceed to Checkout
          </Text>
          <Ionicons
            name="arrow-forward"
            size={Math.round(20 * scale)}
            color="#FFFFFF"
            style={{ marginLeft: 8 }}
          />
        </View>
      )}
    </Pressable>
  );
}

export default CheckoutButton;
