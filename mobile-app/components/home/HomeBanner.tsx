import React from 'react';
import { View, Pressable, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { homeBannerStyles as styles } from '@/styles/homeBanner';

type Props = {
  source: any;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

export function HomeBanner({ source, onPress, containerStyle }: Props) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <Image
            source={source}
            style={[styles.image, { opacity: pressed ? 0.95 : 1 }]}
            contentFit="cover"
          />
        )}
      </Pressable>
    </View>
  );
}

export default HomeBanner;

