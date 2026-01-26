import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { couponCodeInputStyles as styles } from '@/styles/couponCodeInput';

type Props = {
  onAdd?: (code: string) => void;
};

export function CouponCodeInput({ onAdd }: Props) {
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  const [code, setCode] = useState('');

  const handleAdd = () => {
    if (code.trim()) {
      onAdd?.(code.trim());
      setCode('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Image
          source={require('../../assets/icons/tag.png')}
          style={[styles.icon, { width: Math.round(20 * scale), height: Math.round(20 * scale) }]}
          contentFit="contain"
        />
        <TextInput
          style={[styles.input, { fontSize: Math.round(14 * scale) }]}
          placeholder="Enter Coupon Code"
          placeholderTextColor="#9CA3AF"
          value={code}
          onChangeText={setCode}
        />
      </View>
      <Pressable style={styles.addButton} onPress={handleAdd}>
        {({ pressed }) => (
          <Text
            style={[
              styles.addButtonText,
              { fontSize: Math.round(14 * scale), opacity: pressed ? 0.7 : 1 },
            ]}
          >
            Add
          </Text>
        )}
      </Pressable>
    </View>
  );
}

export default CouponCodeInput;
