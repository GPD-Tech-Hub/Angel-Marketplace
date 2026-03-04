import React from 'react';
import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types';
import { formatCurrency, resolvePrice, calculateDiscountPercentage } from '@/utils';
import { useFavorites } from '@/hooks';
import { useCurrencyStore } from '@/store/currencyStore';
import { colors } from '@/constants/colors';
import { config } from '@/constants/config';

const SCREEN_W = Dimensions.get('window').width;
// 2-col grid: 16pt side padding, 10pt gap
const CARD_W = (SCREEN_W - 16 * 2 - 10) / 2;

interface ProductCardProps {
  product: Product;
  width?: number;
}

export function ProductCard({ product, width = CARD_W }: ProductCardProps) {
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { currency } = useCurrencyStore();
  const { price: displayPrice, resolvedCurrency } = resolvePrice(product.prices, product.price, currency.code);
  const isLiked      = isFavorite(product.id);
  const hasDiscount  = product.comparePrice && product.comparePrice > product.price;
  const discountPct  = hasDiscount
    ? calculateDiscountPercentage(product.comparePrice!, product.price)
    : 0;
  const imgH         = Math.round(width * 1.15);
  const imageUri     = product.images?.[0] || config.IMAGE_PLACEHOLDER;
  const outOfStock   = product.stock === 0;
  const lowStock     = !outOfStock && product.stock > 0 && product.stock <= 5;

  return (
    <Pressable
      style={[s.card, { width }]}
      onPress={() => !outOfStock && router.push(`/product/${product.slug}` as any)}
      android_ripple={{ color: colors.gray[100], borderless: false }}
    >
      {({ pressed }) => (
        <View style={{ opacity: pressed ? 0.96 : 1 }}>

          {/* ── Image ── */}
          <View style={[s.imgWrap, { height: imgH }]}>
            <Image
              source={{ uri: imageUri }}
              style={s.img}
              contentFit="cover"
              cachePolicy="memory-disk"
            />

            {/* Overlay when out of stock */}
            {outOfStock && <View style={s.stockOverlay} />}

            {/* Discount badge — top-left */}
            {hasDiscount && (
              <View style={s.discountBadge}>
                <Text style={s.discountText}>-{discountPct}%</Text>
              </View>
            )}

            {/* Heart — top-right */}
            <Pressable
              style={s.heartBtn}
              onPress={(e) => { e.stopPropagation(); toggleFavorite(product); }}
              hitSlop={8}
            >
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={16}
                color={isLiked ? colors.brand : colors.gray[400]}
              />
            </Pressable>
          </View>

          {/* ── Info ── */}
          <View style={s.info}>
            <Text style={s.name} numberOfLines={2}>{product.name}</Text>

            {/* Price row */}
            <View style={s.priceRow}>
              <Text style={[s.price, outOfStock && s.priceMuted]}>
                {formatCurrency(displayPrice, resolvedCurrency)}
              </Text>
              {hasDiscount && (
                <Text style={s.comparePrice}>
                  {formatCurrency(product.comparePrice!, resolvedCurrency)}
                </Text>
              )}
            </View>

            {/* Rating + stock row */}
            <View style={s.metaRow}>
              {product.rating != null && product.rating > 0 ? (
                <View style={s.ratingWrap}>
                  <Ionicons name="star" size={10} color="#FBBF24" />
                  <Text style={s.ratingText}>{product.rating.toFixed(1)}</Text>
                </View>
              ) : (
                <View />
              )}

              {outOfStock ? (
                <Text style={s.badgeOut}>Sold out</Text>
              ) : lowStock ? (
                <Text style={s.badgeLow}>{product.stock} left</Text>
              ) : null}
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray[100],
    marginBottom: 10,
  },

  // Image
  imgWrap: {
    width: '100%',
    backgroundColor: colors.gray[100],
  },
  img: {
    width: '100%',
    height: '100%',
  },
  stockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },

  // Discount badge
  discountBadge: {
    position: 'absolute',
    top: 8, left: 8,
    backgroundColor: colors.brand,
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.3,
  },

  // Heart
  heartBtn: {
    position: 'absolute',
    top: 8, right: 8,
    width: 30, height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray[100],
  },

  // Info
  info: {
    paddingHorizontal: 10, paddingTop: 8, paddingBottom: 10,
  },
  name: {
    fontSize: 13, fontWeight: '600', color: colors.gray[800],
    lineHeight: 17, marginBottom: 5,
  },
  priceRow: {
    flexDirection: 'row', alignItems: 'baseline', gap: 5, marginBottom: 5,
  },
  price: {
    fontSize: 15, fontWeight: '800', color: colors.gray[900],
  },
  priceMuted: {
    color: colors.gray[400],
  },
  comparePrice: {
    fontSize: 11, color: colors.gray[400], textDecorationLine: 'line-through',
  },

  // Meta row
  metaRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  ratingWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  ratingText: {
    fontSize: 11, fontWeight: '600', color: colors.gray[500],
  },

  // Stock badges
  badgeOut: {
    fontSize: 10, fontWeight: '700', color: colors.error,
    backgroundColor: '#FEF2F2', borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  badgeLow: {
    fontSize: 10, fontWeight: '700', color: '#92400E',
    backgroundColor: '#FEF3C7', borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
  },
});

export default ProductCard;
