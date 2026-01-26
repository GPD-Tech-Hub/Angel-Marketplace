import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { newCardScreenStyles as styles } from '@/styles/newCardScreen';

export default function NewCardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [securityCode, setSecurityCode] = useState<string>('');

  // Format card number with spaces (e.g., 1234 5678 9012 3456)
  const handleCardNumberChange = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  // Format expiry date as MM/YY
  const handleExpiryDateChange = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    
    setExpiryDate(formatted);
  };

  // Only allow digits for security code
  const handleSecurityCodeChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 3);
    setSecurityCode(cleaned);
  };

  // Button is enabled when all fields are filled
  const isFormValid =
    cardNumber.replace(/\s/g, '').length >= 16 &&
    expiryDate.length === 5 &&
    securityCode.length >= 3;

  const handleAddCard = () => {
    if (!isFormValid) return;

    // TODO: Save card and navigate back
    console.log('Add card:', { cardNumber, expiryDate, securityCode });
    router.back();
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
          New Card
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section Title */}
        <Text style={[styles.sectionTitle, { fontSize: Math.round(18 * scale) }]}>
          Add Debit or Credit Card
        </Text>

        {/* Card Number Field */}
        <View style={styles.fieldContainer}>
          <Text style={[styles.fieldLabel, { fontSize: Math.round(14 * scale) }]}>
            Card number
          </Text>
          <TextInput
            style={[styles.textInput, { fontSize: Math.round(14 * scale) }]}
            placeholder="Enter your card number"
            placeholderTextColor="#9CA3AF"
            value={cardNumber}
            onChangeText={handleCardNumberChange}
            keyboardType="number-pad"
            maxLength={19} // 16 digits + 3 spaces
          />
        </View>

        {/* Expiry Date and Security Code Row */}
        <View style={styles.rowContainer}>
          {/* Expiry Date Field */}
          <View style={[styles.fieldContainer, styles.halfWidth]}>
            <Text style={[styles.fieldLabel, { fontSize: Math.round(14 * scale) }]}>
              Expiry Date
            </Text>
            <TextInput
              style={[styles.textInput, { fontSize: Math.round(14 * scale) }]}
              placeholder="MM/YY"
              placeholderTextColor="#9CA3AF"
              value={expiryDate}
              onChangeText={handleExpiryDateChange}
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>

          {/* Security Code Field */}
          <View style={[styles.fieldContainer, styles.halfWidth]}>
            <Text style={[styles.fieldLabel, { fontSize: Math.round(14 * scale) }]}>
              Security Code
            </Text>
            <View style={styles.securityCodeContainer}>
              <TextInput
                style={[styles.textInput, styles.securityCodeInput, { fontSize: Math.round(14 * scale) }]}
                placeholder="CVC"
                placeholderTextColor="#9CA3AF"
                value={securityCode}
                onChangeText={handleSecurityCodeChange}
                keyboardType="number-pad"
                maxLength={3}
              />
              <Pressable
                style={styles.helpButton}
                hitSlop={10}
                onPress={() => {
                  // TODO: Show help/info about CVC
                  console.log('Show CVC help');
                }}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={Math.round(20 * scale)}
                  color="#6B7280"
                />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Bottom spacing for button */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Card Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={styles.addCardButton}
          onPress={handleAddCard}
          disabled={!isFormValid}
        >
          {({ pressed }) => (
            <View
              style={[
                styles.addCardButtonInner,
                isFormValid ? styles.addCardButtonEnabled : styles.addCardButtonDisabled,
                { opacity: pressed && isFormValid ? 0.9 : 1 },
              ]}
            >
              <Text
                style={[
                  styles.addCardButtonText,
                  {
                    fontSize: Math.round(16 * scale),
                    color: isFormValid ? '#FFFFFF' : '#6B7280',
                  },
                ]}
              >
                Add Card
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
