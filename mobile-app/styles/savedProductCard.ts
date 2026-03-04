import { StyleSheet } from 'react-native';

export const savedProductCardStyles = StyleSheet.create({
  card: {
    flex: 1,
    marginBottom: 12,
  },
  imageWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  favButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  favButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  favIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
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
    fontSize: 15,
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
