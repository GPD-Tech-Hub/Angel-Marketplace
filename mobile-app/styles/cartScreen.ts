import { StyleSheet } from 'react-native';

export const cartScreenStyles = StyleSheet.create({
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
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '700',
    color: '#111827',
    fontSize: 18,
  },
  headerBadge: {
    minWidth: 38,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  headerBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F43F5E',
  },
  headerSpacer: {
    width: 38,
  },

  // ── Scroll ────────────────────────────────────────
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 20,
  },

  // ── Section label ─────────────────────────────────
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginHorizontal: 20,
    marginBottom: 10,
  },

  // ── Empty state ───────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
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
