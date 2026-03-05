import { StyleSheet } from 'react-native';

export const profileScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 30,
    lineHeight: 40,
    fontWeight: '600',
    color: '#171717',
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },
  menuItem: {
    width: '100%',
  },
  menuItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemIcon: {
    width: 24,
    height: 24,
  },
  menuItemIconLogout: {
    // Logout icon styling handled by tintColor
  },
  menuItemText: {
    flex: 1,
    marginLeft: 12,
    fontWeight: '400',
    color: '#171717',
  },
  menuItemTextLogout: {
    color: '#EF4444',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 20,
  },
  // Unauthenticated state styles
  unauthenticatedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  signInButton: {
    width: '100%',
  },
  signInButtonInner: {
    backgroundColor: '#F43F5E',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signUpLink: {
    marginTop: 16,
  },
  signUpLinkText: {
    color: '#F43F5E',
    fontWeight: '500',
  },
});
