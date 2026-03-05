import React from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useResponsive } from '@/hooks';

interface AuthScreenShellProps {
  title: string;
  subtitle: string;
  badge?: string;
  helper?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  scrollable?: boolean;
  showBack?: boolean;
}

export default function AuthScreenShell({
  title,
  subtitle,
  badge = 'Angel Marketplace',
  helper,
  footer,
  children,
  scrollable = true,
  showBack = false,
}: AuthScreenShellProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { horizontalPadding } = useResponsive();

  const body = (
    <>
      <View className="relative overflow-hidden rounded-[30px] bg-[#161124] px-6 pb-8 pt-6">
        <View className="mb-6 flex-row items-center justify-between">
          {showBack ? (
            <Pressable
              onPress={() => router.back()}
              className="h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10"
            >
              {({ pressed }) => (
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color="#FFFFFF"
                  style={{ opacity: pressed ? 0.72 : 1 }}
                />
              )}
            </Pressable>
          ) : (
            <View className="rounded-full border border-white/10 bg-white/10 px-3 py-2">
              <Text className="text-xs font-semibold uppercase tracking-[1.8px] text-[#fecdd3]">
                {badge}
              </Text>
            </View>
          )}

          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <Image
              source={require('../../assets/logo.png')}
              style={{ width: 28, height: 28 }}
              contentFit="contain"
            />
          </View>
        </View>

        <View className="max-w-[88%]">
          <Text className="mb-3 text-3xl font-bold leading-9 text-white">
            {title}
          </Text>
          <Text className="text-base leading-6 text-[#d8d1e8]">
            {subtitle}
          </Text>
          {helper ? (
            <Text className="mt-4 text-sm leading-5 text-[#fbcfe8]">
              {helper}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="-mt-5 rounded-[28px] border border-[#f3e8ff] bg-white px-5 pb-6 pt-6 shadow-sm">
        {children}
      </View>
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#fff8fb]" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1">
          {scrollable ? (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                paddingHorizontal: horizontalPadding,
                paddingTop: 12,
                paddingBottom: 24,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {body}
            </ScrollView>
          ) : (
            <View style={{ flex: 1, paddingHorizontal: horizontalPadding, paddingTop: 12 }}>
              {body}
            </View>
          )}

          {footer ? (
            <View
              className="border-t border-[#f3e8ff] bg-white/95"
              style={{
                paddingHorizontal: horizontalPadding,
                paddingTop: 14,
                paddingBottom: insets.bottom + 24,
              }}
            >
              {footer}
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
