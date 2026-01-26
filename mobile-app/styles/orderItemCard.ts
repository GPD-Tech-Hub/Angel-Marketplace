import { StyleSheet } from 'react-native';

export const orderItemCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  productName: {
    flex: 1,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  statusTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTagCompleted: {
    backgroundColor: '#10B981', // Light green
  },
  statusText: {
    fontWeight: '500',
    color: '#111827',
  },
  statusTextCompleted: {
    color: '#FFFFFF',
  },
  sizeText: {
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceText: {
    fontWeight: '600',
    color: '#111827',
  },
  trackButton: {
    // Button is now inline with price
  },
  trackButtonInner: {
    backgroundColor: '#F43F5E',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  trackButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontWeight: '500',
    color: '#111827',
  },
});
