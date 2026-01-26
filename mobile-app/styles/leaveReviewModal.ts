import { StyleSheet } from 'react-native';

export const leaveReviewModalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  question: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  instructions: {
    fontWeight: '400',
    color: '#6B7280',
    marginBottom: 24,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  starButton: {
    marginRight: 8,
  },
  reviewInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    marginBottom: 24,
    textAlignVertical: 'top',
    color: '#111827',
  },
  submitButton: {
    width: '100%',
    marginBottom: 8,
  },
  submitButtonInner: {
    backgroundColor: '#F43F5E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
