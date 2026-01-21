import { StyleSheet } from 'react-native';

export const trendingProductCardStyles = StyleSheet.create({
  card: {
    flex: 1,
    marginBottom: 14,
  },
  imageWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  favButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favIcon: {
    width: 18,
    height: 18,
  },
  name: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
  },
  metaRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F43F5E',
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#737373',
    fontWeight: '500',
  },
});

