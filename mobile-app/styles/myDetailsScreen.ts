import { StyleSheet } from 'react-native';

export const myDetailsScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '600',
    color: '#171717',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  fieldLabel: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#111827',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  textInputInner: {
    flex: 1,
    padding: 0,
    borderWidth: 0,
    color: '#111827',
    fontSize: 14,
  },
  textInputDisabled: {
    backgroundColor: '#F9FAFB',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    marginLeft: 8,
  },
  pickerDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: 4,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerOptionText: {
    fontWeight: '400',
    color: '#111827',
  },
  phoneNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 0,
  },
  countryCodeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 0,
    marginRight: 8,
    minWidth: 80,
  },
  countryFlag: {
    marginRight: 6,
  },
  countryCode: {
    fontWeight: '400',
    color: '#111827',
    marginRight: 4,
  },
  countryChevron: {
    marginLeft: 4,
  },
  countryPickerDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginTop: 4,
    zIndex: 1000,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  phoneNumberInput: {
    flex: 1,
    padding: 0,
    borderWidth: 0,
    color: '#111827',
  },
  buttonContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  saveButton: {
    width: '100%',
  },
  saveButtonInner: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonActive: {
    backgroundColor: '#F43F5E',
  },
  saveButtonText: {
    fontWeight: '600',
    color: '#374151',
  },
  saveButtonTextActive: {
    color: '#FFFFFF',
  },
  datePickerModal: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  datePickerCancel: {
    color: '#6B7280',
    fontWeight: '400',
  },
  datePickerTitle: {
    fontWeight: '600',
    color: '#111827',
  },
  datePickerConfirm: {
    color: '#F43F5E',
    fontWeight: '600',
  },
});
