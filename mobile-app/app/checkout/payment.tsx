import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui';
import { useStripeConfig } from '@/queries';

type PaymentMethod = 'stripe' | 'paystack' | 'flutterwave';

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const ALL_PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'stripe',
    name: 'Credit/Debit Card',
    description: 'Pay with Visa, Mastercard, or American Express',
    icon: 'card-outline',
  },
  {
    id: 'paystack',
    name: 'Paystack',
    description: 'Pay with bank transfer or mobile money',
    icon: 'wallet-outline',
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    description: 'Multiple payment options',
    icon: 'cash-outline',
  },
];

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ shippingAddress: string }>();
  const { data: stripeConfig } = useStripeConfig();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const paymentOptions = useMemo(() => {
    return ALL_PAYMENT_OPTIONS.filter(
      (opt) => opt.id !== 'stripe' || stripeConfig?.stripeEnabled
    );
  }, [stripeConfig?.stripeEnabled]);

  const shippingAddress = params.shippingAddress
    ? JSON.parse(params.shippingAddress)
    : null;

  const handleContinue = () => {
    if (selectedMethod) {
      router.push({
        pathname: '/checkout/confirm',
        params: {
          shippingAddress: params.shippingAddress,
          paymentMethod: selectedMethod,
        },
      });
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-lg font-semibold text-gray-900 mb-4">
          Select Payment Method
        </Text>

        <View className="space-y-3">
          {paymentOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              className={`
                bg-white rounded-xl p-4 flex-row items-center border-2
                ${selectedMethod === option.id ? 'border-primary-500' : 'border-transparent'}
              `}
              onPress={() => setSelectedMethod(option.id)}
              activeOpacity={0.7}
            >
              <View
                className={`
                  w-12 h-12 rounded-full items-center justify-center
                  ${selectedMethod === option.id ? 'bg-primary-100' : 'bg-gray-100'}
                `}
              >
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={selectedMethod === option.id ? '#0ea5e9' : '#6b7280'}
                />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-base font-semibold text-gray-900">
                  {option.name}
                </Text>
                <Text className="text-sm text-gray-500">{option.description}</Text>
              </View>
              <View
                className={`
                  w-6 h-6 rounded-full border-2 items-center justify-center
                  ${
                    selectedMethod === option.id
                      ? 'border-primary-500 bg-primary-500'
                      : 'border-gray-300'
                  }
                `}
              >
                {selectedMethod === option.id && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Security Note */}
        <View className="flex-row items-center mt-6 p-4 bg-gray-100 rounded-xl">
          <Ionicons name="shield-checkmark" size={24} color="#22c55e" />
          <Text className="flex-1 ml-3 text-sm text-gray-600">
            Your payment information is encrypted and secure. We never store your
            card details.
          </Text>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View className="px-4 py-4 bg-white border-t border-gray-100">
        <Button
          title="Continue to Review"
          onPress={handleContinue}
          disabled={!selectedMethod}
          fullWidth
          size="lg"
        />
      </View>
    </View>
  );
}
