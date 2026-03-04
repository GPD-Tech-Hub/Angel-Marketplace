import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '@/hooks';
import { FormButton, OTPInput } from '@/components/ui';
import { authService } from '@/services';
import { colors } from '@/constants/colors';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { horizontalPadding } = useResponsive();
  const insets = useSafeAreaInsets();

  const email = params.email ?? '';

  const handleVerify = async () => {
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    if (!email) {
      setError('No email address found. Please go back and try again.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      // Verify the code with the backend — receive a short-lived resetToken
      const { resetToken } = await authService.verifyResetCode(email, code);
      // Pass the resetToken (not the 6-digit code) to the reset-password screen
      router.push({ pathname: '/(auth)/reset-password', params: { token: resetToken } } as any);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Invalid or expired code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      Alert.alert('Error', 'No email address found. Please go back and try again.');
      return;
    }
    setError(null);
    setCode('');
    setIsResending(true);
    try {
      await authService.forgotPassword(email);
      Alert.alert('Code Sent', `A new 6-digit code has been sent to ${email}.`);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
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
            showsVerticalScrollIndicator={false}
          >
            {/* Back */}
            <Pressable
              className="w-10 h-10 items-center justify-center mt-4 mb-2"
              onPress={() => router.back()}
            >
              {({ pressed }) => (
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={colors.gray[700]}
                  style={{ opacity: pressed ? 0.7 : 1 }}
                />
              )}
            </Pressable>

            {/* Header */}
            <View className="mb-8 items-center">
              <Text className="text-3xl font-bold text-black mb-3 text-center">
                Enter 6-digit code
              </Text>
              <Text className="text-base text-gray-500 text-center leading-6 px-4">
                {email
                  ? `We sent a reset code to ${email}.`
                  : 'Enter the code from your email.'}
              </Text>
            </View>

            {/* Error */}
            {error ? (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6">
                <Text className="text-red-600 text-sm text-center">{error}</Text>
              </View>
            ) : null}

            {/* OTP input — 6 digits */}
            <View className="mb-6">
              <OTPInput
                length={6}
                value={code}
                onChange={setCode}
                onComplete={handleVerify}
                error={!!error}
              />
            </View>

            {/* Resend */}
            <View className="flex-row justify-center items-center mb-4">
              <Text className="text-gray-500 text-base">Code not received? </Text>
              <Pressable onPress={handleResend} disabled={isResending} hitSlop={8}>
                {({ pressed }) => (
                  <Text
                    style={{ color: colors.brand, opacity: pressed || isResending ? 0.6 : 1 }}
                    className="text-base font-medium"
                  >
                    {isResending ? 'Sending…' : 'Resend code'}
                  </Text>
                )}
              </Pressable>
            </View>
          </ScrollView>

          {/* Sticky button */}
          <View
            className="bg-white"
            style={{
              paddingHorizontal: horizontalPadding,
              paddingTop: 12,
              paddingBottom: insets.bottom + 28,
            }}
          >
            <FormButton
              title={isLoading ? 'Verifying…' : 'Verify Code'}
              onPress={handleVerify}
              loading={isLoading}
              disabled={code.length !== 6 || isLoading}
              variant="primary"
              backgroundColor={code.length === 6 ? colors.brand : colors.gray[100]}
              textColor={code.length === 6 ? '#FFFFFF' : colors.gray[500]}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
