# Angel Marketplace App

A production-ready React Native e-commerce mobile application built with Expo.

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand (client state) + TanStack Query (server state)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Scan the QR code with Expo Go (Android) or Camera app (iOS)

## Project Structure

```
├── app/                    # Expo Router screens (file-based routing)
│   ├── (auth)/             # Auth group (login, register, forgot-password)
│   ├── (tabs)/             # Main tab navigation
│   ├── product/[slug].tsx  # Product detail
│   ├── category/[slug].tsx # Category products
│   ├── checkout/           # Checkout flow
│   ├── order/[id].tsx      # Order detail
│   └── _layout.tsx         # Root layout
├── components/
│   ├── ui/                 # Reusable UI primitives
│   ├── products/           # Product components
│   ├── cart/               # Cart components
│   ├── orders/             # Order components
│   └── layout/             # Layout components
├── hooks/                  # Custom React hooks
├── store/                  # Zustand stores
├── services/               # API service layer
├── queries/                # TanStack Query hooks
├── types/                  # TypeScript definitions
├── utils/                  # Utility functions
└── constants/              # App constants
```

## Features

- User authentication (login, register, forgot password)
- Product browsing with categories
- Product search
- Favorites/wishlist
- Shopping cart
- Multi-step checkout
- Multiple payment gateways (Stripe, Paystack, Flutterwave)
- Order history and tracking
- User profile management

## Environment Configuration

Update `constants/config.ts` with your API endpoints and payment keys:

```typescript
const ENV = {
  development: {
    API_URL: 'http://localhost:3000/api',
    STRIPE_PUBLISHABLE_KEY: 'pk_test_...',
    PAYSTACK_PUBLIC_KEY: 'pk_test_...',
    FLUTTERWAVE_PUBLIC_KEY: 'FLWPUBK_TEST-...',
  },
  // ... staging and production configs
};
```

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Start on Android
- `npm run ios` - Start on iOS
- `npm run web` - Start on web

## Backend Requirements

This app expects a REST API backend with the following endpoints:

- `/auth/*` - Authentication endpoints
- `/products/*` - Product management
- `/categories/*` - Category management
- `/cart/*` - Cart operations
- `/orders/*` - Order management
- `/payments/*` - Payment processing

See `constants/endpoints.ts` for the complete API specification.

## License

MIT
