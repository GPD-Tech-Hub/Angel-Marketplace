import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { addNewCardButtonStyles as styles } from '@/styles/addNewCardButton';

type Props = {
  onPress: () => void;
};

export function AddNewCardButton({ onPress }: Props) {
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  return (
    <Pressable
      style={styles.button}
      onPress={onPress}
    >
      {({ pressed }) => (
        <View style={[styles.buttonInner, { opacity: pressed ? 0.8 : 1 }]}>
          <Ionicons
            name="add"
            size={Math.round(20 * scale)}
            color="#111827"
          />
          <Text style={[styles.buttonText, { fontSize: Math.round(16 * scale), marginLeft: 8 }]}>
            Add New Card
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default AddNewCardButton;
