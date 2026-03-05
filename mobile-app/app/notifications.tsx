import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  View,
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

const BRAND = colors.brand;
const BRAND_LIGHT = '#FFF1F5';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const TEXT_TERTIARY = '#9CA3AF';
const SCREEN_BG = '#F7F4F5';
const DIVIDER = '#ECE7EB';

function notifIcon(type: string): {
  name: React.ComponentProps<typeof Ionicons>['name'];
  tint: string;
  bg: string;
} {
  switch (type) {
    case 'order':
      return { name: 'bag-handle-outline', tint: BRAND, bg: BRAND_LIGHT };
    case 'payment':
      return { name: 'card-outline', tint: '#0284C7', bg: '#E0F2FE' };
    case 'promo':
      return { name: 'pricetag-outline', tint: '#D97706', bg: '#FEF3C7' };
    case 'cancel':
      return { name: 'close-circle-outline', tint: '#DC2626', bg: '#FEE2E2' };
    default:
      return { name: 'notifications-outline', tint: BRAND, bg: BRAND_LIGHT };
  }
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

function resolveNotificationRoute(item: NotificationItem): string | null {
  const data = item.data ?? {};

  if (typeof data.route === 'string' && data.route.length > 0) {
    return data.route;
  }

  if (typeof data.orderId === 'string' && data.orderId.length > 0) {
    return `/order/${data.orderId}`;
  }

  if (typeof data.productSlug === 'string' && data.productSlug.length > 0) {
    return `/product/${data.productSlug}`;
  }

  if (typeof data.categorySlug === 'string' && data.categorySlug.length > 0) {
    return `/category/${data.categorySlug}`;
  }

  switch (item.type) {
    case 'promo':
      return '/(tabs)/shop';
    default:
      return null;
  }
}

type SettingKey = 'general' | 'orders' | 'payments';

const SETTINGS_CONFIG: {
  id: SettingKey;
  label: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}[] = [
  {
    id: 'general',
    label: 'All Notifications',
    description: 'Master switch for all alerts',
    icon: 'notifications-outline',
  },
  {
    id: 'orders',
    label: 'Order Updates',
    description: 'Shipping and delivery changes',
    icon: 'bag-handle-outline',
  },
  {
    id: 'payments',
    label: 'Payment Alerts',
    description: 'Charges, refunds, and confirmations',
    icon: 'card-outline',
  },
];

const DEFAULT_SETTINGS: Record<SettingKey, boolean> = {
  general: true,
  orders: true,
  payments: true,
};

function NotifRow({
  item,
  onPress,
}: {
  item: NotificationItem;
  onPress: (id: string, route: string | null) => void;
}) {
  const { name, tint, bg } = notifIcon(item.type);
  const unread = !item.read;
  const route = resolveNotificationRoute(item);

  return (
    <Pressable
      onPress={() => onPress(item.id, route)}
      style={({ pressed }) => [
        s.row,
        unread && s.rowUnread,
        pressed && s.rowPressed,
      ]}
    >
      {unread ? <View style={s.unreadBar} /> : null}

      <View style={[s.iconBubble, { backgroundColor: bg }]}>
        <Ionicons name={name} size={22} color={tint} />
      </View>

      <View style={s.rowContent}>
        <View style={s.rowTop}>
          <Text numberOfLines={1} style={[s.rowTitle, unread && s.rowTitleBold]}>
            {item.title}
          </Text>
          <View style={s.rowTimePill}>
            <Text style={s.rowTime}>{relativeTime(item.createdAt)}</Text>
          </View>
        </View>

        <Text numberOfLines={2} style={s.rowMessage}>
          {item.message}
        </Text>
      </View>

      {route ? (
        <Ionicons
          name="chevron-forward"
          size={16}
          color="#A18A96"
          style={s.chevron}
        />
      ) : null}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    data: notifData,
    isLoading,
    isRefetching,
    refetch,
  } = useNotifications({ refetchInterval: 30_000 });
  const { data: settingsData } = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = notifData?.notifications ?? [];
  const unreadCount = notifData?.unreadCount ?? 0;

  const settings = useMemo(
    () =>
      SETTINGS_CONFIG.map(({ id, label, description, icon }) => ({
        id,
        label,
        description,
        icon,
        enabled: settingsData
          ? (settingsData[id] ?? DEFAULT_SETTINGS[id])
          : DEFAULT_SETTINGS[id],
      })),
    [settingsData]
  );

  const generalOn = settings.find((item) => item.id === 'general')?.enabled ?? true;

  const ListHeader = (
    <View>
      <View style={s.heroCard}>
        <Text style={s.heroTitle}>Notifications</Text>
        <Text style={s.heroBody}>
          {unreadCount > 0
            ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}`
            : 'You are all caught up.'}
        </Text>
        {unreadCount > 0 ? (
          <Pressable
            onPress={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            style={({ pressed }) => [s.markAllBtn, pressed && s.markAllBtnPressed]}
          >
            <Text style={s.markAllText}>
              {markAllRead.isPending ? 'Updating...' : 'Mark all read'}
            </Text>
          </Pressable>
        ) : null}
      </View>

      {notifications.length > 0 ? (
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Latest activity</Text>
          <Text style={s.sectionCaption}>
            Tap any item to jump into the related part of your account.
          </Text>
        </View>
      ) : null}
    </View>
  );

  const ListFooter = (
    <View style={s.footerWrap}>
      <View style={s.settingsCard}>
        <Pressable
          style={s.settingsCardHeader}
          onPress={() => setSettingsOpen((value) => !value)}
        >
          <View style={s.settingsLeft}>
            <View style={[s.settingIconWrap, { backgroundColor: BRAND_LIGHT }]}>
              <Ionicons name="settings-outline" size={16} color={BRAND} />
            </View>

            <View>
              <Text style={s.settingsTitle}>Notification Settings</Text>
              <Text style={s.settingsSubtitle}>
                {settingsOpen ? 'Tap to collapse' : 'Tap to manage alerts'}
              </Text>
            </View>
          </View>

          <Ionicons
            name={settingsOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={TEXT_TERTIARY}
          />
        </Pressable>

        {settingsOpen
          ? settings.map((setting) => {
              const isSubSetting = setting.id !== 'general';
              const isDisabled = updateSettings.isPending || (isSubSetting && !generalOn);

              return (
                <View key={setting.id}>
                  <View style={s.divider} />
                  <View style={[s.settingRow, isDisabled && s.settingRowDimmed]}>
                    <View
                      style={[
                        s.settingIconWrap,
                        {
                          backgroundColor:
                            setting.enabled && !isDisabled ? BRAND_LIGHT : '#F8FAFC',
                        },
                      ]}
                    >
                      <Ionicons
                        name={setting.icon}
                        size={16}
                        color={
                          setting.enabled && !isDisabled ? BRAND : TEXT_TERTIARY
                        }
                      />
                    </View>

                    <View style={s.settingTextWrap}>
                      <Text style={s.settingLabel}>{setting.label}</Text>
                      <Text style={s.settingDesc}>{setting.description}</Text>
                    </View>

                    <Switch
                      value={setting.enabled}
                      onValueChange={() =>
                        updateSettings.mutate({ [setting.id]: !setting.enabled })
                      }
                      trackColor={{ false: '#E5E7EB', true: BRAND }}
                      thumbColor="#fff"
                      ios_backgroundColor="#E5E7EB"
                      disabled={isDisabled}
                    />
                  </View>
                </View>
              );
            })
          : null}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <View style={s.header}>
        <Pressable style={s.backBtn} onPress={() => router.back()} hitSlop={10}>
          {({ pressed }) => (
            <Ionicons
              name="chevron-back"
              size={24}
              color={TEXT_PRIMARY}
              style={{ opacity: pressed ? 0.5 : 1 }}
            />
          )}
        </Pressable>

        <View style={s.headerTextWrap}>
          <Text style={s.headerTitle}>Notifications</Text>
          <Text style={s.headerSubtitle}>Orders, payments, and updates</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }: ListRenderItemInfo<NotificationItem>) => (
            <NotifRow
              item={item}
              onPress={(id, route) => {
                if (!item.read) {
                  markRead.mutate(id);
                }

                if (route) {
                  router.push(route as any);
                }
              }}
            />
          )}
          ItemSeparatorComponent={() => <View style={s.rowSeparator} />}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <View style={s.empty}>
              <View style={s.emptyIconWrap}>
                <Ionicons name="notifications-outline" size={34} color={BRAND} />
              </View>
              <Text style={s.emptyTitle}>No notifications yet</Text>
              <Text style={s.emptyBody}>
                When orders move, payments complete, or new marketplace alerts arrive, they’ll show up here.
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
              tintColor={BRAND}
              colors={[BRAND]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DIVIDER,
  },
  headerTextWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_PRIMARY,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8C7482',
    marginTop: 2,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 56,
  },
  heroCard: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DIVIDER,
    paddingHorizontal: 18,
    paddingVertical: 18,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  heroBody: {
    fontSize: 14,
    lineHeight: 20,
    color: TEXT_SECONDARY,
    marginTop: 6,
  },
  markAllBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
    backgroundColor: BRAND_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  markAllBtnPressed: {
    opacity: 0.8,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: BRAND,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: TEXT_PRIMARY,
  },
  sectionCaption: {
    fontSize: 13,
    color: '#866B79',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: DIVIDER,
    borderRadius: 22,
    position: 'relative',
    shadowColor: '#101828',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 2,
  },
  rowUnread: {
    backgroundColor: '#FFF9FC',
    borderColor: '#F8BDD5',
  },
  rowPressed: {
    opacity: 0.88,
  },
  rowSeparator: {
    height: 14,
  },
  unreadBar: {
    position: 'absolute',
    left: 0,
    top: 12,
    bottom: 12,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: BRAND,
  },
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    flexShrink: 0,
  },
  rowContent: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rowTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
    marginRight: 8,
  },
  rowTitleBold: {
    fontWeight: '700',
    color: '#101828',
  },
  rowMessage: {
    fontSize: 13,
    color: '#667085',
    lineHeight: 20,
    paddingRight: 8,
  },
  rowTimePill: {
    backgroundColor: '#F8F0F4',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  rowTime: {
    fontSize: 11,
    color: '#8A8390',
    flexShrink: 0,
  },
  chevron: {
    marginLeft: 8,
    flexShrink: 0,
    marginTop: 12,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 56,
    paddingHorizontal: 26,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: DIVIDER,
  },
  emptyIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: BRAND_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 21,
  },
  footerWrap: {
    marginTop: 22,
    gap: 14,
    marginBottom: 26,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DIVIDER,
    overflow: 'hidden',
    shadowColor: '#101828',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  settingsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  settingsSubtitle: {
    fontSize: 12,
    color: '#8C7482',
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  settingRowDimmed: {
    opacity: 0.4,
  },
  settingIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  settingTextWrap: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_PRIMARY,
  },
  settingDesc: {
    fontSize: 12,
    color: TEXT_TERTIARY,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#F2EDF0',
  },
});
