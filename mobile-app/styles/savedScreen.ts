import { StyleSheet } from 'react-native';

export const savedScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // ── Header ────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  headerTitle: {
    fontSize: 30,
    lineHeight: 40,
    fontWeight: '600',
    color: '#000000',
  },
  headerBadge: {
    minWidth: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  headerBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F43F5E',
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },

  // ── Search ────────────────────────────────────────
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  // ── Scroll ────────────────────────────────────────
  content: {
    flex: 1,
  },
  scrollContentNormal: {
    flexGrow: 1,
  },

  // ── Empty state ───────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontWeight: '700',
    color: '#111827',
    marginTop: 12,
    marginBottom: 6,
    fontSize: 20,
  },
  emptyMessage: {
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 14,
  },
  emptyShopBtn: {
    marginTop: 24,
    backgroundColor: '#F43F5E',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyShopBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
