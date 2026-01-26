import { StyleSheet } from 'react-native';

export const checkoutButtonStyles = StyleSheet.create({
  button: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F43F5E',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  buttonText: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
