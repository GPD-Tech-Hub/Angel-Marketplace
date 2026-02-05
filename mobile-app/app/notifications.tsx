import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  useWindowDimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useNotifications,
  useNotificationSettings,
  useUpdateNotificationSettings,
  useMarkNotificationRead,
} from '@/queries';
import { notificationsSettingsStyles as styles } from '@/styles/notificationsSettings';

const SETTINGS_CONFIG: { id: keyof typeof DEFAULT_SETTINGS; label: string }[] = [
  { id: 'general', label: 'General Notifications' },
  { id: 'sound', label: 'Sound' },
  { id: 'vibrate', label: 'Vibrate' },
  { id: 'specialOffer', label: 'Special Offer' },
  { id: 'promoDiscounts', label: 'Promo & Discounts' },
  { id: 'payments', label: 'Payments' },
  { id: 'cashback', label: 'Cashback' },
  { id: 'appUpdates', label: 'App Updates' },
  { id: 'newService', label: 'New Service Available' },
  { id: 'newTips', label: 'New Tips Available' },
];

const DEFAULT_SETTINGS = {
  general: true,
  sound: true,
  vibrate: true,
  specialOffer: true,
  promoDiscounts: true,
  payments: true,
  cashback: true,
  appUpdates: false,
  newService: true,
  newTips: false,
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const { data: settingsData, isLoading, isError, error } = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();
  const {
    data: notificationsData,
    refetch: refetchNotifications,
    isRefetching: isRefetchingNotifications,
  } = useNotifications({
    refetchInterval: 60 * 1000,
  });
  const markRead = useMarkNotificationRead();

  const notifications = notificationsData?.notifications ?? [];
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString();
  };

  const settings = useMemo(() => {
    const fromApi = settingsData ?? DEFAULT_SETTINGS;
    return SETTINGS_CONFIG.map(({ id, label }) => ({
      id,
      label,
      enabled: fromApi[id] ?? DEFAULT_SETTINGS[id],
    }));
  }, [settingsData]);

  const handleToggle = (id: string, currentValue: boolean) => {
    const key = id as keyof typeof DEFAULT_SETTINGS;
    updateSettings.mutate({ [key]: !currentValue });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </Pressable>
          <Text style={[styles.headerTitle, { fontSize: Math.round(20 * scale) }]}>
            Notifications
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#F43F5E" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </Pressable>
          <Text style={[styles.headerTitle, { fontSize: Math.round(20 * scale) }]}>
            Notifications
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: '#6B7280', textAlign: 'center' }}>
            {(error as Error)?.message ?? 'Failed to load notification settings'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingNotifications}
            onRefresh={() => refetchNotifications()}
            tintColor="#F43F5E"
          />
        }
      >
        {/* Recent notifications */}
        {notifications.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontSize: Math.round(16 * scale),
                fontWeight: '600',
                color: '#111827',
                marginBottom: 12,
                paddingHorizontal: 20,
              }}
            >
              Recent
            </Text>
            {notifications.slice(0, 10).map((n) => (
              <Pressable
                key={n.id}
                onPress={() => !n.read && markRead.mutate(n.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  backgroundColor: n.read ? undefined : '#FEF2F2',
                }}
              >
                <Ionicons
                  name={n.read ? 'mail-open-outline' : 'mail-unread-outline'}
                  size={22}
                  color="#6B7280"
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '600', color: '#111827', fontSize: 14 }}>
                    {n.title}
                  </Text>
                  <Text
                    style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}
                    numberOfLines={2}
                  >
                    {n.message}
                  </Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>
                    {formatDate(n.createdAt)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        <Text
          style={{
            fontSize: Math.round(16 * scale),
            fontWeight: '600',
            color: '#111827',
            marginBottom: 12,
            paddingHorizontal: 20,
          }}
        >
          Settings
        </Text>
        {settings.map((setting, index) => (
          <View key={setting.id}>
            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { fontSize: Math.round(16 * scale) }]}>
                {setting.label}
              </Text>
              <Switch
                value={setting.enabled}
                onValueChange={() => handleToggle(setting.id, setting.enabled)}
                trackColor={{ false: '#E5E7EB', true: '#F43F5E' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
                disabled={updateSettings.isPending}
              />
            </View>
            {index < settings.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
