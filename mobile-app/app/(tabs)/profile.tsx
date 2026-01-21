import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuth } from '@/hooks';
import { Button } from '@/components/ui';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'person-outline',
      label: 'Edit Profile',
      onPress: () => {},
      showChevron: true,
    },
    {
      icon: 'location-outline',
      label: 'Shipping Addresses',
      onPress: () => {},
      showChevron: true,
    },
    {
      icon: 'heart-outline',
      label: 'Favorites',
      onPress: () => router.push('/favorites'),
      showChevron: true,
    },
    {
      icon: 'card-outline',
      label: 'Payment Methods',
      onPress: () => {},
      showChevron: true,
    },
    {
      icon: 'notifications-outline',
      label: 'Notifications',
      onPress: () => {},
      showChevron: true,
    },
    {
      icon: 'help-circle-outline',
      label: 'Help & Support',
      onPress: () => {},
      showChevron: true,
    },
    {
      icon: 'document-text-outline',
      label: 'Terms & Conditions',
      onPress: () => {},
      showChevron: true,
    },
  ];

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="person-outline" size={48} color="#9ca3af" />
          </View>
          <Text className="text-xl font-semibold text-gray-900 mb-2">
            Welcome to Angel Marketplace
          </Text>
          <Text className="text-gray-500 text-center mb-6">
            Sign in to access your profile and manage your account
          </Text>
          <Button title="Sign In" onPress={handleLogin} fullWidth />
          <TouchableOpacity
            className="mt-4"
            onPress={() => router.push('/(auth)/register')}
          >
            <Text className="text-primary-600 font-medium">
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View className="bg-white px-4 py-6 items-center">
          {user?.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              className="w-24 h-24 rounded-full"
              contentFit="cover"
            />
          ) : (
            <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center">
              <Text className="text-3xl font-bold text-primary-600">
                {user?.firstName?.charAt(0) || 'U'}
                {user?.lastName?.charAt(0) || ''}
              </Text>
            </View>
          )}
          <Text className="text-xl font-semibold text-gray-900 mt-4">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-gray-500">{user?.email}</Text>
        </View>

        {/* Menu Items */}
        <View className="mt-4 bg-white">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              className={`flex-row items-center px-4 py-4 ${
                index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
              onPress={item.onPress}
            >
              <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                <Ionicons name={item.icon} size={20} color="#374151" />
              </View>
              <Text className="flex-1 ml-3 text-base text-gray-900">
                {item.label}
              </Text>
              {item.showChevron && (
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View className="mt-4 px-4 pb-8">
          <TouchableOpacity
            className="flex-row items-center justify-center py-4 bg-red-50 rounded-xl"
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text className="ml-2 text-red-500 font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
