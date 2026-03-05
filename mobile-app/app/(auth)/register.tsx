import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormButton, FormField, type FormFieldConfig } from '@/components/ui';
import AuthScreenShell from '@/components/auth/AuthScreenShell';
import { registerSchema, RegisterInput } from '@/utils/validation';
import { completeKingsChatAuth, getKingsChatErrorMessage } from '@/utils/kingschatAuth';
import { Image } from 'expo-image';
import { authService } from '@/services';
import { useAuthStore } from '@/store';
import { AxiosError } from 'axios';

export default function RegisterScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isKingsChatLoading, setIsKingsChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loginStore = useAuthStore((state) => state.login);

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

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    setIsLoading(true);
    try {
      const { user, tokens } = await authService.register(data);
      await loginStore(user, tokens);
      router.replace('/(tabs)');
    } catch (err) {
      const message = err instanceof AxiosError && err.response?.data?.message
        ? String(err.response.data.message)
        : err instanceof Error ? err.message : 'Registration failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onKingsChatSignup = async () => {
    setError(null);
    setIsKingsChatLoading(true);

    try {
      await completeKingsChatAuth();
      router.replace('/(tabs)');
    } catch (err) {
      const message = getKingsChatErrorMessage(err, 'KingsChat sign up failed');
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

  return (
    <AuthScreenShell
      title="Create account"
      subtitle="Sign up to continue."
      footer={(
        <>
          <FormButton
            title={isLoading ? 'Creating account...' : 'Create account'}
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
              Or sign up with
            </Text>
            <View className="h-px flex-1 bg-[#f1d6e2]" />
          </View>

          <FormButton
            title={isKingsChatLoading ? 'Connecting KingsChat...' : 'Sign Up with KingsChat'}
            onPress={onKingsChatSignup}
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
            <Text className="text-base text-[#7a6673]">Already have an account? </Text>
            <Pressable onPress={() => router.push('/(auth)/login')}>
              {({ pressed }) => (
                <Text className={`text-base font-semibold text-[#F43F5E] ${pressed ? 'opacity-70' : ''}`}>
                  Log In
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

    </AuthScreenShell>
  );
}
