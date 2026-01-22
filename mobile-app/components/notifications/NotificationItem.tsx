import React from 'react';
import { View, Text, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { notificationItemStyles as styles } from '@/styles/notificationItem';

export type Notification = {
  id: string;
  icon: any;
  title: string;
  message: string;
  date: Date;
};

type Props = {
  notification: Notification;
  style?: StyleProp<ViewStyle>;
};

export function NotificationItem({ notification, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Image
          source={notification.icon}
          style={styles.icon}
          contentFit="contain"
          tintColor="#6B7280"
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message}>{notification.message}</Text>
      </View>
    </View>
  );
}

export default NotificationItem;
