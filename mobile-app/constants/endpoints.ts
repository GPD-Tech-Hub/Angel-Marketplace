export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // User
  USER: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    ADDRESSES: '/users/addresses',
    ADDRESS: (id: string) => `/users/addresses/${id}`,
  },

  // Products
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (slug: string) => `/products/${slug}`,
    SEARCH: '/products/search',
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (slug: string) => `/categories/${slug}`,
    PRODUCTS: (slug: string) => `/categories/${slug}/products`,
  },

  // Cart
  CART: {
    GET: '/cart',
    ADD_ITEM: '/cart/items',
    UPDATE_ITEM: (id: string) => `/cart/items/${id}`,
    REMOVE_ITEM: (id: string) => `/cart/items/${id}`,
    CLEAR: '/cart/clear',
  },

  // Orders
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
  },

  // Favorites
  FAVORITES: {
    LIST: '/favorites',
    ADD: '/favorites',
    REMOVE: (productId: string) => `/favorites/${productId}`,
  },

  // Payments
  PAYMENTS: {
    CONFIG: '/payments/config',
    CREATE_INTENT: '/payments/create-intent',
    CONFIRM: '/payments/confirm',
    WEBHOOK: '/payments/webhook',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    SETTINGS: '/notifications/settings',
  },
} as const;
