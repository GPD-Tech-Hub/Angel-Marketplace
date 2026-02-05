import React from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuth } from '@/hooks';
import { useUnreadNotificationCount } from '@/queries';
import { NumberBadge } from '@/components/ui/Badge';
import { profileScreenStyles as styles } from '@/styles/profileScreen';

interface MenuItem {
  icon: any; // require() path for image
  label: string;
  onPress: () => void;
  isLogout?: boolean;
  showSeparator?: boolean;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  const { isAuthenticated, logout } = useAuth();
  const { data: unreadData } = useUnreadNotificationCount({ enabled: isAuthenticated });
  const unreadCount = unreadData?.unreadCount ?? 0;

  const menuItems: MenuItem[] = [
    {
      icon: require('../../assets/icons/package.png'),
      label: 'My Orders',
      onPress: () => {
        router.push('/(tabs)/orders');
      },
      showSeparator: true,
    },
    {
      icon: require('../../assets/icons/user-cog.png'),
      label: 'My Details',
      onPress: () => {
        router.push('/my-details');
      },
    },
    {
      icon: require('../../assets/icons/map-pin-house.png'),
      label: 'Address Book',
      onPress: () => {
        router.push('/address');
      },
    },
    {
      icon: require('../../assets/icons/credit-card.png'),
      label: 'Payment Method',
      onPress: () => {
        router.push('/payment-method');
      },
    },
    {
      icon: require('../../assets/icons/notifications.png'),
      label: 'Notifications',
      onPress: () => {
        router.push('/notifications');
      },
      showSeparator: true,
    },
    {
      icon: require('../../assets/icons/Question.png'),
      label: 'FAQs',
      onPress: () => {
        // TODO: Navigate to FAQs
      },
    },
    {
      icon: require('../../assets/icons/headphones.png'),
      label: 'Help Center',
      onPress: () => {
        // TODO: Navigate to help center
      },
    },
    {
      icon: require('../../assets/icons/log-out.png'),
      label: 'Logout',
      onPress: () => {
        // TODO: Implement logout when authentication is ready
        if (isAuthenticated) {
          logout();
        }
      },
      isLogout: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={10}
        >
          {({ pressed }) => (
            <Ionicons
              name="chevron-back"
              size={24}
              color="#111827"
              style={{ opacity: pressed ? 0.7 : 1 }}
            />
          )}
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize: Math.round(20 * scale) }]}>
          Account
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Menu Items */}
        {menuItems.map((item, index) => (
          <React.Fragment key={item.label}>
            <Pressable
              style={styles.menuItem}
              onPress={item.onPress}
            >
              {({ pressed }) => (
                <View style={[styles.menuItemInner, { opacity: pressed ? 0.7 : 1 }]}>
                  <Image
                    source={item.icon}
                    style={[
                      styles.menuItemIcon,
                      item.isLogout && styles.menuItemIconLogout,
                      { width: Math.round(24 * scale), height: Math.round(24 * scale) },
                    ]}
                    contentFit="contain"
                    tintColor={item.isLogout ? '#EF4444' : undefined}
                  />
                  <Text
                    style={[
                      styles.menuItemText,
                      item.isLogout && styles.menuItemTextLogout,
                      { fontSize: Math.round(16 * scale) },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.label === 'Notifications' && unreadCount > 0 && (
                    <View style={{ marginRight: 8 }}>
                      <NumberBadge count={unreadCount} size="sm" />
                    </View>
                  )}
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={item.isLogout ? '#EF4444' : '#9ca3af'}
                  />
                </View>
              )}
            </Pressable>
            {item.showSeparator && (
              <View style={styles.separator} />
            )}
          </React.Fragment>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
