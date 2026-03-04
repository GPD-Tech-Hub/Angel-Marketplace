import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Switch,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useNotifications,
  useNotificationSettings,
  useUpdateNotificationSettings,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/queries';
import type { NotificationItem } from '@/services/notifications.service';
import { colors } from '@/constants/colors';

// ── Notification type → icon + tint ─────────────────────────────────────────
function notifIcon(type: string): { name: React.ComponentProps<typeof Ionicons>['name']; tint: string } {
  switch (type) {
    case 'order':    return { name: 'bag-check-outline',    tint: '#10B981' };
    case 'payment':  return { name: 'card-outline',         tint: '#3B82F6' };
    case 'promo':    return { name: 'pricetag-outline',     tint: '#F59E0B' };
    case 'cancel':   return { name: 'close-circle-outline', tint: '#EF4444' };
    default:         return { name: 'notifications-outline', tint: colors.brand };
  }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ── Settings config — only settings the backend actually honours ─────────────
type SettingKey = 'general' | 'orders' | 'payments';

const SETTINGS_CONFIG: { id: SettingKey; label: string; description: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { id: 'general',  label: 'All Notifications', description: 'Master switch for all alerts',              icon: 'notifications-outline' },
  { id: 'orders',   label: 'Order Updates',      description: 'Order placed & cancellation confirmations', icon: 'bag-check-outline' },
  { id: 'payments', label: 'Payment Alerts',     description: 'Payment received confirmations',            icon: 'card-outline' },
];

const DEFAULT_SETTINGS: Record<SettingKey, boolean> = {
  general: true, orders: true, payments: true,
};

// ── Single notification row ─────────────────────────────────────────────────
function NotifRow({ item, onPress }: { item: NotificationItem; onPress: (id: string) => void }) {
  const { name, tint } = notifIcon(item.type);
  return (
    <Pressable
      style={({ pressed }) => [s.notifRow, !item.read && s.notifRowUnread, { opacity: pressed ? 0.85 : 1 }]}
      onPress={() => !item.read && onPress(item.id)}
    >
      {/* Icon bubble */}
      <View style={[s.iconBubble, { backgroundColor: tint + '18' }]}>
        <Ionicons name={name} size={20} color={tint} />
      </View>

      {/* Content */}
      <View style={s.notifContent}>
        <View style={s.notifTitleRow}>
          <Text style={[s.notifTitle, !item.read && s.notifTitleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={s.notifTime}>{relativeTime(item.createdAt)}</Text>
        </View>
        <Text style={s.notifMessage} numberOfLines={2}>{item.message}</Text>
      </View>

      {/* Unread dot */}
      {!item.read && <View style={s.unreadDot} />}
    </Pressable>
  );
}

// ── Main screen ─────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    data: notifData,
    isLoading: notifLoading,
    isRefetching,
    refetch,
  } = useNotifications({ refetchInterval: 60_000 });

  const { data: settingsData } = useNotificationSettings();
  const updateSettings   = useUpdateNotificationSettings();
  const markRead         = useMarkNotificationRead();
  const markAllRead      = useMarkAllNotificationsRead();

  const notifications = notifData?.notifications ?? [];
  const unreadCount   = notifData?.unreadCount ?? 0;

  const settings = useMemo(() =>
    SETTINGS_CONFIG.map(({ id, label, icon }) => ({
      id, label, icon,
      enabled: settingsData ? (settingsData[id] ?? DEFAULT_SETTINGS[id]) : DEFAULT_SETTINGS[id],
    })),
    [settingsData]
  );

  // ── List header: "Mark all" button ──────────────────────────────────────
  const ListHeader = useMemo(() => {
    if (notifications.length === 0) return null;
    return (
      <View style={s.listHeader}>
        <Text style={s.listHeaderLabel}>
          {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        </Text>
        {unreadCount > 0 && (
          <Pressable
            onPress={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            hitSlop={8}
          >
            <Text style={s.markAllText}>Mark all read</Text>
          </Pressable>
        )}
      </View>
    );
  }, [notifications.length, unreadCount, markAllRead]);

  // ── Settings accordion footer ────────────────────────────────────────────
  const ListFooter = (
    <View style={s.settingsSection}>
      <Pressable style={s.settingsHeader} onPress={() => setSettingsOpen((v) => !v)}>
        <View style={s.settingsHeaderLeft}>
          <Ionicons name="settings-outline" size={18} color={colors.gray[600]} />
          <Text style={s.settingsHeaderText}>Notification Settings</Text>
        </View>
        <Ionicons
          name={settingsOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.gray[400]}
        />
      </Pressable>

      {settingsOpen && settings.map((setting, i) => (
        <View key={setting.id}>
          <View style={s.settingRow}>
            <View style={s.settingLeft}>
              <Ionicons name={setting.icon} size={16} color={colors.gray[500]} style={s.settingIcon} />
              <Text style={s.settingLabel}>{setting.label}</Text>
            </View>
            <Switch
              value={setting.enabled}
              onValueChange={() => updateSettings.mutate({ [setting.id]: !setting.enabled })}
              trackColor={{ false: colors.gray[200], true: colors.brand }}
              thumbColor="#fff"
              ios_backgroundColor={colors.gray[200]}
              disabled={updateSettings.isPending}
            />
          </View>
          {i < settings.length - 1 && <View style={s.divider} />}
        </View>
      ))}
    </View>
  );

  const renderItem = ({ item }: ListRenderItemInfo<NotificationItem>) => (
    <NotifRow item={item} onPress={(id) => markRead.mutate(id)} />
  );

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      {/* ── Header ── */}
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()} hitSlop={10}>
          {({ pressed }) => (
            <Ionicons name="chevron-back" size={24} color={colors.gray[900]} style={{ opacity: pressed ? 0.6 : 1 }} />
          )}
        </Pressable>
        <Text style={s.headerTitle}>Notifications</Text>
        <View style={s.headerSpacer} />
      </View>

      {/* ── Body ── */}
      {notifLoading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <View style={s.emptyIconWrap}>
                <Ionicons name="notifications-outline" size={36} color={colors.brand} />
              </View>
              <Text style={s.emptyTitle}>No notifications yet</Text>
              <Text style={s.emptyBody}>
                Order updates, offers, and account activity will appear here.
              </Text>
            </View>
          }
          ListFooterComponent={ListFooter}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.brand}
              colors={[colors.brand]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAFAFA' },

  // Header
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, backgroundColor: '#FAFAFA' },
  backBtn:      { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { fontSize: 20, fontWeight: '700', color: colors.gray[900] },
  headerSpacer: { width: 40 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  listContent: { paddingBottom: 40 },

  // List header (unread count + mark all)
  listHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 4, paddingBottom: 10,
  },
  listHeaderLabel: { fontSize: 13, fontWeight: '600', color: colors.gray[500] },
  markAllText:     { fontSize: 13, fontWeight: '700', color: colors.brand },

  // Notification row
  notifRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: colors.gray[100],
  },
  notifRowUnread: {
    backgroundColor: '#FEF7F8',
  },
  iconBubble: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12, flexShrink: 0,
  },
  notifContent:   { flex: 1 },
  notifTitleRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  notifTitle:     { fontSize: 14, fontWeight: '500', color: colors.gray[700], flex: 1, marginRight: 8 },
  notifTitleUnread: { fontWeight: '700', color: colors.gray[900] },
  notifMessage:   { fontSize: 13, color: colors.gray[500], lineHeight: 18 },
  notifTime:      { fontSize: 11, color: colors.gray[400], flexShrink: 0 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.brand,
    marginTop: 6, marginLeft: 10, flexShrink: 0,
  },

  // Empty state
  emptyWrap:    { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyIconWrap:{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#FEF2F4', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyTitle:   { fontSize: 17, fontWeight: '700', color: colors.gray[800], marginBottom: 8, textAlign: 'center' },
  emptyBody:    { fontSize: 14, color: colors.gray[500], textAlign: 'center', lineHeight: 20 },

  // Settings accordion
  settingsSection: {
    marginTop: 16, marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1, borderColor: colors.gray[100],
    overflow: 'hidden',
    marginBottom: 16,
  },
  settingsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  settingsHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingsHeaderText: { fontSize: 15, fontWeight: '700', color: colors.gray[800] },

  settingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  settingLeft:  { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingIcon:  { marginRight: 12 },
  settingLabel: { fontSize: 14, fontWeight: '500', color: colors.gray[700] },
  divider:      { height: 1, backgroundColor: colors.gray[100], marginLeft: 44 },
});
