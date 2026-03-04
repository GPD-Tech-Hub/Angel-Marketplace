import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PaymentCard, AddNewCardButton } from '@/components/payment';
import { paymentMethodScreenStyles as baseStyles } from '@/styles/paymentMethodScreen';
import { colors } from '@/constants/colors';
import {
  usePaymentMethods,
  useDeletePaymentMethod,
  useSetDefaultPaymentMethod,
  SavedPaymentMethod,
} from '@/queries';

function resolvedBrand(method: SavedPaymentMethod): 'visa' | 'mastercard' {
  const b = (method.brand ?? '').toLowerCase();
  if (b === 'mastercard' || b === 'mc') return 'mastercard';
  return 'visa';
}

function maskedNumber(method: SavedPaymentMethod): string {
  if (method.last4) return `**** **** **** ${method.last4}`;
  if (method.cardNumber) return method.cardNumber;
  return '**** **** **** ****';
}

export default function PaymentMethodScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const { data: paymentMethods = [], isLoading } = usePaymentMethods();
  const deleteMutation = useDeletePaymentMethod();
  const setDefaultMutation = useSetDefaultPaymentMethod();

  const defaultCard = paymentMethods.find((c) => c.isDefault) ?? paymentMethods[0] ?? null;
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Resolve selected id: prefer user-chosen, fall back to default
  const effectiveSelectedId = selectedCardId ?? defaultCard?.id ?? null;

  const handleApply = () => {
    router.back();
  };

  const handleAddNewCard = () => {
    router.push('/new-card');
  };

  const handleLongPress = (method: SavedPaymentMethod) => {
    const actions: { text: string; onPress?: () => void; style?: 'cancel' | 'destructive' }[] = [
      { text: 'Cancel', style: 'cancel' },
    ];
    if (!method.isDefault) {
      actions.push({
        text: 'Set as Default',
        onPress: () => setDefaultMutation.mutate(method.id),
      });
    }
    actions.push({
      text: 'Delete',
      style: 'destructive',
      onPress: () =>
        Alert.alert('Delete Card', 'Remove this card from your account?', [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteMutation.mutate(method.id),
          },
        ]),
    });
    Alert.alert(maskedNumber(method), undefined, actions);
  };

  return (
    <SafeAreaView style={baseStyles.container} edges={['top']}>
      {/* Header */}
      <View style={baseStyles.header}>
        <Pressable style={baseStyles.backButton} onPress={() => router.back()} hitSlop={10}>
          {({ pressed }) => (
            <Ionicons
              name="chevron-back"
              size={24}
              color={colors.gray[900]}
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          )}
        </Pressable>
        <Text style={[baseStyles.headerTitle, { fontSize: Math.round(20 * scale) }]}>
          Payment Method
        </Text>
        <View style={baseStyles.headerSpacer} />
      </View>

      <ScrollView
        style={baseStyles.scrollView}
        contentContainerStyle={baseStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[baseStyles.sectionTitle, { fontSize: Math.round(18 * scale) }]}>
          Saved Cards
        </Text>

        {isLoading ? (
          <ActivityIndicator size="small" color={colors.brand} style={{ marginTop: 24 }} />
        ) : paymentMethods.length === 0 ? (
          <Text style={styles.emptyText}>No saved cards yet.</Text>
        ) : (
          paymentMethods.map((method) => (
            <Pressable
              key={method.id}
              onPress={() => setSelectedCardId(method.id)}
              onLongPress={() => handleLongPress(method)}
              delayLongPress={400}
            >
              <PaymentCard
                brand={resolvedBrand(method)}
                cardNumber={maskedNumber(method)}
                isDefault={method.isDefault}
                isSelected={method.id === effectiveSelectedId}
                onPress={() => setSelectedCardId(method.id)}
              />
            </Pressable>
          ))
        )}

        {(deleteMutation.isPending || setDefaultMutation.isPending) && (
          <ActivityIndicator size="small" color={colors.brand} style={{ marginTop: 8 }} />
        )}

        <AddNewCardButton onPress={handleAddNewCard} />

        {/* Hint */}
        {paymentMethods.length > 0 && (
          <Text style={styles.hint}>Long-press a card to set as default or delete.</Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Apply Button */}
      <View style={[baseStyles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable style={baseStyles.applyButton} onPress={handleApply}>
          {({ pressed }) => (
            <View style={[baseStyles.applyButtonInner, { opacity: pressed ? 0.9 : 1 }]}>
              <Text style={[baseStyles.applyButtonText, { fontSize: Math.round(16 * scale) }]}>
                Apply
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 32,
  },
  hint: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
