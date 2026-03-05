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
      <View className="rounded-[24px] border border-[#ece7eb] bg-white px-5 pb-5 pt-5">
        <View className="mb-6 flex-row items-center justify-between">
          {showBack ? (
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full border border-[#ece7eb] bg-[#faf7f8]"
            >
              {({ pressed }) => (
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color="#171717"
                  style={{ opacity: pressed ? 0.72 : 1 }}
                />
              )}
            </Pressable>
          ) : (
            <View className="rounded-full border border-[#ece7eb] bg-[#faf7f8] px-3 py-2">
              <Text className="text-xs font-semibold uppercase tracking-[1.2px] text-[#666666]">
                {badge}
              </Text>
            </View>
          )}

          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-[#faf7f8]">
            <Image
              source={require('../../assets/logo.png')}
              style={{ width: 28, height: 28 }}
              contentFit="contain"
            />
          </View>
        </View>

        <View className="max-w-[88%]">
          <Text className="mb-2 text-[28px] font-bold leading-8 text-[#171717]">
            {title}
          </Text>
          <Text className="text-[15px] leading-6 text-[#666666]">
            {subtitle}
          </Text>
          {helper ? (
            <Text className="mt-3 text-sm leading-5 text-[#8a8a8a]">
              {helper}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="mt-4 rounded-[24px] border border-[#ece7eb] bg-white px-5 pb-6 pt-6">
        {children}
      </View>
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#f7f4f5]" edges={['top', 'bottom']}>
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
              className="border-t border-[#ece7eb] bg-white"
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
