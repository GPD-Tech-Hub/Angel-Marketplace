import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ListRenderItemInfo,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useProduct, useAddCartItem, useCartQuery } from '@/queries';
import { useCart, useFavorites } from '@/hooks';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, calculateDiscountPercentage } from '@/utils';
import { config } from '@/constants/config';
import { colors } from '@/constants/colors';

const { width: SW } = Dimensions.get('window');
const IMG_H = Math.round(SW * 0.9);

export default function ProductDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { data: product, isLoading, error, refetch: refetchProduct } = useProduct(slug);
  const { addToCart, isInCart: localIsInCart, getItemQuantity: localGetQty } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const addCartItemMutation = useAddCartItem();

  // API cart — only fetched when authenticated
  const { data: apiCart, refetch: refetchCart } = useCartQuery({ enabled: isAuthenticated });

  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const flatRef = useRef<FlatList>(null);

  // ── Cart status: always read from the correct source ────────────
  const inCart = product
    ? isAuthenticated
      ? (apiCart?.items ?? []).some((i) => i.productId === product.id)
      : localIsInCart(product.id)
    : false;

  const cartQty = product
    ? isAuthenticated
      ? (apiCart?.items ?? [])
          .filter((i) => i.productId === product.id)
          .reduce((sum, i) => sum + i.quantity, 0)
      : localGetQty(product.id)
    : 0;

  const isLiked    = product ? isFavorite(product.id) : false;
  const hasDiscount = product?.comparePrice && product.comparePrice > product.price;
  const outOfStock  = product ? product.stock === 0 : false;

  const needsSize  = product?.hasSizes && (product.sizes?.length ?? 0) > 0;
  const needsColor = product?.hasColors && (product.colors?.length ?? 0) > 0;
  const variantReady = (!needsSize || selectedSize) && (!needsColor || selectedColor);

  // ── Pull-to-refresh ─────────────────────────────────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchProduct(),
        isAuthenticated ? refetchCart() : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchProduct, refetchCart, isAuthenticated]);

  // ── Add to cart ─────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!product) return;
    if (!variantReady) {
      Alert.alert('Select options', 'Please select all required options before adding to cart.');
      return;
    }
    setAddingToCart(true);
    try {
      if (isAuthenticated) {
        await addCartItemMutation.mutateAsync({
          productId: product.id,
          quantity,
          size: selectedSize ?? undefined,
          color: selectedColor ?? undefined,
        });
        // refresh cart badge immediately
        await refetchCart();
      } else {
        addToCart(product, quantity);
      }
    } catch {
      Alert.alert('Error', 'Could not add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await handleAddToCart();
    router.push('/checkout');
  };

  // ── Loading ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={[s.screen, s.center]}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    );
  }

  // ── Error ────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <View style={[s.screen, s.center, { paddingHorizontal: 32 }]}>
        <Ionicons name="alert-circle-outline" size={52} color={colors.gray[300]} />
        <Text style={s.errText}>Product not found</Text>
        <Pressable style={s.errBtn} onPress={() => router.back()}>
          <Text style={s.errBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const images        = product.images.length > 0 ? product.images : [config.IMAGE_PLACEHOLDER];
  const rating        = product.rating ?? 0;
  const reviewsCount  = product.reviewsCount ?? 0;
  const reviews       = product.reviews ?? [];
  const features      = product.features ?? [];
  const sizes         = product.sizes ?? [];
  const productColors = product.colors ?? [];

  const ctaDisabled = outOfStock || addingToCart || !variantReady;

  const renderImage = ({ item }: ListRenderItemInfo<string>) => (
    <View style={{ width: SW, height: IMG_H, backgroundColor: '#F7F7F7', alignItems: 'center', justifyContent: 'center' }}>
      <Image
        source={{ uri: item }}
        style={{ width: SW, height: IMG_H }}
        contentFit="contain"
        cachePolicy="memory-disk"
      />
    </View>
  );

  return (
    <View style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.brand}
            colors={[colors.brand]}
          />
        }
      >

        {/* ── Image carousel ──────────────────────────────────── */}
        <View style={{ width: SW, height: IMG_H, backgroundColor: '#F7F7F7' }}>
          <FlatList
            ref={flatRef}
            data={images}
            renderItem={renderImage}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            nestedScrollEnabled
            getItemLayout={(_, i) => ({ length: SW, offset: SW * i, index: i })}
            onMomentumScrollEnd={(e) => {
              const i = Math.round(e.nativeEvent.contentOffset.x / SW);
              setActiveImg(i);
            }}
          />

          {/* Floating back + heart */}
          <View style={[s.overlayRow, { top: insets.top + 10 }]}>
            <Pressable style={s.overlayBtn} onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="chevron-back" size={22} color="#111" />
            </Pressable>
            <Pressable style={s.overlayBtn} onPress={() => toggleFavorite(product)} hitSlop={10}>
              <Ionicons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={21}
                color={isLiked ? colors.brand : '#111'}
              />
            </Pressable>
          </View>

          {/* Dot indicators */}
          {images.length > 1 && (
            <View style={s.dots}>
              {images.map((_, i) => (
                <View key={i} style={i === activeImg ? s.dotActive : s.dot} />
              ))}
            </View>
          )}

          {/* Discount badge */}
          {hasDiscount && (
            <View style={s.badge}>
              <Text style={s.badgeText}>
                -{calculateDiscountPercentage(product.comparePrice!, product.price)}% OFF
              </Text>
            </View>
          )}
        </View>

        {/* ── Thumbnail strip ──────────────────────────────────── */}
        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.thumbStrip}
          >
            {images.map((img, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  setActiveImg(i);
                  flatRef.current?.scrollToIndex({ index: i, animated: true });
                }}
                style={[s.thumb, activeImg === i && s.thumbActive]}
              >
                <Image source={{ uri: img }} style={s.thumbImg} contentFit="cover" cachePolicy="memory-disk" />
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* ── Product info ─────────────────────────────────────── */}
        <View style={s.info}>

          {product.category?.name && (
            <View style={s.chip}>
              <Text style={s.chipText}>{product.category.name.toUpperCase()}</Text>
            </View>
          )}

          <Text style={s.name}>{product.name}</Text>

          {rating > 0 && (
            <View style={s.ratingRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons key={i} name={i < Math.floor(rating) ? 'star' : 'star-outline'} size={14} color="#FBBF24" />
              ))}
              <Text style={s.ratingText}>
                {' '}{rating.toFixed(1)}{reviewsCount > 0 ? ` · ${reviewsCount} reviews` : ''}
              </Text>
            </View>
          )}

          <View style={s.priceRow}>
            <Text style={s.price}>{formatCurrency(product.price)}</Text>
            {hasDiscount && (
              <Text style={s.comparePrice}>{formatCurrency(product.comparePrice!)}</Text>
            )}
          </View>

          <View style={s.divider} />

          <View style={s.stockRow}>
            <View style={[s.stockDot, { backgroundColor: outOfStock ? colors.error : colors.success }]} />
            <Text style={[s.stockText, { color: outOfStock ? colors.error : colors.success }]}>
              {outOfStock ? 'Out of stock' : `In stock · ${product.stock} available`}
            </Text>
          </View>

          {/* Size selector */}
          {needsSize && sizes.length > 0 && (
            <View style={s.variantSection}>
              <Text style={s.variantLabel}>
                Size{selectedSize
                  ? <Text style={{ color: colors.brand, fontWeight: '700' }}> — {selectedSize}</Text>
                  : <Text style={{ color: colors.error }}> *</Text>}
              </Text>
              <View style={s.variantRow}>
                {sizes.map((sz) => (
                  <Pressable
                    key={sz}
                    style={[s.sizePill, selectedSize === sz && s.sizePillActive]}
                    onPress={() => setSelectedSize(sz === selectedSize ? null : sz)}
                  >
                    <Text style={[s.sizePillText, selectedSize === sz && s.sizePillTextActive]}>{sz}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Colour selector */}
          {needsColor && productColors.length > 0 && (
            <View style={s.variantSection}>
              <Text style={s.variantLabel}>
                Colour{selectedColor
                  ? <Text style={{ color: colors.brand, fontWeight: '700' }}> — {selectedColor}</Text>
                  : <Text style={{ color: colors.error }}> *</Text>}
              </Text>
              <View style={s.variantRow}>
                {productColors.map((col) => (
                  <Pressable
                    key={col}
                    style={[s.colorPill, selectedColor === col && s.colorPillActive]}
                    onPress={() => setSelectedColor(col === selectedColor ? null : col)}
                  >
                    <Text style={[s.colorPillText, selectedColor === col && s.colorPillTextActive]}>{col}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Quantity */}
          {!outOfStock && (
            <View style={s.qtyRow}>
              <Text style={s.qtyLabel}>
                Quantity{cartQty > 0 ? `  ·  ${cartQty} in cart` : ''}
              </Text>
              <View style={s.stepper}>
                <Pressable style={s.stepBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))} hitSlop={6}>
                  <Ionicons name="remove" size={18} color={quantity <= 1 ? colors.gray[400] : colors.gray[800]} />
                </Pressable>
                <Text style={s.stepVal}>{quantity}</Text>
                <Pressable
                  style={s.stepBtn}
                  onPress={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  hitSlop={6}
                >
                  <Ionicons name="add" size={18} color={quantity >= product.stock ? colors.gray[400] : colors.gray[800]} />
                </Pressable>
              </View>
            </View>
          )}

          <View style={s.divider} />

          {product.description ? (
            <>
              <Text style={s.sectionTitle}>About this product</Text>
              <Text style={s.description}>{product.description}</Text>
            </>
          ) : null}

          {features.length > 0 && (
            <>
              <View style={s.divider} />
              <Text style={s.sectionTitle}>Specifications</Text>
              <View style={s.specsTable}>
                {features.map((f, i) => (
                  <View key={i} style={[s.specRow, i % 2 === 0 && s.specRowAlt]}>
                    <Text style={s.specKey}>{f.featureName}</Text>
                    <Text style={s.specVal}>{f.featureValue}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {reviews.length > 0 && (
            <>
              <View style={s.divider} />
              <View style={s.reviewsHeader}>
                <Text style={s.sectionTitle}>Reviews</Text>
                <View style={s.ratingBadge}>
                  <Ionicons name="star" size={13} color="#FBBF24" />
                  <Text style={s.ratingBadgeText}>{rating.toFixed(1)} · {reviewsCount}</Text>
                </View>
              </View>
              {reviews.slice(0, 5).map((r) => (
                <View key={r.id} style={s.reviewCard}>
                  <View style={s.reviewTop}>
                    <View style={s.reviewAvatar}>
                      <Text style={s.reviewAvatarText}>
                        {r.user ? r.user.firstName[0].toUpperCase() : '?'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.reviewName}>
                        {r.user ? `${r.user.firstName} ${r.user.lastName}` : 'Anonymous'}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 2, marginTop: 2 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Ionicons key={i} name={i < r.rating ? 'star' : 'star-outline'} size={11} color="#FBBF24" />
                        ))}
                      </View>
                    </View>
                    <Text style={s.reviewDate}>
                      {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  {r.comment ? <Text style={s.reviewComment}>{r.comment}</Text> : null}
                </View>
              ))}
            </>
          )}

          <View style={{ height: 100 + insets.bottom }} />
        </View>
      </ScrollView>

      {/* ── Action bar ──────────────────────────────────────────── */}
      <View style={[s.bar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={[s.btnOutline, ctaDisabled && s.btnOff]}
          onPress={handleAddToCart}
          disabled={ctaDisabled}
        >
          {addingToCart
            ? <ActivityIndicator size="small" color={colors.brand} />
            : <Text style={s.btnOutlineText}>{inCart ? 'Add More' : 'Add to Cart'}</Text>
          }
        </Pressable>
        <Pressable
          style={[s.btnFill, ctaDisabled && s.btnOff]}
          onPress={handleBuyNow}
          disabled={ctaDisabled}
        >
          <Text style={s.btnFillText}>Buy Now</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  center: { alignItems: 'center', justifyContent: 'center' },

  errText:    { fontSize: 16, color: colors.gray[500], textAlign: 'center', marginTop: 12 },
  errBtn:     { marginTop: 20, paddingHorizontal: 28, paddingVertical: 13, backgroundColor: colors.brand, borderRadius: 12 },
  errBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  overlayRow: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16 },
  overlayBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 3 },

  dots:      { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5 },
  dot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.2)' },
  dotActive: { width: 18, height: 6, borderRadius: 3, backgroundColor: colors.brand },

  badge:     { position: 'absolute', bottom: 12, right: 16, backgroundColor: colors.brand, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  thumbStrip:  { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  thumb:       { width: 60, height: 60, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', overflow: 'hidden' },
  thumbActive: { borderColor: colors.brand },
  thumbImg:    { width: '100%', height: '100%' },

  info:     { paddingHorizontal: 20, paddingTop: 20 },
  chip:     { alignSelf: 'flex-start', backgroundColor: '#FFF0F3', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 10 },
  chipText: { fontSize: 11, fontWeight: '700', color: colors.brand, letterSpacing: 0.5 },
  name:     { fontSize: 22, fontWeight: '700', color: '#111827', lineHeight: 30, marginBottom: 10, letterSpacing: -0.3 },

  ratingRow:  { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ratingText: { fontSize: 13, color: colors.gray[500], fontWeight: '500' },

  priceRow:     { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 16 },
  price:        { fontSize: 26, fontWeight: '800', color: colors.brand, letterSpacing: -0.5 },
  comparePrice: { fontSize: 16, color: colors.gray[400], textDecorationLine: 'line-through' },

  divider:  { height: 1, backgroundColor: '#F3F4F6', marginVertical: 16 },

  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 16 },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: 13, fontWeight: '500' },

  variantSection: { marginBottom: 16 },
  variantLabel:   { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 10 },
  variantRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sizePill:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  sizePillActive: { borderColor: colors.brand, backgroundColor: '#FFF0F3' },
  sizePillText:   { fontSize: 13, fontWeight: '600', color: colors.gray[700] },
  sizePillTextActive: { color: colors.brand },
  colorPill:       { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  colorPillActive: { borderColor: colors.brand, backgroundColor: '#FFF0F3' },
  colorPillText:   { fontSize: 13, fontWeight: '600', color: colors.gray[700] },
  colorPillTextActive: { color: colors.brand },

  qtyRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  qtyLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  stepper:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 12, overflow: 'hidden' },
  stepBtn:  { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  stepVal:  { width: 36, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#111827' },

  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  description:  { fontSize: 14, color: colors.gray[500], lineHeight: 22 },

  specsTable: { borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6' },
  specRow:    { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10 },
  specRowAlt: { backgroundColor: '#F9FAFB' },
  specKey:    { flex: 1, fontSize: 13, fontWeight: '600', color: '#374151' },
  specVal:    { flex: 1, fontSize: 13, color: colors.gray[500], textAlign: 'right' },

  reviewsHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  ratingBadge:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  ratingBadgeText:  { fontSize: 12, fontWeight: '700', color: '#92400E' },
  reviewCard:       { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 14, marginBottom: 10 },
  reviewTop:        { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  reviewAvatar:     { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  reviewName:       { fontSize: 13, fontWeight: '700', color: '#111827' },
  reviewDate:       { fontSize: 11, color: colors.gray[400] },
  reviewComment:    { fontSize: 13, color: colors.gray[600], lineHeight: 19 },

  bar:            { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingHorizontal: 20, paddingTop: 12, flexDirection: 'row', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 8 },
  btnOutline:     { flex: 1, height: 50, borderRadius: 14, borderWidth: 1.5, borderColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  btnOutlineText: { fontSize: 15, fontWeight: '700', color: colors.brand },
  btnFill:        { flex: 1, height: 50, borderRadius: 14, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center' },
  btnFillText:    { fontSize: 15, fontWeight: '700', color: '#fff' },
  btnOff:         { opacity: 0.45 },
});
