import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const PORT = process.env.PORT || 4000;
const baseUrl = process.env.API_BASE_URL || `http://localhost:${PORT}`;

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Angel Marketplace API',
      version: '1.0.0',
      description: 'REST API for Angel Marketplace mobile app',
    },
    servers: [{ url: `${baseUrl}/api`, description: 'API base' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Access token from login/register',
        },
      },
      schemas: {
        // ----- Response wrapper (matches src/utils/response.ts sendSuccess) -----
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { description: 'Response payload' },
            message: { type: 'string', description: 'Optional message' },
          },
          required: ['success', 'data'],
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'object', additionalProperties: { type: 'array', items: { type: 'string' } } },
          },
        },
        // ----- Auth (matches routes/auth.ts Zod schemas) -----
        RegisterDto: {
          type: 'object',
          description: 'Register body; matches registerSchema',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            firstName: { type: 'string', minLength: 2 },
            lastName: { type: 'string', minLength: 2 },
            phone: { type: 'string', description: 'Optional' },
          },
        },
        LoginDto: {
          type: 'object',
          description: 'Login body; matches loginSchema',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
        RefreshTokenDto: {
          type: 'object',
          description: 'Refresh body; matches refreshTokenSchema',
          required: ['refreshToken'],
          properties: { refreshToken: { type: 'string' } },
        },
        AuthUserDto: {
          type: 'object',
          description: 'User shape returned by register/login (no avatar, dateOfBirth, gender)',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponseDto: {
          type: 'object',
          description: 'Register/Login response data',
          properties: {
            user: { $ref: '#/components/schemas/AuthUserDto' },
            tokens: {
              type: 'object',
              properties: {
                accessToken: { type: 'string' },
                refreshToken: { type: 'string' },
              },
              required: ['accessToken', 'refreshToken'],
            },
          },
        },
        RefreshResponseDto: {
          type: 'object',
          description: 'Auth refresh response data (no user)',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
          required: ['accessToken', 'refreshToken'],
        },
        ForgotPasswordDto: {
          type: 'object',
          description: 'Matches forgotPasswordSchema',
          required: ['email'],
          properties: { email: { type: 'string', format: 'email' } },
        },
        ResetPasswordDto: {
          type: 'object',
          description: 'Matches resetPasswordSchema',
          required: ['token', 'password'],
          properties: {
            token: { type: 'string' },
            password: { type: 'string', minLength: 6 },
          },
        },
        // ----- User (matches routes/users.ts + Prisma User) -----
        UserDto: {
          type: 'object',
          description: 'Full user/profile; matches GET /users/me and PATCH response',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string', nullable: true },
            avatar: { type: 'string', nullable: true },
            dateOfBirth: { type: 'string', nullable: true },
            gender: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        UpdateProfileDto: {
          type: 'object',
          description: 'PATCH body; matches updateProfileSchema (all optional)',
          properties: {
            firstName: { type: 'string', minLength: 2 },
            lastName: { type: 'string', minLength: 2 },
            phone: { type: 'string' },
            dateOfBirth: { type: 'string' },
            gender: { type: 'string' },
          },
        },
        // ----- Pagination and list responses (mobile types: PaginatedResponse<T>, PaginatedProducts) -----
        PaginationMetaDto: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
        PaginatedResponseOrder: {
          type: 'object',
          description: 'GET /orders response data; PaginatedResponse<Order>',
          properties: {
            data: { type: 'array', items: { type: 'object' }, description: 'Order[]' },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
          required: ['data', 'total', 'page', 'limit', 'totalPages'],
        },
        PaginatedProductsData: {
          type: 'object',
          description: 'GET /products and GET /categories/:slug/products response data; PaginatedProducts',
          properties: {
            products: { type: 'array', items: { $ref: '#/components/schemas/ProductDto' } },
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
          required: ['products', 'total', 'page', 'limit', 'totalPages'],
        },
        // ----- Product / Category (matches Prisma + route responses) -----
        ProductDto: {
          type: 'object',
          description: 'Product with category ref and optional rating/reviewsCount',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string', nullable: true },
            price: { type: 'number' },
            images: { type: 'array', items: { type: 'string' } },
            stock: { type: 'integer' },
            categoryId: { type: 'string' },
            category: { $ref: '#/components/schemas/CategoryRefDto' },
            rating: { type: 'number', nullable: true },
            reviewsCount: { type: 'integer', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CategoryRefDto: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
          },
        },
        CategoryDto: {
          type: 'object',
          description: 'Category with productCount; matches categories list',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string', nullable: true },
            image: { type: 'string', nullable: true },
            productCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // ----- Cart (matches routes/cart.ts Zod + Prisma CartItem) -----
        CartItemDto: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            productId: { type: 'string' },
            product: { $ref: '#/components/schemas/ProductDto' },
            quantity: { type: 'integer' },
            price: { type: 'number' },
            size: { type: 'string', nullable: true },
            color: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CartDto: {
          type: 'object',
          description: 'GET /cart response data; matches mobile Cart type',
          properties: {
            id: { type: 'string', description: 'Cart id (same as userId for per-user cart)' },
            userId: { type: 'string' },
            items: { type: 'array', items: { $ref: '#/components/schemas/CartItemDto' } },
            subtotal: { type: 'number' },
            itemCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time', description: 'Earliest cart item createdAt (or now if empty)' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Latest cart item updatedAt (or now if empty)' },
          },
          required: ['id', 'userId', 'items', 'subtotal', 'itemCount', 'createdAt', 'updatedAt'],
        },
        AddToCartDto: {
          type: 'object',
          description: 'POST /cart/items body; matches addToCartSchema',
          required: ['productId'],
          properties: {
            productId: { type: 'string', format: 'uuid' },
            quantity: { type: 'integer', minimum: 1, default: 1 },
            size: { type: 'string' },
            color: { type: 'string' },
          },
        },
        UpdateCartItemDto: {
          type: 'object',
          description: 'PATCH /cart/items/:id body; matches updateCartSchema',
          required: ['quantity'],
          properties: { quantity: { type: 'integer', minimum: 1 } },
        },
        // ----- Address (matches routes/addresses.ts addressSchema + Prisma Address) -----
        AddressDto: {
          type: 'object',
          description: 'Address entity; also raw 201 body for POST /addresses',
          properties: {
            id: { type: 'string' },
            userId: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            address: { type: 'string' },
            apartment: { type: 'string', nullable: true },
            city: { type: 'string' },
            state: { type: 'string' },
            zipCode: { type: 'string' },
            country: { type: 'string' },
            phone: { type: 'string' },
            isDefault: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateAddressDto: {
          type: 'object',
          description: 'POST /addresses body; matches addressSchema',
          required: ['firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'country', 'phone'],
          properties: {
            firstName: { type: 'string', minLength: 2 },
            lastName: { type: 'string', minLength: 2 },
            address: { type: 'string', minLength: 5 },
            apartment: { type: 'string' },
            city: { type: 'string', minLength: 2 },
            state: { type: 'string', minLength: 2 },
            zipCode: { type: 'string', minLength: 4 },
            country: { type: 'string', minLength: 2 },
            phone: { type: 'string', minLength: 10 },
            isDefault: { type: 'boolean', default: false },
          },
        },
        UpdateAddressDto: {
          type: 'object',
          description: 'PATCH /addresses/:id body; addressSchema.partial()',
          properties: {
            firstName: { type: 'string', minLength: 2 },
            lastName: { type: 'string', minLength: 2 },
            address: { type: 'string', minLength: 5 },
            apartment: { type: 'string' },
            city: { type: 'string', minLength: 2 },
            state: { type: 'string', minLength: 2 },
            zipCode: { type: 'string', minLength: 4 },
            country: { type: 'string', minLength: 2 },
            phone: { type: 'string', minLength: 10 },
            isDefault: { type: 'boolean' },
          },
        },
        // ----- Order (matches routes/orders.ts createOrderSchema, createReviewSchema) -----
        CreateOrderDto: {
          type: 'object',
          description: 'POST /orders body; matches createOrderSchema',
          required: ['addressId'],
          properties: {
            addressId: { type: 'string', format: 'uuid' },
            paymentMethodId: { type: 'string', format: 'uuid' },
            couponCode: { type: 'string' },
          },
        },
        OrderReviewDto: {
          type: 'object',
          description: 'POST /orders/:id/review body; matches createReviewSchema',
          required: ['rating'],
          properties: {
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            comment: { type: 'string' },
          },
        },
        // ----- Payment (matches routes/payments.ts Zod schemas + Prisma PaymentMethod) -----
        PaymentMethodDto: {
          type: 'object',
          description: 'Payment method entity',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string' },
            type: { type: 'string' },
            brand: { type: 'string', nullable: true },
            last4: { type: 'string', nullable: true },
            cardNumber: { type: 'string', nullable: true },
            expiryMonth: { type: 'integer', nullable: true, minimum: 1, maximum: 12 },
            expiryYear: { type: 'integer', nullable: true },
            isDefault: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreatePaymentMethodDto: {
          type: 'object',
          description: 'POST /payments body; matches paymentMethodSchema',
          required: ['type'],
          properties: {
            type: { type: 'string' },
            brand: { type: 'string' },
            last4: { type: 'string' },
            cardNumber: { type: 'string' },
            expiryMonth: { type: 'integer', minimum: 1, maximum: 12 },
            expiryYear: { type: 'integer' },
            isDefault: { type: 'boolean', default: false },
          },
        },
        UpdatePaymentMethodDto: {
          type: 'object',
          description: 'PATCH /payments/:id body; paymentMethodSchema.partial()',
          properties: {
            type: { type: 'string' },
            brand: { type: 'string' },
            last4: { type: 'string' },
            cardNumber: { type: 'string' },
            expiryMonth: { type: 'integer', minimum: 1, maximum: 12 },
            expiryYear: { type: 'integer' },
            isDefault: { type: 'boolean' },
          },
        },
        CreatePaymentIntentDto: {
          type: 'object',
          description: 'POST /payments/create-intent body; matches createPaymentIntentSchema',
          required: ['amount'],
          properties: {
            amount: { type: 'number', minimum: 0.01 },
            currency: { type: 'string', default: 'USD' },
            orderId: { type: 'string', format: 'uuid' },
          },
        },
        ConfirmPaymentDto: {
          type: 'object',
          description: 'POST /payments/confirm body; matches confirmPaymentSchema',
          required: ['paymentIntentId'],
          properties: {
            paymentIntentId: { type: 'string' },
            paymentMethodId: { type: 'string', format: 'uuid' },
          },
        },
        // ----- Favorites (matches routes/favorites.ts addFavoriteBodySchema) -----
        AddFavoriteDto: {
          type: 'object',
          description: 'POST /favorites body; matches addFavoriteBodySchema',
          required: ['productId'],
          properties: { productId: { type: 'string', format: 'uuid' } },
        },
        // ----- Notifications (matches routes/notifications.ts updateSettingsSchema + Prisma NotificationSettings) -----
        NotificationSettingsDto: {
          type: 'object',
          description: 'PATCH /notifications/settings body; matches updateSettingsSchema (all optional)',
          properties: {
            general: { type: 'boolean' },
            sound: { type: 'boolean' },
            vibrate: { type: 'boolean' },
            specialOffer: { type: 'boolean' },
            promoDiscounts: { type: 'boolean' },
            payments: { type: 'boolean' },
            cashback: { type: 'boolean' },
            appUpdates: { type: 'boolean' },
            newService: { type: 'boolean' },
            newTips: { type: 'boolean' },
          },
        },
      },
    },
    paths: {
      // ----- Auth -----
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register',
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterDto' } } } },
          responses: { 201: { description: 'Registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginDto' } } } },
          responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
      },
      '/auth/refresh': {
        post: {
          tags: ['Auth'],
          summary: 'Refresh token',
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenDto' } } } },
          responses: { 200: { description: 'New tokens' } },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Logout',
          responses: { 200: { description: 'Logged out' } },
        },
      },
      '/auth/forgot-password': {
        post: {
          tags: ['Auth'],
          summary: 'Forgot password',
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ForgotPasswordDto' } } } },
          responses: { 200: { description: 'Email sent if account exists' } },
        },
      },
      '/auth/reset-password': {
        post: {
          tags: ['Auth'],
          summary: 'Reset password',
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ResetPasswordDto' } } } },
          responses: { 200: { description: 'Password reset' } },
        },
      },
      // ----- Users -----
      '/users/me': {
        get: {
          tags: ['Users'],
          summary: 'Get current user',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'User', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        patch: {
          tags: ['Users'],
          summary: 'Update current user',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileDto' } } } },
          responses: { 200: { description: 'Updated' } },
        },
      },
      '/users/profile': {
        get: {
          tags: ['Users'],
          summary: 'Get profile (alias for /me)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Profile' } },
        },
        patch: {
          tags: ['Users'],
          summary: 'Update profile',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProfileDto' } } } },
          responses: { 200: { description: 'Updated' } },
        },
      },
      // ----- Products -----
      '/products': {
        get: {
          tags: ['Products'],
          summary: 'List products',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'categoryId', in: 'query', schema: { type: 'string' } },
            { name: 'minPrice', in: 'query', schema: { type: 'number' } },
            { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
            { name: 'sortBy', in: 'query', schema: { type: 'string' } },
            { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
          ],
          responses: { 200: { description: 'Products with pagination' } },
        },
      },
      '/products/search': {
        get: {
          tags: ['Products'],
          summary: 'Search products',
          parameters: [
            { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'Search results' } },
        },
      },
      '/products/trending': {
        get: {
          tags: ['Products'],
          summary: 'Trending products',
          parameters: [{ name: 'limit', in: 'query', schema: { type: 'integer' } }],
          responses: { 200: { description: 'Trending products' } },
        },
      },
      '/products/categories/all': {
        get: {
          tags: ['Products'],
          summary: 'All categories (legacy)',
          responses: { 200: { description: 'Categories' } },
        },
      },
      '/products/{slug}': {
        get: {
          tags: ['Products'],
          summary: 'Get product by slug or ID',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Product detail' } },
        },
      },
      // ----- Categories -----
      '/categories': {
        get: {
          tags: ['Categories'],
          summary: 'List categories',
          responses: { 200: { description: 'Categories' } },
        },
      },
      '/categories/{slug}': {
        get: {
          tags: ['Categories'],
          summary: 'Get category by slug',
          parameters: [{ name: 'slug', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Category' } },
        },
      },
      '/categories/{slug}/products': {
        get: {
          tags: ['Categories'],
          summary: 'Products by category',
          parameters: [
            { name: 'slug', in: 'path', required: true, schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'Products with pagination' } },
        },
      },
      // ----- Cart -----
      '/cart': {
        get: {
          tags: ['Cart'],
          summary: 'Get cart',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Cart', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        delete: {
          tags: ['Cart'],
          summary: 'Clear cart',
          security: [{ bearerAuth: [] }],
          responses: { 204: { description: 'Cleared' } },
        },
      },
      '/cart/items': {
        post: {
          tags: ['Cart'],
          summary: 'Add item to cart',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/AddToCartDto' } } } },
          responses: { 201: { description: 'Item added' } },
        },
      },
      '/cart/items/{id}': {
        patch: {
          tags: ['Cart'],
          summary: 'Update cart item quantity',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateCartItemDto' } } } },
          responses: { 200: { description: 'Updated' } },
        },
        delete: {
          tags: ['Cart'],
          summary: 'Remove cart item',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 204: { description: 'Removed' } },
        },
      },
      '/cart/clear': {
        delete: {
          tags: ['Cart'],
          summary: 'Clear cart (alias)',
          security: [{ bearerAuth: [] }],
          responses: { 204: { description: 'Cleared' } },
        },
      },
      // ----- Orders -----
      '/orders': {
        get: {
          tags: ['Orders'],
          summary: 'List orders (paginated)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
          ],
          responses: { 200: { description: 'PaginatedResponse<Order>: data = { data: Order[], total, page, limit, totalPages }', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/PaginatedResponseOrder' } } } } } } },
        },
        post: {
          tags: ['Orders'],
          summary: 'Create order',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOrderDto' } } } },
          responses: { 201: { description: 'Order created' } },
        },
      },
      '/orders/{id}': {
        get: {
          tags: ['Orders'],
          summary: 'Get order by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Order' } },
        },
      },
      '/orders/{id}/cancel': {
        post: {
          tags: ['Orders'],
          summary: 'Cancel order',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Order cancelled' } },
        },
      },
      '/orders/{id}/review': {
        post: {
          tags: ['Orders'],
          summary: 'Submit order review',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderReviewDto' } } } },
          responses: { 201: { description: 'Review created' } },
        },
      },
      // ----- Addresses -----
      '/addresses': {
        get: {
          tags: ['Addresses'],
          summary: 'List addresses',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Addresses' } },
        },
        post: {
          tags: ['Addresses'],
          summary: 'Create address',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateAddressDto' } } } },
          responses: { 201: { description: 'Address created' } },
        },
      },
      '/addresses/{id}': {
        patch: {
          tags: ['Addresses'],
          summary: 'Update address',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateAddressDto' } } } },
          responses: { 200: { description: 'Updated' } },
        },
        delete: {
          tags: ['Addresses'],
          summary: 'Delete address',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 204: { description: 'Deleted' } },
        },
      },
      // ----- Payments -----
      '/payments': {
        get: {
          tags: ['Payments'],
          summary: 'List payment methods',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Payment methods', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } } } },
        },
        post: {
          tags: ['Payments'],
          summary: 'Add payment method',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePaymentMethodDto' } } } },
          responses: { 201: { description: 'Created (backend returns raw paymentMethod, not sendSuccess wrapper)' } },
        },
      },
      '/payments/{id}': {
        patch: {
          tags: ['Payments'],
          summary: 'Update payment method',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdatePaymentMethodDto' } } } },
          responses: { 200: { description: 'Updated' } },
        },
        delete: {
          tags: ['Payments'],
          summary: 'Delete payment method',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 204: { description: 'Deleted' } },
        },
      },
      '/payments/create-intent': {
        post: {
          tags: ['Payments'],
          summary: 'Create payment intent',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePaymentIntentDto' } } } },
          responses: { 201: { description: 'Payment intent (data: id, clientSecret, amount, currency, status)' } },
        },
      },
      '/payments/confirm': {
        post: {
          tags: ['Payments'],
          summary: 'Confirm payment',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/ConfirmPaymentDto' } } } },
          responses: { 200: { description: 'Confirmed (data: success, paymentIntentId, status, message)' } },
        },
      },
      '/payments/webhook': {
        post: {
          tags: ['Payments'],
          summary: 'Payment webhook (no auth)',
          requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { 200: { description: 'Received' } },
        },
      },
      // ----- Favorites -----
      '/favorites': {
        get: {
          tags: ['Favorites'],
          summary: 'List favorites',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Favorite products (data: { products })' } },
        },
        post: {
          tags: ['Favorites'],
          summary: 'Add to favorites',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/AddFavoriteDto' } } } },
          responses: { 201: { description: 'Added (data: id, productId, createdAt)' } },
        },
      },
      '/favorites/{productId}': {
        post: {
          tags: ['Favorites'],
          summary: 'Add product to favorites by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 201: { description: 'Added' } },
        },
        delete: {
          tags: ['Favorites'],
          summary: 'Remove from favorites',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 204: { description: 'Removed' } },
        },
      },
      // ----- Notifications -----
      '/notifications': {
        get: {
          tags: ['Notifications'],
          summary: 'List notifications (paginated)',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: {
            200: {
              description: 'data: { notifications, total, page, limit, totalPages, unreadCount }',
            },
          },
        },
      },
      '/notifications/unread-count': {
        get: {
          tags: ['Notifications'],
          summary: 'Get unread count (for badge)',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'data: { unreadCount }' } },
        },
      },
      '/notifications/{id}/read': {
        patch: {
          tags: ['Notifications'],
          summary: 'Mark as read',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Updated' } },
        },
      },
      '/notifications/settings': {
        get: {
          tags: ['Notifications'],
          summary: 'Get notification settings',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Settings (data: general, sound, vibrate, specialOffer, promoDiscounts, payments, cashback, appUpdates, newService, newTips, updatedAt)' } },
        },
        patch: {
          tags: ['Notifications'],
          summary: 'Update notification settings',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/NotificationSettingsDto' } } } },
          responses: { 200: { description: 'Updated' } },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication' },
      { name: 'Users', description: 'User profile' },
      { name: 'Products', description: 'Products' },
      { name: 'Categories', description: 'Categories' },
      { name: 'Cart', description: 'Shopping cart' },
      { name: 'Orders', description: 'Orders' },
      { name: 'Addresses', description: 'User addresses' },
      { name: 'Payments', description: 'Payment methods & intents' },
      { name: 'Favorites', description: 'Favorite products' },
      { name: 'Notifications', description: 'Notifications' },
    ],
  },
  apis: [], // Paths can be added for JSDoc; schemas are defined above
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerUiOptions: swaggerUi.SwaggerUiOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { font-size: 2em; margin: 0 0 0.5em }
    .swagger-ui .opblock-tag { font-size: 1.25em; margin: 1.5em 0 0.5em }
    .swagger-ui .opblock .opblock-summary-method { font-weight: 700; padding: 0.4em 0.6em }
    .swagger-ui .opblock.opblock-get .opblock-summary-method { background: #61affe }
    .swagger-ui .opblock.opblock-post .opblock-summary-method { background: #49cc90 }
    .swagger-ui .opblock.opblock-put .opblock-summary-method { background: #fca130 }
    .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #50e3c2 }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #f93e3e }
    .swagger-ui .opblock .opblock-summary-path { font-weight: 600 }
    .swagger-ui table thead tr th { padding: 0.75em; font-weight: 600 }
    .swagger-ui .model-box-control { font-family: inherit }
  `,
  customSiteTitle: 'Angel Marketplace API Docs',
  customfavIcon: undefined,
  docExpansion: 'list' as const,
  displayRequestDuration: true,
  filter: true,
  showExtensions: true,
  tryItOutEnabled: true,
};

export function setupSwagger(app: Express, basePath = '/api-docs'): void {
  app.use(basePath, swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
  app.get(`${basePath}.json`, (_req, res) => res.json(swaggerSpec));
}

export { swaggerSpec };
