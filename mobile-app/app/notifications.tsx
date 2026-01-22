import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationsStyles as styles } from '@/styles/notifications';
import { EmptyNotifications, NotificationList, type Notification } from '@/components/notifications';

export default function NotificationsScreen() {
  const router = useRouter();
  
  // TODO: Replace with actual notifications from API/store
  // For now, using mock data to demonstrate the list view
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      icon: require('../assets/icons/tag.png'),
      title: '30% Special Discount!',
      message: 'Special promotion only valid today.',
      date: new Date(), // Today
    },
    {
      id: '2',
      icon: require('../assets/icons/map-pin.png'),
      title: 'New Service Available!',
      message: 'Now you can track order in real-time.',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
    {
      id: '3',
      icon: require('../assets/icons/credit-card.png'),
      title: 'Credit Card Connected!',
      message: 'Credit card has been linked.',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
    {
      id: '4',
      icon: require('../assets/icons/circle-user.png'),
      title: 'Account Setup Successfully!',
      message: 'Your account has been created.',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
  ]);

  const hasNotifications = notifications.length > 0;

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      {hasNotifications ? (
        <NotificationList notifications={notifications} />
      ) : (
        <EmptyNotifications />
      )}
    </SafeAreaView>
  );
}
