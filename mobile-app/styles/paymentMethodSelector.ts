import { StyleSheet } from 'react-native';

export const paymentMethodSelectorStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  methodButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  methodButtonSelected: {
    backgroundColor: '#F43F5E',
    borderColor: '#F43F5E',
  },
  methodButtonText: {
    fontWeight: '500',
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  cardInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  visaIcon: {
    marginRight: 8,
  },
  cardNumber: {
    color: '#6B7280',
    fontWeight: '400',
  },
});
