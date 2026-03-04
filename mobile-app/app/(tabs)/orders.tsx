import { colors } from '@/constants/colors';
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OrderItemCard } from '@/components/orders/OrderItemCard';
import { OrderStatusTabs } from '@/components/orders/OrderStatusTabs';
import { EmptyOrders } from '@/components/orders/EmptyOrders';
import { LeaveReviewModal } from '@/components/orders/LeaveReviewModal';
import { ordersScreenStyles as styles } from '@/styles/ordersScreen';
import { useOrders, useLeaveReview } from '@/queries';
import { useAuthStore } from '@/store';
import { config } from '@/constants/config';
import type { Order, OrderItem } from '@/types';

type OrderStatus = 'ongoing' | 'completed';

function orderItemToCard(
  order: Order & { reviews?: { rating: number }[] },
  item: OrderItem,
  index: number
): { id: string; productName: string; size: string; price: number; status: string; image: any; rating?: number } {
  const imageUri = item.product?.images?.[0] || config.IMAGE_PLACEHOLDER;
  const rating = order.reviews?.[0]?.rating;
  return {
    id: `${order.id}-${item.id}-${index}`,
    productName: item.product?.name ?? 'Product',
    size: '-',
    price: item.price * item.quantity,
    status: order.status,
    image: typeof imageUri === 'string' ? { uri: imageUri } : imageUri,
    rating: rating != null ? Number(rating) : undefined,
  };
}

export default function OrdersScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  const [activeTab, setActiveTab] = useState<OrderStatus>('ongoing');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data, isLoading, isError, refetch } = useOrders({ enabled: isAuthenticated });
  const leaveReviewMutation = useLeaveReview();

  const allOrders = useMemo(() => {
    const pages = data?.pages ?? [];
    return pages.flatMap((p) => p.data ?? []);
  }, [data]);

  const ongoingOrders = useMemo(
    () => allOrders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'),
    [allOrders]
  );
  const completedOrders = useMemo(
    () => allOrders.filter((o) => o.status === 'DELIVERED'),
    [allOrders]
  );

  const cards = useMemo(() => {
    const list = activeTab === 'ongoing' ? ongoingOrders : completedOrders;
    return list.flatMap((order) =>
      (order.items ?? []).map((item, i) => orderItemToCard(order as Order & { reviews?: { rating: number }[] }, item, i))
    );
  }, [activeTab, ongoingOrders, completedOrders]);

  const hasOrders = cards.length > 0;

  const handleTrackOrder = (orderId: string) => {
    const baseId = orderId.split('-')[0];
    if (baseId) router.push(`/order/${baseId}`);
  };

  const handleLeaveReview = (orderId: string) => {
    const baseId = orderId.split('-')[0];
    if (baseId) setSelectedOrderId(baseId);
    setReviewModalVisible(true);
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!selectedOrderId) return;
    try {
      await leaveReviewMutation.mutateAsync({ orderId: selectedOrderId, rating, comment });
      refetch();
    } catch (err: any) {
      // Modal stays open on error so user can retry
      console.error('Review submission failed:', err);
    }
  };

  const handleCloseModal = () => {
    setReviewModalVisible(false);
    setSelectedOrderId(null);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </Pressable>
          <Text style={[styles.headerTitle, { fontSize: Math.round(20 * scale) }]}>My Orders</Text>
          <View style={styles.headerSpacer} />
        </View>
        <EmptyOrders status="ongoing" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
          {({ pressed }) => (
            <Ionicons name="chevron-back" size={24} color="#111827" style={{ opacity: pressed ? 0.7 : 1 }} />
          )}
        </Pressable>
        <Text style={[styles.headerTitle, { fontSize: Math.round(20 * scale) }]}>My Orders</Text>
        <View style={styles.headerSpacer} />
      </View>

      <OrderStatusTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : isError ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#6B7280', marginBottom: 12 }}>Failed to load orders</Text>
          <Pressable onPress={() => refetch()}>
            <Text style={{ color: '#F43F5E' }}>Try again</Text>
          </Pressable>
        </View>
      ) : hasOrders ? (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {cards.map((card) => (
            <OrderItemCard
              key={card.id}
              id={card.id}
              productName={card.productName}
              size={card.size}
              price={card.price}
              status={card.status}
              image={card.image}
              isCompleted={activeTab === 'completed'}
              rating={card.rating}
              onTrackOrder={() => handleTrackOrder(card.id)}
              onLeaveReview={() => handleLeaveReview(card.id)}
            />
          ))}
        </ScrollView>
      ) : (
        <EmptyOrders status={activeTab} />
      )}

      <LeaveReviewModal
        visible={reviewModalVisible}
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
