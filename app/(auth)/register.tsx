import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks';
import { registerSchema, RegisterInput } from '@/utils/validation';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    const result = await register({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    });
    if (!result.success) {
      setError(result.error || 'Registration failed');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ flexGrow: 1, paddingTop: 20 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-black mb-2">
              Create an account
            </Text>
            <Text className="text-base text-gray-500">
              Let's create your account.
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <Text className="text-red-600">{error}</Text>
            </View>
          )}

          {/* Form */}
          <View className="mb-6">
            {/* First Name */}
            <View className="mb-5">
              <Text className="text-base font-semibold text-black mb-2">
                First Name
              </Text>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <View className={`bg-gray-50 rounded-xl border ${errors.firstName ? 'border-red-500' : 'border-gray-200'}`}>
                      <TextInput
                        className="w-full px-4 py-4 text-base text-black"
                        placeholder="Enter your first name"
                        placeholderTextColor="#9ca3af"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="words"
                      />
                    </View>
                    {errors.firstName && (
                      <Text className="text-red-500 text-xs mt-1">{errors.firstName.message}</Text>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Last Name */}
            <View className="mb-5">
              <Text className="text-base font-semibold text-black mb-2">
                Last Name
              </Text>
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <View className={`bg-gray-50 rounded-xl border ${errors.lastName ? 'border-red-500' : 'border-gray-200'}`}>
                      <TextInput
                        className="w-full px-4 py-4 text-base text-black"
                        placeholder="Enter your last name"
                        placeholderTextColor="#9ca3af"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="words"
                      />
                    </View>
                    {errors.lastName && (
                      <Text className="text-red-500 text-xs mt-1">{errors.lastName.message}</Text>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Email Address */}
            <View className="mb-5">
              <Text className="text-base font-semibold text-black mb-2">
                Email Address
              </Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <View className={`bg-gray-50 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-200'}`}>
                      <TextInput
                        className="w-full px-4 py-4 text-base text-black"
                        placeholder="Enter your email address"
                        placeholderTextColor="#9ca3af"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    </View>
                    {errors.email && (
                      <Text className="text-red-500 text-xs mt-1">{errors.email.message}</Text>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Password */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-black mb-2">
                Password
              </Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <View className={`bg-gray-50 rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-200'} flex-row items-center px-4`}>
                      <TextInput
                        className="flex-1 py-4 text-base text-black"
                        placeholder="Enter your password"
                        placeholderTextColor="#9ca3af"
                        secureTextEntry={!showPassword}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                    {errors.password && (
                      <Text className="text-red-500 text-xs mt-1">{errors.password.message}</Text>
                    )}
                  </View>
                )}
              />
            </View>

            {/* Terms */}
            <Text className="text-sm text-gray-600 mb-8">
              By signing up you agree to our{' '}
              <Text className="text-red-500">Terms</Text>,{' '}
              <Text className="text-red-500">Privacy Policy</Text>, and{' '}
              <Text className="text-red-500">Cookie Use</Text>
            </Text>

            {/* Create Account Button */}
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              className="w-full bg-gray-100 rounded-xl py-4 mb-4"
              activeOpacity={0.7}
            >
              <Text className="text-center text-base font-semibold text-black">
                {isLoading ? 'Creating account...' : 'Create account'}
              </Text>
            </TouchableOpacity>

            {/* OR Divider */}
            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-gray-500 font-medium">OR</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Sign Up with KingsChat Button */}
            <TouchableOpacity
              className="w-full bg-blue-500 rounded-xl py-4 flex-row items-center justify-center mb-6"
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="white" />
              <Text className="text-center text-base font-semibold text-white ml-2">
                Sign Up with KingsChat
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <View className="flex-row justify-center">
              <Text className="text-gray-600">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="text-red-500 font-medium">Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
