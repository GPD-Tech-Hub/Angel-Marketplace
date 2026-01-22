import React from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { NotificationItem, type Notification } from './NotificationItem';
import { notificationListStyles as styles } from '../../styles/notificationList';

type Props = {
  notifications: Notification[];
};

type GroupedNotifications = {
  [key: string]: Notification[];
};

export function NotificationList({ notifications }: Props) {
  const { width } = useWindowDimensions();
  
  // Group notifications by date
  const groupNotifications = (notifs: Notification[]): GroupedNotifications => {
    const grouped: GroupedNotifications = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    notifs.forEach((notif) => {
      const notifDate = new Date(notif.date);
      notifDate.setHours(0, 0, 0, 0);

      let groupKey: string;
      if (notifDate.getTime() === today.getTime()) {
        groupKey = 'Today';
      } else if (notifDate.getTime() === yesterday.getTime()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = notifDate.toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric',
          year: 'numeric'
        });
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(notif);
    });

    return grouped;
  };

  const grouped = groupNotifications(notifications);
  const scale = Math.max(0.9, Math.min(1.1, width / 390));

  const responsiveStyles = {
    sectionTitle: {
      fontSize: Math.round(18 * scale),
    },
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {Object.entries(grouped).map(([groupKey, groupNotifications]) => (
        <View key={groupKey} style={styles.section}>
          <Text style={[styles.sectionTitle, responsiveStyles.sectionTitle]}>
            {groupKey}
          </Text>
          {groupNotifications.map((notification, index) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              style={
                index < groupNotifications.length - 1
                  ? styles.notificationItem
                  : undefined
              }
            />
          ))}
          {groupKey !== Object.keys(grouped)[Object.keys(grouped).length - 1] && (
            <View style={styles.separator} />
          )}
        </View>
      ))}
    </ScrollView>
  );
}

export default NotificationList;
