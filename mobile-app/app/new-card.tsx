import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { newCardScreenStyles as styles } from '@/styles/newCardScreen';
import { colors } from '@/constants/colors';
import { useAddPaymentMethod } from '@/queries';

/** Detect card brand from first digits */
function detectBrand(digits: string): string {
  if (/^4/.test(digits)) return 'visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  return 'card';
}

export default function NewCardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const addCardMutation = useAddPaymentMethod();

  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [securityCode, setSecurityCode] = useState<string>('');

  const handleCardNumberChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') ?? cleaned;
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    const formatted = cleaned.length >= 2
      ? cleaned.slice(0, 2) + '/' + cleaned.slice(2)
      : cleaned;
    setExpiryDate(formatted);
  };

  const handleSecurityCodeChange = (text: string) => {
    setSecurityCode(text.replace(/\D/g, '').slice(0, 4));
  };

  const digits = cardNumber.replace(/\s/g, '');
  const isFormValid =
    digits.length >= 13 &&
    expiryDate.length === 5 &&
    securityCode.length >= 3;

  const handleAddCard = async () => {
    if (!isFormValid) return;

    const [monthStr, yearStr] = expiryDate.split('/');
    const expiryMonth = parseInt(monthStr, 10);
    const expiryYear = 2000 + parseInt(yearStr, 10);

    if (
      isNaN(expiryMonth) || expiryMonth < 1 || expiryMonth > 12 ||
      isNaN(expiryYear)
    ) {
      Alert.alert('Invalid Date', 'Please enter a valid expiry date (MM/YY).');
      return;
    }

    const brand = detectBrand(digits);
    const last4 = digits.slice(-4);

    try {
      await addCardMutation.mutateAsync({
        type: 'card',
        brand,
        last4,
        expiryMonth,
        expiryYear,
      });
      router.back();
    } catch (error: any) {
      Alert.alert(
        'Failed to Add Card',
        error.response?.data?.message ?? 'Could not save card. Please try again.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
          {({ pressed }) => (
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.gray[900]}
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          )}
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize: Math.round(20 * scale) }]}>
          New Card
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.sectionTitle, { fontSize: Math.round(18 * scale) }]}>
          Add Debit or Credit Card
        </Text>

        {/* Card Number */}
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
            maxLength={19}
          />
        </View>

        {/* Expiry + CVV */}
        <View style={styles.rowContainer}>
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
                maxLength={4}
                secureTextEntry
              />
              <Pressable style={styles.helpButton} hitSlop={10}>
                <Ionicons name="help-circle-outline" size={Math.round(20 * scale)} color="#6B7280" />
              </Pressable>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Card Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={styles.addCardButton}
          onPress={handleAddCard}
          disabled={!isFormValid || addCardMutation.isPending}
        >
          {({ pressed }) => (
            <View
              style={[
                styles.addCardButtonInner,
                isFormValid && !addCardMutation.isPending
                  ? styles.addCardButtonEnabled
                  : styles.addCardButtonDisabled,
                { opacity: pressed && isFormValid ? 0.9 : 1 },
              ]}
            >
              {addCardMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
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
              )}
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
