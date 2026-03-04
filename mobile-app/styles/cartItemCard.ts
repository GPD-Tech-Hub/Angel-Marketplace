import { StyleSheet } from 'react-native';

export const cartItemCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
  },

  // ── Image ──────────────────────────────────────────
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginRight: 12,
    flexShrink: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },

  // ── Details ────────────────────────────────────────
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 24, // space for the × button
  },
  productName: {
    fontWeight: '600',
    color: '#111827',
    lineHeight: 20,
    marginBottom: 2,
  },
  variantText: {
    color: '#9CA3AF',
    fontWeight: '400',
    marginBottom: 4,
  },
  priceText: {
    fontWeight: '700',
    color: '#F43F5E',
    marginBottom: 8,
  },

  // ── Bottom row: stepper + total ────────────────────
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontWeight: '600',
    color: '#111827',
    minWidth: 28,
    textAlign: 'center',
  },
  itemTotal: {
    fontWeight: '700',
    color: '#111827',
  },

  // ── Delete (×) ─────────────────────────────────────
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
