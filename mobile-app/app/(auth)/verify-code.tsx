import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '@/hooks';
import { FormButton, OTPInput } from '@/components/ui';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { horizontalPadding, headingSize } = useResponsive();
  const insets = useSafeAreaInsets();

  // Get email from params or use a default/placeholder
  const email = params.email || 'cody.fisher45@example.com';

  const handleVerify = async () => {
    if (code.length !== 4) {
      setError('Please enter the complete 4-digit code');
      return;
    }

    // No verification yet — just proceed to Reset Password screen.
    router.push('/(auth)/reset-password');
  };

  const handleResend = async () => {
    setError(null);
    setCode('');
    // TODO: Implement resend code logic
    // await resendCode(email);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1">
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: horizontalPadding, paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          >
            {/* Back Button */}
            <Pressable
              className="w-10 h-10 items-center justify-center mt-4 mb-2"
              onPress={() => router.back()}
            >
              {({ pressed }) => (
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color="#374151"
                  style={{ opacity: pressed ? 0.7 : 1 }}
                />
              )}
            </Pressable>

            {/* Header */}
            <View className="mb-8 items-center">
              <Text className={`${headingSize} font-bold text-black mb-3 text-center`}>
                Enter 4 digit code
              </Text>
              <Text className="text-base text-gray-500 text-center leading-6 px-4">
                Enter 4 digit code that your receive on your email ({email}).
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
                <Text className="text-red-600 text-sm text-center">{error}</Text>
              </View>
            )}

            {/* OTP Input */}
            <View className="mb-6">
              <OTPInput
                length={4}
                value={code}
                onChange={setCode}
                onComplete={(value) => {
                  // Auto-submit when all digits are entered (optional)
                  // handleVerify();
                }}
                error={!!error}
              />
            </View>

            {/* Resend Code Link */}
            <View className="flex-row justify-center items-center mb-4">
              <Text className="text-[#737373] text-base">Code not received? </Text>
              <Pressable onPress={handleResend}>
                {({ pressed }) => (
                  <Text className={`text-[#F43F5E] text-base ${pressed ? 'opacity-70' : ''}`}>
                    Resend code
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>

          {/* Bottom sticky button */}
          <View
            className="bg-white"
            style={{
              paddingHorizontal: horizontalPadding,
              paddingTop: 12,
              paddingBottom: insets.bottom + 28,
            }}
          >
            <FormButton
              title={isLoading ? 'Verifying...' : 'Send Code'}
              onPress={handleVerify}
              loading={isLoading}
              disabled={code.length !== 4 || isLoading}
              variant="primary"
              backgroundColor={code.length === 4 ? '#F43F5E' : '#F3F4F6'}
              textColor={code.length === 4 ? '#FFFFFF' : '#000000'}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
