import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OrderItemCard } from '@/components/orders/OrderItemCard';
import { OrderStatusTabs } from '@/components/orders/OrderStatusTabs';
import { EmptyOrders } from '@/components/orders/EmptyOrders';
import { LeaveReviewModal } from '@/components/orders/LeaveReviewModal';
import { ordersScreenStyles as styles } from '@/styles/ordersScreen';

type OrderStatus = 'ongoing' | 'completed';

interface Order {
  id: string;
  productName: string;
  size: string;
  price: number;
  status: string;
  image: any;
  rating?: number; // Optional rating for completed orders
}

// Mock data for orders
const MOCK_ONGOING_ORDERS: Order[] = [
  {
    id: '1',
    productName: 'Premium Jacket',
    size: 'M',
    price: 90,
    status: 'In Transit',
    image: require('../../assets/image/image 1.jpg'),
  },
  {
    id: '2',
    productName: 'Premium Jacket',
    size: 'M',
    price: 90,
    status: 'In Transit',
    image: require('../../assets/image/image 1.jpg'),
  },
  {
    id: '3',
    productName: 'Premium Jacket',
    size: 'M',
    price: 90,
    status: 'In Transit',
    image: require('../../assets/image/image 1.jpg'),
  },
  {
    id: '4',
    productName: 'Premium Jacket',
    size: 'M',
    price: 90,
    status: 'In Transit',
    image: require('../../assets/image/image 1.jpg'),
  },
  {
    id: '5',
    productName: 'Premium Jacket',
    size: 'M',
    price: 90,
    status: 'In Transit',
    image: require('../../assets/image/image 1.jpg'),
  },
];

const MOCK_COMPLETED_ORDERS: Order[] = [
  {
    id: '6',
    productName: 'Premium Jacket',
    size: 'M',
    price: 90,
    status: 'Completed',
    image: require('../../assets/image/image 1.jpg'),
    // No rating - will show "Leave Review" button
  },
  {
    id: '7',
    productName: 'Premium Jacket',
    size: 'M',
    price: 90,
    status: 'Completed',
    image: require('../../assets/image/image 1.jpg'),
    rating: 4.5, // Has rating - will show star rating
  },
  {
    id: '8',
    productName: 'Premium Jacket',
    size: 'M',
    price: 90,
    status: 'Completed',
    image: require('../../assets/image/image 1.jpg'),
    // No rating - will show "Leave Review" button
  },
  {
    id: '9',
    productName: 'Premium Jacket',
    size: 'M',
    price: 90,
    status: 'Completed',
    image: require('../../assets/image/image 1.jpg'),
    rating: 3.5, // Has rating - will show star rating
  },
];

// Flag to toggle between mock data and empty state
const USE_MOCK_DATA = true;

export default function OrdersScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  const [activeTab, setActiveTab] = useState<OrderStatus>('ongoing');
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const orders = activeTab === 'ongoing' ? MOCK_ONGOING_ORDERS : MOCK_COMPLETED_ORDERS;
  const hasOrders = USE_MOCK_DATA && orders.length > 0;

  const handleTrackOrder = (orderId: string) => {
    router.push(`/order/${orderId}`);
  };

  const handleLeaveReview = (orderId: string) => {
    setSelectedOrderId(orderId);
    setReviewModalVisible(true);
  };

  const handleReviewSubmit = (rating: number, review: string) => {
    // TODO: Submit review to backend
    console.log('Review submitted:', {
      orderId: selectedOrderId,
      rating,
      review,
    });
    
    // Update the order in mock data to show rating
    // In a real app, this would update the backend and refresh the data
    // For now, we'll just close the modal
  };

  const handleCloseModal = () => {
    setReviewModalVisible(false);
    setSelectedOrderId(null);
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
          My Orders
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Order Status Tabs */}
      <OrderStatusTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      {hasOrders ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {orders.map((order) => (
            <OrderItemCard
              key={order.id}
              id={order.id}
              productName={order.productName}
              size={order.size}
              price={order.price}
              status={order.status}
              image={order.image}
              isCompleted={activeTab === 'completed'}
              rating={order.rating}
              onTrackOrder={() => handleTrackOrder(order.id)}
              onLeaveReview={() => handleLeaveReview(order.id)}
            />
          ))}
        </ScrollView>
      ) : (
        <EmptyOrders status={activeTab} />
      )}

      {/* Leave Review Modal */}
      <LeaveReviewModal
        visible={reviewModalVisible}
        onClose={handleCloseModal}
        onSubmit={handleReviewSubmit}
        orderId={selectedOrderId || undefined}
      />
    </SafeAreaView>
  );
}
