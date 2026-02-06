import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '@/hooks';
import { FormButton, FormField } from '@/components/ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '@/utils/validation';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { horizontalPadding } = useResponsive();
  const insets = useSafeAreaInsets();
  const [submitted, setSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<{ password: string; confirmPassword: string }>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = () => {
    // No backend yet — just go back to login for now.
    setSubmitted(true);
    router.push('/(auth)/login');
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
            <View className="mb-10">
              <Text className="text-3xl font-bold text-black mb-3">
                Reset password
              </Text>
              <Text className="text-base text-gray-500 leading-6">
                Set the new password for your account so you can login and access all the features.
              </Text>
            </View>

            {/* New Password */}
            <View className="mb-2">
              <FormField
                control={control}
                name="password"
                label="New Password"
                placeholder="Enter new password"
                type="password"
                autoCapitalize="none"
                autoComplete="password"
                required={true}
                error={(errors as any).password}
              />
            </View>

            {/* Confirm New Password */}
            <View>
              <FormField
                control={control}
                name="confirmPassword"
                label="Confirm New Password"
                placeholder="Confirm new password"
                type="password"
                autoCapitalize="none"
                autoComplete="password"
                required={true}
                error={(errors as any).confirmPassword}
              />
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
              title="Send Code"
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid}
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

