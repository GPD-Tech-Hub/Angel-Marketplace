import { StyleSheet } from 'react-native';

export const couponCodeInputStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 0,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#111827',
  },
  addButtonText: {
    fontWeight: '500',
    color: '#111827',
  },
});
