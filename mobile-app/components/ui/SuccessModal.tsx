import React from 'react';
import { View, Text, Pressable, Modal, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { successModalStyles as styles } from '@/styles/successModal';

type Props = {
  visible: boolean;
  title?: string;
  message: string;
  onContinue: () => void;
  icon?: any; // Image source
};

export function SuccessModal({
  visible,
  title = 'Congratulations!',
  message,
  onContinue,
  icon,
}: Props) {
  const { width } = useWindowDimensions();
  const scale = Math.max(0.9, Math.min(1.0, width / 390));

  // Default success icon - use Check-duotone if no custom icon provided
  const successIcon = icon || require('../../assets/icons/Check-duotone.png');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onContinue}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Success Icon */}
          <Image
            source={successIcon}
            style={[styles.icon, { width: Math.round(80 * scale), height: Math.round(80 * scale) }]}
            contentFit="contain"
          />

          {/* Title */}
          <Text style={[styles.title, { fontSize: Math.round(24 * scale) }]}>
            {title}
          </Text>

          {/* Message */}
          <Text style={[styles.message, { fontSize: Math.round(16 * scale) }]}>
            {message}
          </Text>

          {/* Continue Button */}
          <Pressable
            style={styles.continueButton}
            onPress={onContinue}
          >
            {({ pressed }) => (
              <View
                style={[
                  styles.continueButtonInner,
                  { opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <Text style={[styles.continueButtonText, { fontSize: Math.round(16 * scale) }]}>
                  Continue
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default SuccessModal;
