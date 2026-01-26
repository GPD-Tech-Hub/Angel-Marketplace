import { StyleSheet } from 'react-native';

export const deliveryAddressStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontWeight: '600',
    color: '#111827',
  },
  changeButton: {
    color: '#F43F5E',
    fontWeight: '500',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressLabel: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  addressText: {
    color: '#6B7280',
    fontWeight: '400',
    lineHeight: 20,
  },
});
