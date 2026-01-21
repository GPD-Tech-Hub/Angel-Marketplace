import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useAuth, useResponsive } from '@/hooks';
import { FormButton, FormField, type FormFieldConfig } from '@/components/ui';
import { loginSchema, LoginInput } from '@/utils/validation';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { horizontalPadding, headingSize } = useResponsive();
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    const result = await login(data);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  const formFields: FormFieldConfig[] = [
    {
      name: 'email',
      label: 'Email Address',
      placeholder: 'Enter email address',
      type: 'email',
      autoCapitalize: 'none',
      autoComplete: 'email',
      required: true,
    },
    {
      name: 'password',
      label: 'Password',
      placeholder: 'Enter password',
      type: 'password',
      autoCapitalize: 'none',
      autoComplete: 'password',
      required: true,
    },
  ];

  const forgotPassword = (
    <View className="flex-row justify-start">
      <Text className="text-[#737373] text-base">Forgot your password? </Text>
      <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
        {({ pressed }) => (
          <Text className={`text-[#F43F5E] text-base ${pressed ? 'opacity-70' : ''}`}>
            Reset your password
          </Text>
        )}
      </Pressable>
    </View>
  );

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
            {/* Header */}
            <View className="mb-10 mt-4">
              <Text className={`${headingSize} font-bold text-black mb-2`}>
                Login to your account
              </Text>
              <Text className="text-base text-gray-500">
                It's so great to see you again
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <Text className="text-red-600 text-sm">{error}</Text>
              </View>
            )}

            {/* Fields */}
            {formFields.map((field) => (
              <FormField
                key={field.name}
                control={control}
                name={field.name}
                label={field.label}
                placeholder={field.placeholder}
                type={field.type}
                autoCapitalize={field.autoCapitalize}
                autoComplete={field.autoComplete}
                required={field.required}
                error={(errors as any)[field.name]}
              />
            ))}

            {/* Forgot password (left aligned) */}
            <View className="mt-1">
              {forgotPassword}
            </View>
          </ScrollView>

          {/* Bottom sticky actions */}
          <View
            className="bg-white"
            style={{
              paddingHorizontal: horizontalPadding,
              paddingTop: 12,
              paddingBottom: insets.bottom + 28,
            }}
          >
            <FormButton
              title={isLoading ? 'Logging in...' : 'Login'}
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={!isValid || isLoading}
              variant="primary"
              backgroundColor={isValid ? '#F43F5E' : '#F3F4F6'}
              textColor={isValid ? '#FFFFFF' : '#000000'}
            />

            <View className="items-center my-3">
              <Text className="text-gray-500 font-medium text-sm">OR</Text>
            </View>

            <FormButton
              title="Sign Up with KingsChat"
              onPress={() => {
                // Handle KingsChat auth
              }}
              variant="secondary"
              rightElement={(
                <Image
                  source={require('../../assets/icons/KC.png')}
                  style={{ width: 22, height: 22, marginLeft: 8 }}
                  contentFit="contain"
                />
              )}
            />

            <View className="flex-row justify-center items-center mt-3">
              <Text className="text-[#737373] text-base">Don't have an account? </Text>
              <Pressable onPress={() => router.push('/(auth)/register')}>
                {({ pressed }) => (
                  <Text className={`text-[#F43F5E] font-medium text-base ${pressed ? 'opacity-70' : ''}`}>
                    Sign Up
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
