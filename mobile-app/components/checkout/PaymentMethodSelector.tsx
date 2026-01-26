import React, { useState } from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { paymentMethodSelectorStyles as styles } from '@/styles/paymentMethodSelector';

type PaymentMethod = 'card' | 'cash' | 'espees';

type Props = {
  selectedMethod?: PaymentMethod;
  onMethodChange?: (method: PaymentMethod) => void;
  cardNumber?: string;
  onEditCard?: () => void;
};

export function PaymentMethodSelector({
  selectedMethod = 'card',
  onMethodChange,
  cardNumber = '**** **** **** 2512',
  onEditCard,
}: Props) {
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  const [currentMethod, setCurrentMethod] = useState<PaymentMethod>(selectedMethod);

  const handleMethodSelect = (method: PaymentMethod) => {
    setCurrentMethod(method);
    onMethodChange?.(method);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={[styles.title, { fontSize: Math.round(16 * scale) }]}>
        Payment Method
      </Text>

      {/* Method Buttons */}
      <View style={styles.methodButtons}>
        <Pressable
          style={[
            styles.methodButton,
            currentMethod === 'card' && styles.methodButtonSelected,
            { width: Math.round(100 * scale), height: Math.round(40 * scale), marginRight: 12 },
          ]}
          onPress={() => handleMethodSelect('card')}
        >
          <Ionicons
            name="card-outline"
            size={Math.round(20 * scale)}
            color={currentMethod === 'card' ? '#FFFFFF' : '#111827'}
          />
          <Text
            style={[
              styles.methodButtonText,
              {
                fontSize: Math.round(14 * scale),
                color: currentMethod === 'card' ? '#FFFFFF' : '#111827',
                marginLeft: 6,
              },
            ]}
          >
            Card
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.methodButton,
            currentMethod === 'cash' && styles.methodButtonSelected,
            { width: Math.round(100 * scale), height: Math.round(40 * scale), marginRight: 12 },
          ]}
          onPress={() => handleMethodSelect('cash')}
        >
          <Ionicons
            name="cash-outline"
            size={Math.round(20 * scale)}
            color={currentMethod === 'cash' ? '#FFFFFF' : '#111827'}
          />
          <Text
            style={[
              styles.methodButtonText,
              {
                fontSize: Math.round(14 * scale),
                color: currentMethod === 'cash' ? '#FFFFFF' : '#111827',
                marginLeft: 6,
              },
            ]}
          >
            Cash
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.methodButton,
            currentMethod === 'espees' && styles.methodButtonSelected,
            { width: Math.round(100 * scale), height: Math.round(40 * scale) },
          ]}
          onPress={() => handleMethodSelect('espees')}
        >
          <Ionicons
            name="wallet-outline"
            size={Math.round(20 * scale)}
            color={currentMethod === 'espees' ? '#FFFFFF' : '#111827'}
          />
          <Text
            style={[
              styles.methodButtonText,
              {
                fontSize: Math.round(14 * scale),
                color: currentMethod === 'espees' ? '#FFFFFF' : '#111827',
                marginLeft: 6,
              },
            ]}
          >
            Espees
          </Text>
        </Pressable>
      </View>

      {/* Card Details (shown when card is selected) */}
      {currentMethod === 'card' && (
        <View style={styles.cardDetails}>
          <View style={styles.cardInfo}>
            <Image
              source={require('../../assets/icons/visa.png')}
              style={[styles.visaIcon, { width: Math.round(40 * scale), height: Math.round(24 * scale) }]}
              contentFit="contain"
            />
            <Text style={[styles.cardNumber, { fontSize: Math.round(14 * scale) }]}>
              {cardNumber}
            </Text>
          </View>
          <Pressable onPress={onEditCard} hitSlop={10}>
            {({ pressed }) => (
              <Image
                source={require('../../assets/icons/edit.png')}
                style={[
                  { width: Math.round(20 * scale), height: Math.round(20 * scale), opacity: pressed ? 0.7 : 1 },
                ]}
                contentFit="contain"
              />
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}

export default PaymentMethodSelector;
