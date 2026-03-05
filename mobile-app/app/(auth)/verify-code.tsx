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
      subtitle={email ? `We sent a reset code to ${email}.` : 'Enter the code from your email to continue.'}
      helper="This code unlocks the final password reset step."
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
      <View className="mb-6 items-center rounded-[26px] border border-[#f7d7e6] bg-[#fff9fc] px-5 py-6">
        <View className="mb-4 rounded-full bg-[#ffe4ef] px-4 py-2">
          <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-[#be185d]">
            Security check
          </Text>
        </View>

        <Text className="text-center text-sm leading-6 text-[#6b4455]">
          Enter the code exactly as it appears in your inbox. It&apos;s valid for a limited time.
        </Text>

        {email ? (
          <View className="mt-4 rounded-full border border-[#f3c4d9] bg-white px-4 py-2">
            <Text className="text-sm font-medium text-[#7c2d56]">{email}</Text>
          </View>
        ) : null}
      </View>

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

      <View className="rounded-2xl bg-[#fff5f8] px-4 py-4">
        <Text className="text-xs font-semibold uppercase tracking-[1.4px] text-[#be185d]">
          Quick tip
        </Text>
        <Text className="mt-2 text-sm leading-5 text-[#6b4455]">
          If the code does not arrive, wait a few seconds before resending so the newest message is the one you use.
        </Text>
      </View>
    </AuthScreenShell>
  );
}
