import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PaymentCard, AddNewCardButton } from '@/components/payment';
import { paymentMethodScreenStyles as styles } from '@/styles/paymentMethodScreen';

// Mock payment cards data
const MOCK_PAYMENT_CARDS = [
  {
    id: '1',
    brand: 'visa' as const,
    cardNumber: '**** **** **** 2512',
    isDefault: true,
  },
  {
    id: '2',
    brand: 'mastercard' as const,
    cardNumber: '**** **** **** 5421',
    isDefault: false,
  },
  {
    id: '3',
    brand: 'visa' as const,
    cardNumber: '**** **** **** 2512',
    isDefault: false,
  },
];

export default function PaymentMethodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  // Find default card or use first one
  const defaultCard = MOCK_PAYMENT_CARDS.find((card) => card.isDefault) || MOCK_PAYMENT_CARDS[0];
  const [selectedCardId, setSelectedCardId] = useState<string>(defaultCard.id);

  const handleApply = () => {
    // TODO: Return selected card to checkout screen
    const selectedCard = MOCK_PAYMENT_CARDS.find((card) => card.id === selectedCardId);
    console.log('Selected payment method:', selectedCard);
    router.back();
  };

  const handleAddNewCard = () => {
    router.push('/new-card');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={10}
        >
          {({ pressed }) => (
            <Ionicons
              name="chevron-back"
              size={24}
              color="#111827"
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          )}
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize: Math.round(20 * scale) }]}>
          Payment Method
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Saved Cards Title */}
        <Text style={[styles.sectionTitle, { fontSize: Math.round(18 * scale) }]}>
          Saved Cards
        </Text>

        {/* Payment Cards */}
        {MOCK_PAYMENT_CARDS.map((card) => (
          <PaymentCard
            key={card.id}
            brand={card.brand}
            cardNumber={card.cardNumber}
            isDefault={card.isDefault}
            isSelected={card.id === selectedCardId}
            onPress={() => setSelectedCardId(card.id)}
          />
        ))}

        {/* Add New Card Button */}
        <AddNewCardButton onPress={handleAddNewCard} />

        {/* Bottom spacing for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Apply Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable style={styles.applyButton} onPress={handleApply}>
          {({ pressed }) => (
            <View style={[styles.applyButtonInner, { opacity: pressed ? 0.9 : 1 }]}>
              <Text style={[styles.applyButtonText, { fontSize: Math.round(16 * scale) }]}>
                Apply
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
