import React, { useState } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FormButton, OTPInput } from '@/components/ui';
import AuthScreenShell from '@/components/auth/AuthScreenShell';
import { authService } from '@/services';
import { colors } from '@/constants/colors';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <AuthScreenShell
      title="Enter 6-digit code"
      subtitle={email ? `Code sent to ${email}.` : 'Enter your code.'}
      showBack
      footer={(
        <>
          <FormButton
            title={isLoading ? 'Verifying…' : 'Verify Code'}
            onPress={handleVerify}
            loading={isLoading}
            disabled={code.length !== 6 || isLoading}
            variant="primary"
            backgroundColor={code.length === 6 ? colors.brand : '#FCE7F3'}
            textColor={code.length === 6 ? '#FFFFFF' : '#9F1239'}
          />

          <View className="mt-4 flex-row justify-center items-center">
            <Text className="text-base text-[#7a6673]">Didn&apos;t get it? </Text>
            <Pressable onPress={handleResend} disabled={isResending} hitSlop={8}>
              {({ pressed }) => (
                <Text
                  style={{ opacity: pressed || isResending ? 0.6 : 1 }}
                  className="text-base font-semibold text-[#F43F5E]"
                >
                  {isResending ? 'Sending…' : 'Resend code'}
                </Text>
              )}
            </Pressable>
          </View>
        </>
      )}
    >
      {error ? (
        <View className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <Text className="text-center text-sm text-red-600">{error}</Text>
        </View>
      ) : null}

      <View className="mb-6 items-center">
        <OTPInput
          length={6}
          value={code}
          onChange={setCode}
          onComplete={handleVerify}
          error={!!error}
        />
      </View>

      {email ? (
        <View className="rounded-2xl border border-[#ece7eb] bg-[#faf7f8] px-4 py-4">
          <Text className="text-sm leading-6 text-[#666666]">
            Checking code for <Text className="font-semibold text-[#171717]">{email}</Text>.
          </Text>
        </View>
      ) : null}
    </AuthScreenShell>
  );
}
