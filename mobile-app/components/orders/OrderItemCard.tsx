import React from 'react';
import { View, Text, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { orderItemCardStyles as styles } from '@/styles/orderItemCard';

interface OrderItemCardProps {
  id: string;
  productName: string;
  size: string;
  price: number;
  status: string;
  image: any; // require() path for image
  isCompleted?: boolean;
  rating?: number; // Optional rating (e.g., 4.5)
  onTrackOrder?: () => void;
  onLeaveReview?: () => void;
}

export function OrderItemCard({
  id,
  productName,
  size,
  price,
  status,
  image,
  isCompleted = false,
  rating,
  onTrackOrder,
  onLeaveReview,
}: OrderItemCardProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  const handleTrackOrder = () => {
    if (onTrackOrder) {
      onTrackOrder();
    } else {
      // Default: navigate to order details
      router.push(`/order/${id}`);
    }
  };

  const handleLeaveReview = () => {
    if (onLeaveReview) {
      onLeaveReview();
    } else {
      // TODO: Navigate to review screen
      console.log('Leave review for order:', id);
    }
  };

  return (
    <View style={styles.card}>
      {/* Product Image */}
      <Image
        source={image}
        style={[
          styles.productImage,
          { width: Math.round(80 * scale), height: Math.round(80 * scale) },
        ]}
        contentFit="cover"
      />

      {/* Product Details */}
      <View style={styles.detailsContainer}>
        {/* Product Name Row with Status Tag */}
        <View style={styles.productNameRow}>
          <Text
            style={[styles.productName, { fontSize: Math.round(16 * scale) }]}
            numberOfLines={1}
          >
            {productName}
          </Text>
          <View style={[
            styles.statusTag,
            isCompleted && styles.statusTagCompleted
          ]}>
            <Text style={[
              styles.statusText,
              isCompleted && styles.statusTextCompleted,
              { fontSize: Math.round(12 * scale) }
            ]}>
              {status}
            </Text>
          </View>
        </View>

        {/* Size */}
        <Text style={[styles.sizeText, { fontSize: Math.round(14 * scale) }]}>
          Size {size}
        </Text>

        {/* Price Row with Action (Track Order / Leave Review / Rating) */}
        <View style={styles.priceRow}>
          <Text style={[styles.priceText, { fontSize: Math.round(18 * scale) }]}>
            ${price}
          </Text>
          {isCompleted ? (
            rating ? (
              // Show rating if exists
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FBBF24" />
                <Text style={[styles.ratingText, { fontSize: Math.round(14 * scale), marginLeft: 4 }]}>
                  {rating}/5
                </Text>
              </View>
            ) : (
              // Show Leave Review button if no rating
              <Pressable
                style={styles.trackButton}
                onPress={handleLeaveReview}
              >
                {({ pressed }) => (
                  <View
                    style={[
                      styles.trackButtonInner,
                      { opacity: pressed ? 0.9 : 1 },
                      { paddingVertical: Math.round(10 * scale), paddingHorizontal: Math.round(16 * scale) },
                    ]}
                  >
                    <Text
                      style={[styles.trackButtonText, { fontSize: Math.round(14 * scale) }]}
                    >
                      Leave Review
                    </Text>
                  </View>
                )}
              </Pressable>
            )
          ) : (
            // Show Track Order for ongoing orders
            <Pressable
              style={styles.trackButton}
              onPress={handleTrackOrder}
            >
              {({ pressed }) => (
                <View
                  style={[
                    styles.trackButtonInner,
                    { opacity: pressed ? 0.9 : 1 },
                    { paddingVertical: Math.round(10 * scale), paddingHorizontal: Math.round(16 * scale) },
                  ]}
                >
                  <Text
                    style={[styles.trackButtonText, { fontSize: Math.round(14 * scale) }]}
                  >
                    Track Order
                  </Text>
                </View>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
