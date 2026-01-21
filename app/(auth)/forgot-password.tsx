import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks';
import { Button, Input } from '@/components/ui';
import { forgotPasswordSchema, ForgotPasswordInput } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setError(null);
    const result = await forgotPassword(data.email);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Request failed');
    }
  };

  if (success) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 px-6 items-center justify-center">
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="checkmark" size={40} color="#22c55e" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Check Your Email
          </Text>
          <Text className="text-gray-500 text-center mb-8">
            We've sent a password reset link to your email address. Please check your inbox.
          </Text>
          <Button
            title="Back to Sign In"
            onPress={() => router.push('/(auth)/login')}
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 pt-8">
          <TouchableOpacity
            className="w-10 h-10 items-center justify-center -ml-2"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 px-6 pt-8">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Forgot Password?
          </Text>
          <Text className="text-gray-500 mb-8">
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          {/* Error Message */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <Text className="text-red-600">{error}</Text>
            </View>
          )}

          {/* Form */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                leftIcon={<Ionicons name="mail-outline" size={20} color="#9ca3af" />}
              />
            )}
          />

          {/* Submit Button */}
          <Button
            title="Send Reset Link"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            fullWidth
            size="lg"
          />
        </View>

        {/* Footer */}
        <View className="px-6 py-8">
          <TouchableOpacity
            className="flex-row justify-center"
            onPress={() => router.push('/(auth)/login')}
          >
            <Ionicons name="arrow-back" size={16} color="#0ea5e9" />
            <Text className="text-primary-600 font-medium ml-1">
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
