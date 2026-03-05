import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  useWindowDimensions,
  StyleProp,
  ViewStyle,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { homeBannerStyles as styles } from '@/styles/homeBanner';
import { colors } from '@/constants/colors';
import type { Ad } from '@/queries/useAds';

type Props = {
  ads: Ad[];
  containerStyle?: StyleProp<ViewStyle>;
};

function resolveAdUrl(ad: Ad): string | null {
  switch (ad.destinationType) {
    case 'custom':
      return ad.customUrl ?? null;
    case 'category':
      return ad.categorySlug ? `/category/${ad.categorySlug}` : null;
    case 'search':
      return ad.searchQuery ? `/(tabs)/search?q=${encodeURIComponent(ad.searchQuery)}` : null;
    case 'product':
      return ad.productId ? `/product/${ad.productId}` : null;
    default:
      return null;
  }
}

export function HomeBanner({ ads, containerStyle }: Props) {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleAdPress = useCallback(
    (ad: Ad) => {
      const url = resolveAdUrl(ad);
      if (!url) return;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        Linking.openURL(url).catch(() => {});
      } else {
        router.push(url as any);
      }
    },
    [router]
  );

  const scrollTo = useCallback(
    (index: number) => {
      scrollRef.current?.scrollTo({ x: index * width, animated: true });
      setActiveIndex(index);
    },
    [width]
  );

  // Auto-advance every 5 s (same as PHP site)
  useEffect(() => {
    if (ads.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % ads.length;
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [ads.length, width]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / width);
      setActiveIndex(Math.min(idx, ads.length - 1));
    },
    [width, ads.length]
  );

  const prev = () => scrollTo(activeIndex === 0 ? ads.length - 1 : activeIndex - 1);
  const next = () => scrollTo(activeIndex === ads.length - 1 ? 0 : activeIndex + 1);

  if (ads.length === 0) return null;

  // Single ad — plain pressable image
  if (ads.length === 1) {
    const ad = ads[0];
    return (
      <View style={[styles.container, containerStyle]}>
        <Pressable onPress={() => handleAdPress(ad)}>
          {({ pressed }) => (
            <Image
              source={ad.image ? { uri: ad.image } : undefined}
              style={[styles.image, { opacity: pressed ? 0.93 : 1 }]}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          )}
        </Pressable>
      </View>
    );
  }

  // Multiple ads — auto-rotating carousel
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={{ borderRadius: 18, overflow: 'hidden' }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
          // Pause auto-play while user is manually swiping
          onScrollBeginDrag={() => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
          }}
        >
          {ads.map((ad, i) => (
            <Pressable
              key={ad.id}
              onPress={() => handleAdPress(ad)}
              style={{ width }}
            >
              {({ pressed }) => (
                <Image
                  source={ad.image ? { uri: ad.image } : undefined}
                  style={[styles.image, { width, opacity: pressed ? 0.93 : 1 }]}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              )}
            </Pressable>
          ))}
        </ScrollView>

        {/* Prev / Next arrows */}
        <Pressable
          onPress={prev}
          hitSlop={10}
          style={{
            position: 'absolute',
            left: 10,
            top: '50%',
            marginTop: -16,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(0,0,0,0.35)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="chevron-back" size={18} color="#fff" />
        </Pressable>
        <Pressable
          onPress={next}
          hitSlop={10}
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            marginTop: -16,
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(0,0,0,0.35)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </Pressable>

        {/* Dot indicators */}
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {ads.map((_, i) => (
            <Pressable key={i} onPress={() => scrollTo(i)} hitSlop={6}>
              <View
                style={{
                  height: 6,
                  width: i === activeIndex ? 20 : 6,
                  borderRadius: 3,
                  backgroundColor: i === activeIndex ? '#fff' : 'rgba(255,255,255,0.5)',
                  marginHorizontal: 3,
                }}
              />
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

export default HomeBanner;
