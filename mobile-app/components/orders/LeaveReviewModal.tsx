import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { leaveReviewModalStyles as styles } from '@/styles/leaveReviewModal';

interface LeaveReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
  orderId?: string;
}

export function LeaveReviewModal({
  visible,
  onClose,
  onSubmit,
  orderId,
}: LeaveReviewModalProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');

  const handleStarPress = (starIndex: number) => {
    setRating(starIndex + 1);
  };

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, reviewText);
      // Reset form
      setRating(0);
      setReviewText('');
      onClose();
    }
  };

  const isSubmitDisabled = rating === 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.overlay} onPress={onClose} />
        <View
          style={[
            styles.modalContent,
            {
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { fontSize: Math.round(20 * scale) }]}>
              Leave a Review
            </Text>
            <Pressable
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={10}
            >
              <Ionicons name="close" size={24} color="#111827" />
            </Pressable>
          </View>

          {/* Question */}
          <Text style={[styles.question, { fontSize: Math.round(18 * scale) }]}>
            How was your order?
          </Text>

          {/* Instructions */}
          <Text style={[styles.instructions, { fontSize: Math.round(14 * scale) }]}>
            Please give your rating and also your review.
          </Text>

          {/* Star Rating */}
          <View style={styles.starContainer}>
            {[0, 1, 2, 3, 4].map((index) => (
              <Pressable
                key={index}
                onPress={() => handleStarPress(index)}
                hitSlop={8}
                style={index < 4 ? styles.starButton : undefined}
              >
                <Ionicons
                  name={index < rating ? 'star' : 'star-outline'}
                  size={32}
                  color={index < rating ? '#F59E0B' : '#D1D5DB'}
                />
              </Pressable>
            ))}
          </View>

          {/* Review Text Input */}
          <TextInput
            style={[
              styles.reviewInput,
              { fontSize: Math.round(14 * scale) },
            ]}
            placeholder="Write your review..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            value={reviewText}
            onChangeText={setReviewText}
            textAlignVertical="top"
          />

          {/* Submit Button */}
          <Pressable
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.submitButtonInner,
                  isSubmitDisabled && styles.submitButtonDisabled,
                  { opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <Text
                  style={[
                    styles.submitButtonText,
                    { fontSize: Math.round(16 * scale) },
                  ]}
                >
                  Submit
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
