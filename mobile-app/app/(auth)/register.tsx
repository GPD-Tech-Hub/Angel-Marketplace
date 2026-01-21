import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResponsive } from '@/hooks';
import { FormButton, FormField, type FormFieldConfig } from '@/components/ui';
import { registerSchema, RegisterInput } from '@/utils/validation';
import { Image } from 'expo-image';

export default function RegisterScreen() {
  const router = useRouter();
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { horizontalPadding, headingSize } = useResponsive();
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (_data: RegisterInput) => {
    setError(null);
    // No backend auth yet — go straight to Home.
    router.replace('/(tabs)');
  };

  const formFields: FormFieldConfig[] = [
    {
      name: 'firstName',
      label: 'First Name',
      placeholder: 'Enter your first name',
      type: 'text',
      autoCapitalize: 'words',
      required: true,
    },
    {
      name: 'lastName',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      type: 'text',
      autoCapitalize: 'words',
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email address',
      type: 'email',
      autoCapitalize: 'none',
      autoComplete: 'email',
      required: true,
    },
    {
      name: 'password',
      label: 'Password',
      placeholder: 'Enter your password',
      type: 'password',
      autoCapitalize: 'none',
      autoComplete: 'password',
      required: true,
    },
  ];

  const footerText = (
    <Text className="text-sm text-gray-600 text-center">
      By signing up you agree to our{' '}
      <Text className="text-[#F43F5E]">Terms</Text>,{' '}
      <Text className="text-[#F43F5E]">Privacy Policy</Text>, and{' '}
      <Text className="text-[#F43F5E]">Cookie Use</Text>
    </Text>
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
                Create an account
              </Text>
              <Text className="text-base text-gray-500">
                Let's create your account.
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

            {/* Terms (above bottom area, scrolls with fields) */}
            <View className="mt-1">
              {footerText}
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
              title={isLoading ? 'Creating account...' : 'Create account'}
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
                // Handle KingsChat signup
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
              <Text className="text-[#737373] text-base">Already have an account? </Text>
              <Pressable onPress={() => router.push('/(auth)/login')}>
                {({ pressed }) => (
                  <Text className={`text-[#F43F5E] font-medium text-base ${pressed ? 'opacity-70' : ''}`}>
                    Log In
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
