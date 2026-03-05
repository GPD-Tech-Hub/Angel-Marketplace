import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { FormButton, FormField, type FormFieldConfig } from '@/components/ui';
import AuthScreenShell from '@/components/auth/AuthScreenShell';
import { loginSchema, LoginInput } from '@/utils/validation';
import { authService } from '@/services';
import { completeKingsChatAuth, getKingsChatErrorMessage } from '@/utils/kingschatAuth';
import { useAuthStore } from '@/store';
import { AxiosError } from 'axios';

export default function LoginScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isKingsChatLoading, setIsKingsChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loginStore = useAuthStore((state) => state.login);

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
    setIsLoading(true);
    try {
      const { user, tokens } = await authService.login(data);
      await loginStore(user, tokens);
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof AxiosError && err.response?.data?.message
        ? String(err.response.data.message)
        : err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onKingsChatLogin = async () => {
    setError(null);
    setIsKingsChatLoading(true);

    try {
      await completeKingsChatAuth();
      router.replace('/(tabs)');
    } catch (err) {
      const message = getKingsChatErrorMessage(err, 'KingsChat login failed');
      if (!message) {
        return;
      }
      setError(message);
    } finally {
      setIsKingsChatLoading(false);
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
    <AuthScreenShell
      title="Welcome back"
      subtitle="Pick up where you left off and continue shopping, tracking orders, and saving your favorites."
      helper="Fast checkout, saved addresses, and KingsChat sign-in all live here."
      footer={(
        <>
          <FormButton
            title={isLoading ? 'Logging in...' : 'Login'}
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={!isValid || isLoading || isKingsChatLoading}
            variant="primary"
            backgroundColor={isValid ? '#F43F5E' : '#FCE7F3'}
            textColor={isValid ? '#FFFFFF' : '#9F1239'}
          />

          <View className="my-4 flex-row items-center">
            <View className="h-px flex-1 bg-[#f1d6e2]" />
            <Text className="mx-3 text-xs font-semibold uppercase tracking-[1.6px] text-[#9f718a]">
              Or continue with
            </Text>
            <View className="h-px flex-1 bg-[#f1d6e2]" />
          </View>

          <FormButton
            title={isKingsChatLoading ? 'Signing in with KingsChat...' : 'Sign In with KingsChat'}
            onPress={onKingsChatLogin}
            loading={isKingsChatLoading}
            disabled={isLoading || isKingsChatLoading}
            variant="secondary"
            backgroundColor="#1D4ED8"
            textColor="#FFFFFF"
            rightElement={(
              <Image
                source={require('../../assets/icons/KC.png')}
                style={{ width: 22, height: 22, marginLeft: 8 }}
                contentFit="contain"
              />
            )}
          />

          <View className="mt-4 flex-row justify-center items-center">
            <Text className="text-base text-[#7a6673]">Don&apos;t have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/register')}>
              {({ pressed }) => (
                <Text className={`text-base font-semibold text-[#F43F5E] ${pressed ? 'opacity-70' : ''}`}>
                  Sign Up
                </Text>
              )}
            </Pressable>
          </View>
        </>
      )}
    >
      {error && (
        <View className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <Text className="text-sm text-red-600">{error}</Text>
        </View>
      )}

      <View className="mb-5 rounded-2xl bg-[#fff5f8] px-4 py-4">
        <Text className="text-xs font-semibold uppercase tracking-[1.4px] text-[#be185d]">
          Member access
        </Text>
        <Text className="mt-2 text-sm leading-5 text-[#6b4455]">
          Use your email and password, or sign in with KingsChat for a quicker return.
        </Text>
      </View>

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

      <View className="mt-2">
        {forgotPassword}
      </View>
    </AuthScreenShell>
  );
}
