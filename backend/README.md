# Angel Marketplace Backend

Complete backend API for the Angel Marketplace mobile app, built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## 🚀 Quick Start

### 1. Start PostgreSQL Database

```bash
docker-compose up -d
```

This starts PostgreSQL on port 5432 with:
- Database: `angel_marketplace`
- User: `postgres`
- Password: `postgres`

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update `DATABASE_URL` in `.env` if needed (default should work with Docker Compose).

### 3. Run Database Migrations

```bash
npm run prisma:migrate
```

This creates all database tables based on the Prisma schema.

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:4000`

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── lib/
│   │   └── prisma.ts          # Prisma client instance
│   ├── middleware/
│   │   └── authMiddleware.ts  # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.ts            # Authentication endpoints
│   │   ├── users.ts           # User profile endpoints
│   │   ├── products.ts        # Products & categories
│   │   ├── cart.ts            # Shopping cart
│   │   ├── orders.ts          # Orders & reviews
│   │   ├── addresses.ts       # User addresses
│   │   ├── payments.ts        # Payment methods
│   │   ├── favorites.ts       # Favorite products
│   │   └── notifications.ts   # Notifications & settings
│   ├── utils/
│   │   └── jwt.ts             # JWT token utilities
│   └── server.ts              # Express app entry point
├── docker-compose.yml         # PostgreSQL Docker setup
└── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Users
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update user profile

### Products
- `GET /api/products` - List products (with pagination, search, filters)
- `GET /api/products/search` - Search products
- `GET /api/products/trending` - Get trending products
- `GET /api/products/:slug` - Get product by slug (or ID for backward compatibility)
- `GET /api/products/categories/all` - Get all categories (legacy endpoint)

### Categories
- `GET /api/categories` - List all categories with product counts
- `GET /api/categories/:slug` - Get category by slug
- `GET /api/categories/:slug/products` - Get products by category

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add item to cart
- `PATCH /api/cart/items/:id` - Update cart item quantity
- `DELETE /api/cart/items/:id` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

### Orders
- `GET /api/orders` - List user orders (optional ?status filter)
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create order from cart
- `POST /api/orders/:id/cancel` - Cancel order
- `POST /api/orders/:id/review` - Create review for delivered order

### Addresses
- `GET /api/addresses` - List user addresses
- `POST /api/addresses` - Create address
- `PATCH /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

### Payment Methods
- `GET /api/payments` - List payment methods
- `POST /api/payments` - Add payment method
- `PATCH /api/payments/:id` - Update payment method
- `DELETE /api/payments/:id` - Delete payment method
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `POST /api/payments/webhook` - Payment webhook handler

### Favorites
- `GET /api/favorites` - List favorite products
- `POST /api/favorites/:productId` - Add to favorites
- `DELETE /api/favorites/:productId` - Remove from favorites

### Notifications
- `GET /api/notifications` - List notifications
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `GET /api/notifications/settings` - Get notification settings
- `PATCH /api/notifications/settings` - Update notification settings

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Tokens are returned from `/api/auth/register` and `/api/auth/login`.

## 📊 Database Models

- **User** - User accounts with authentication
- **Product** - Products in the marketplace
- **Category** - Product categories
- **CartItem** - Shopping cart items
- **Order** - Customer orders
- **OrderItem** - Items within an order
- **Address** - User shipping addresses
- **PaymentMethod** - Saved payment methods
- **Favorite** - User favorite products
- **Review** - Product reviews/ratings
- **Notification** - User notifications
- **NotificationSettings** - User notification preferences
- **Coupon** - Discount coupons

## 🐳 Docker

The `docker-compose.yml` file sets up PostgreSQL. To manage:

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View logs
docker-compose logs -f postgres
```

## 🔒 Security Features

- **Rate Limiting**: 
  - General API: 100 requests per 15 minutes
  - Authentication: 5 requests per 15 minutes
  - Password Reset: 3 requests per hour
- **Security Headers**: Helmet middleware for XSS, CSRF, and other protections
- **Input Validation**: Zod schema validation on all endpoints
- **CORS**: Configurable allowed origins
- **Request Size Limits**: 10MB maximum
- **Error Handling**: Centralized error handling with no sensitive data leakage

## ⚡ Performance Optimizations

- **Database Indexes**: Optimized indexes on frequently queried fields
- **Response Compression**: Gzip compression for all responses
- **Query Optimization**: Selective field queries and parallel execution
- **Connection Pooling**: Optimized Prisma client configuration

## 📝 Notes

- All timestamps are returned as ISO strings
- All UUIDs are used for IDs
- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire: Access (15m), Refresh (7d)
- Default notification settings are created on user registration
- See `IMPROVEMENTS.md` for detailed list of all enhancements
