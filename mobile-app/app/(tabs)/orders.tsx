import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OrderItemCard } from '@/components/orders/OrderItemCard';
import { LeaveReviewModal } from '@/components/orders/LeaveReviewModal';
import { useOrders, useLeaveReview } from '@/queries';
import { useAuthStore } from '@/store';
import { config } from '@/constants/config';
import { colors } from '@/constants/colors';
import type { Order } from '@/types';

type TabId = 'ongoing' | 'completed';

const TABS: { id: TabId; label: string }[] = [
  { id: 'ongoing',   label: 'Ongoing'   },
  { id: 'completed', label: 'Completed' },
];

function orderToCard(order: Order & { reviews?: { rating: number }[] }) {
  const items     = order.items ?? [];
  const firstItem = items[0];
  const rating    = order.reviews?.[0]?.rating;

  // Collect one image per item for the thumbnail strip
  const images = items.map((item) => {
    const uri = item.product?.images?.[0] || config.IMAGE_PLACEHOLDER;
    return { uri };
  });

  const firstImageUri = firstItem?.product?.images?.[0] || config.IMAGE_PLACEHOLDER;

  return {
    id:          order.id,
    orderId:     order.id,
    orderNumber: (order as any).orderNumber ?? `#${order.id.slice(-8).toUpperCase()}`,
    createdAt:   (order as any).createdAt ?? '',
    itemCount:   items.length,
    productName: firstItem?.product?.name ?? 'Order',
    size:        '-',
    price:       (order as any).total ?? items.reduce((s, i) => s + i.price * i.quantity, 0),
    status:      order.status,
    image:       { uri: firstImageUri },
    images,
    rating:      rating != null ? Number(rating) : undefined,
  };
}

export default function OrdersScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab]           = useState<TabId>('ongoing');
  const [reviewVisible, setReviewVisible]   = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [refreshing, setRefreshing]         = useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data, isLoading, isError, refetch } = useOrders({ enabled: isAuthenticated });
  const leaveReviewMutation = useLeaveReview();

  const allOrders = useMemo(() => {
    return (data?.pages ?? []).flatMap((p) => p.data ?? []);
  }, [data]);

  const ongoing   = useMemo(() => allOrders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'), [allOrders]);
  const completed = useMemo(() => allOrders.filter((o) => o.status === 'DELIVERED'), [allOrders]);

  const cards = useMemo(() => {
    const list = activeTab === 'ongoing' ? ongoing : completed;
    return list.map((order) => orderToCard(order as Order & { reviews?: { rating: number }[] }));
  }, [activeTab, ongoing, completed]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await refetch(); } finally { setRefreshing(false); }
  }, [refetch]);

  const handleTrackOrder  = (orderId: string) => router.push(`/order/${orderId}` as any);
  const handleLeaveReview = (orderId: string) => { setSelectedOrderId(orderId); setReviewVisible(true); };
  const handleCloseModal  = () => { setReviewVisible(false); setSelectedOrderId(null); };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!selectedOrderId) return;
    try {
      await leaveReviewMutation.mutateAsync({ orderId: selectedOrderId, rating, comment });
      refetch();
    } catch { /* modal stays open */ }
  };

  // ── Not authenticated ──────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={s.screen} edges={['top']}>
        <Header />
        <View style={s.center}>
          <Ionicons name="receipt-outline" size={60} color="#E5E7EB" />
          <Text style={s.emptyTitle}>Sign in to see your orders</Text>
          <Pressable style={s.shopBtn} onPress={() => router.push('/(tabs)/shop' as any)}>
            <Text style={s.shopBtnText}>Browse Products</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={s.screen} edges={['top']}>
        <Header />
        <Tabs active={activeTab} onChange={setActiveTab} counts={{ ongoing: 0, completed: 0 }} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <SafeAreaView style={s.screen} edges={['top']}>
        <Header />
        <View style={s.center}>
          <Ionicons name="alert-circle-outline" size={52} color="#EF4444" />
          <Text style={s.emptyTitle}>Failed to load orders</Text>
          <Pressable style={s.shopBtn} onPress={() => refetch()}>
            <Text style={s.shopBtnText}>Try Again</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <Header />

      <Tabs
        active={activeTab}
        onChange={setActiveTab}
        counts={{ ongoing: ongoing.length, completed: completed.length }}
      />

      {cards.length === 0 ? (
        <View style={s.center}>
          <Ionicons name="receipt-outline" size={64} color="#E5E7EB" />
          <Text style={s.emptyTitle}>
            {activeTab === 'ongoing' ? 'No ongoing orders' : 'No completed orders'}
          </Text>
          <Text style={s.emptySubtitle}>
            {activeTab === 'ongoing'
              ? 'Orders you place will appear here'
              : 'Delivered orders will appear here'}
          </Text>
          {activeTab === 'ongoing' && (
            <Pressable style={s.shopBtn} onPress={() => router.push('/(tabs)/shop' as any)}>
              <Text style={s.shopBtnText}>Start Shopping</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brand}
              colors={[colors.brand]}
            />
          }
          renderItem={({ item: card }) => (
            <OrderItemCard
              id={card.id}
              orderId={card.orderId}
              orderNumber={card.orderNumber}
              createdAt={card.createdAt}
              itemCount={card.itemCount}
              productName={card.productName}
              size={card.size}
              price={card.price}
              status={card.status}
              image={card.image}
              images={card.images}
              isCompleted={activeTab === 'completed'}
              rating={card.rating}
              onPress={() => handleTrackOrder(card.orderId)}
              onTrackOrder={() => handleTrackOrder(card.orderId)}
              onLeaveReview={() => handleLeaveReview(card.orderId)}
            />
          )}
        />
      )}

      <LeaveReviewModal
        visible={reviewVisible}
        onClose={handleCloseModal}
        onSubmit={(rating, review) => {
          handleReviewSubmit(rating, review);
          handleCloseModal();
        }}
        orderId={selectedOrderId || undefined}
      />
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Header() {
  const router = useRouter();
  return (
    <View style={s.header}>
      <Pressable onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
        {({ pressed }) => (
          <Ionicons name="chevron-back" size={24} color="#111827" style={{ opacity: pressed ? 0.6 : 1 }} />
        )}
      </Pressable>
      <Text style={s.headerTitle}>My Orders</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

function Tabs({
  active,
  onChange,
  counts,
}: {
  active: TabId;
  onChange: (t: TabId) => void;
  counts: Record<TabId, number>;
}) {
  return (
    <View style={s.tabBar}>
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <Pressable key={tab.id} style={s.tabItem} onPress={() => onChange(tab.id)}>
            <View style={[s.tab, isActive && s.tabActive]}>
              <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>
                {tab.label}
              </Text>
              {counts[tab.id] > 0 && (
                <View style={[s.tabBadge, isActive ? s.tabBadgeActive : s.tabBadgeInactive]}>
                  <Text style={[s.tabBadgeText, isActive && s.tabBadgeTextActive]}>
                    {counts[tab.id]}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F9FAFB' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn:     { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 4,
  },
  tabItem: { flex: 1 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.brand,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabLabelActive: {
    fontWeight: '700',
    color: colors.brand,
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeActive:   { backgroundColor: colors.brand },
  tabBadgeInactive: { backgroundColor: '#E5E7EB' },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  tabBadgeTextActive: { color: '#fff' },

  // List
  list: { padding: 16, gap: 12 },

  // Empty / center states
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyTitle:    { fontSize: 17, fontWeight: '700', color: '#374151', textAlign: 'center', marginTop: 4 },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
  shopBtn: {
    marginTop: 8,
    backgroundColor: colors.brand,
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
  },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
