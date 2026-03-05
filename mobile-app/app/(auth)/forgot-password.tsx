import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '@/hooks';
import { FormButton, FormField } from '@/components/ui';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { horizontalPadding } = useResponsive();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(null);
    setIsLoading(true);
    try {
      const { authService } = await import('@/services');
      await authService.forgotPassword(data.email);
      router.push({
        pathname: '/(auth)/verify-code',
        params: { email: data.email },
      });
    } catch (err: any) {
      const message = err?.response?.data?.message ?? err?.message ?? 'Failed to send reset email';
      setError(message);
    } finally {
      setIsLoading(false);
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
            <View className="mb-6">
              <Text className="text-3xl font-bold text-black mb-3">
                Forgot password
              </Text>
              <Text className="text-base text-gray-500 leading-6">
                Enter your email address.
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <Text className="text-red-600 text-sm">{error}</Text>
              </View>
            )}

            {/* Email Field */}
            <FormField
              control={control}
              name="email"
              label="Email Address"
              placeholder="Enter your email address"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              required={true}
              error={(errors as any).email}
            />
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
              title={isLoading ? 'Sending...' : 'Send Code'}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={!isValid || isLoading}
              variant="primary"
              backgroundColor={isValid ? '#F43F5E' : '#F3F4F6'}
              textColor={isValid ? '#FFFFFF' : '#000000'}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
