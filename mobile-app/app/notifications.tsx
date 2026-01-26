import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { notificationsSettingsStyles as styles } from '@/styles/notificationsSettings';

interface NotificationSetting {
  id: string;
  label: string;
  enabled: boolean;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  // Initial notification settings state
  const [settings, setSettings] = useState<NotificationSetting[]>([
    { id: 'general', label: 'General Notifications', enabled: true },
    { id: 'sound', label: 'Sound', enabled: true },
    { id: 'vibrate', label: 'Vibrate', enabled: true },
    { id: 'specialOffer', label: 'Special Offer', enabled: true },
    { id: 'promoDiscounts', label: 'Promo & Discounts', enabled: true },
    { id: 'payments', label: 'Payments', enabled: true },
    { id: 'cashback', label: 'Cashback', enabled: true },
    { id: 'appUpdates', label: 'App Updates', enabled: false },
    { id: 'newService', label: 'New Service Available', enabled: true },
    { id: 'newTips', label: 'New Tips Available', enabled: false },
  ]);

  const handleToggle = (id: string) => {
    setSettings((prevSettings) =>
      prevSettings.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
  };

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
          Notifications
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Settings List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {settings.map((setting, index) => (
          <View key={setting.id}>
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { fontSize: Math.round(16 * scale) }]}>
                {setting.label}
              </Text>
              <Switch
                value={setting.enabled}
                onValueChange={() => handleToggle(setting.id)}
                trackColor={{ false: '#E5E7EB', true: '#F43F5E' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
              />
            </View>
            {index < settings.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
