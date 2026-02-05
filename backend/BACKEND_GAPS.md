# Backend – Missing / Not Yet Implemented (vs Mobile App)

Gap analysis between the **mobile app** expectations and the **backend** implementation.

---

## 1. API response format ✅ Fixed

**Mobile expects:** All successful responses wrapped as `{ success: true, data: T, message?: string }`.  
Services use `response.data.data`.

**Backend today:** Uses `sendSuccess(res, data)` across routes. Addresses POST was fixed to use `sendSuccess` (was returning raw JSON).

---

## 2. Route / path mismatches ✅ Fixed

| Mobile app expects | Backend |
|-------------------|---------|
| `GET /users/profile` | ✅ `GET /api/users/profile` (alias) |
| `PATCH /users/profile` | ✅ `PATCH /api/users/profile` (alias) |
| `GET /users/addresses` | ✅ Mounted at `/api/users/addresses` |
| `POST /users/addresses`, `PATCH /:id`, `DELETE /:id` | ✅ Same mount |
| `DELETE /cart/clear` | ✅ `DELETE /api/cart/clear` |
| `POST /favorites` (body: `{ productId }`) | ✅ Both `POST /api/favorites` (body) and `POST /api/favorites/:productId` supported |

---

## 3. Auth – refresh token response shape ✅ Fixed

**Mobile (api.ts):**  
`const { accessToken, refreshToken: newRefreshToken } = response.data.data;`

**Backend:**  
Uses `sendSuccess(res, { accessToken, refreshToken })` → `{ success: true, data: { accessToken, refreshToken } }`. Shape matches mobile.

---

## 4. Pagination and list response shapes ✅ Fixed

**Orders list**  
- Mobile: `PaginatedResponse<Order>` → `{ data: Order[], total, page, limit, totalPages }`.  
- Backend: GET `/orders` now returns `sendSuccess(res, { data: Order[], total, page, limit, totalPages })` with `page`/`limit` query params and pagination.

**Products list**  
- Mobile: `PaginatedProducts` → `{ products, total, page, limit, totalPages }` inside `data`.  
- Backend: GET `/products` and GET `/categories/:slug/products` now return flattened `{ products, total, page, limit, totalPages }` (no nested `pagination` object).

**Categories list**  
- Mobile: `ApiResponse<Category[]>` → `data` is the array.  
- Backend: GET `/categories` already returns `sendSuccess(res, categoriesArray)` so `data` is the array.

---

## 5. Cart response shape ✅ Fixed

**Mobile:**  
`Cart` = `{ id, userId, items, subtotal, itemCount, createdAt, updatedAt }`.

**Backend:**  
GET `/cart` now returns `sendSuccess(res, { id, userId, items, subtotal, itemCount, createdAt, updatedAt })`. `id`/`userId` = authenticated user id; `createdAt`/`updatedAt` = earliest/latest cart item timestamps (or now if empty). Wrapped in `{ success, data }`.

**Needed:**  
- Either add a logical cart `id` and `userId` and timestamps to the response, or document that the app uses a “virtual” cart and update mobile types to match backend (no `id`/`userId`/timestamps).  
- Wrap in `{ success, data }`.

---

## 6. Order payload and response shape ✅ Fixed

**Create order**  
- Backend now accepts **both** shapes:  
  - **Mobile:** `{ shippingAddress: { firstName, lastName, address, apartment?, city, state, zipCode, country, phone }, paymentMethod: 'stripe'|'paystack'|'flutterwave', couponCode? }`. Creates address from `shippingAddress`, stores `paymentProvider`.  
  - **Legacy:** `{ addressId, paymentMethodId?, couponCode? }`.  
- Response wrapped in `{ success, data }`.

**Order response**  
- All order endpoints (GET list, GET :id, POST create, POST :id/cancel) now return **mobile shape** inside `{ success, data }`:  
  - `orderNumber` = `#` + last 8 chars of `id` (uppercase)  
  - `shipping` = `shippingFee`  
  - `shippingAddress` = from `address` (firstName, lastName, address, apartment, city, state, zipCode, country, phone)  
  - `paymentMethod` = `paymentProvider` or `paymentMethod.type` or `'stripe'`  
  - `status` = uppercase (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)  
  - `items` with product and serialized dates

---

## 7. Payment endpoints ✅ Fixed (Stripe)

**Create intent**  
- Backend accepts `CreatePaymentIntentPayload`: `orderId`, `provider`, `amount`, `currency?`, `email?`, `metadata?`.  
- Stripe: creates PaymentIntent with metadata (userId, orderId), optional receipt_email.  
- Returns `{ success, data: { id, clientSecret, amount, currency, provider: 'stripe', status } }`.  
- Non-Stripe providers return 400 (only Stripe implemented).

**Confirm**  
- Backend accepts `paymentIntentId`, `provider`, `reference?`, `paymentMethodId?`.  
- Stripe: retrieves PaymentIntent and returns `{ success, data: { success: boolean, paymentIntentId, status, message } }`.  
- `data.success` is true when Stripe status is `succeeded`.

**Webhook**  
- `POST /api/payments/webhook` mounted with raw body in server.ts.  
- Stripe signature verified via `STRIPE_WEBHOOK_SECRET`.  
- `payment_intent.succeeded`: updates order (by metadata.orderId) to `processing`.  
- `payment_intent.payment_failed`: logged (optional future handling).

---

## 8. Features not implemented (stubs / TODOs)

| Feature | Location | Current state |
|--------|----------|----------------|
| Forgot password (email) | `auth.ts` | ✅ Creates reset token (1h), sends email via nodemailer (or logs link if SMTP not configured). |
| Reset password | `auth.ts` | ✅ Verifies token from DB, updates password, deletes token. |
| Create payment intent | `payments.ts` | ✅ Stripe: real PaymentIntent, returns clientSecret. |
| Confirm payment | `payments.ts` | ✅ Stripe: retrieves PI, returns { success: status === 'succeeded' }. |
| Payment webhook | `stripeWebhook.ts` + server | ✅ Signature verification; order → processing on payment_intent.succeeded. |

---

## 9. Product and category details

**Product**  
- Mobile: `Product` can have `comparePrice` (optional).  
- Schema: no `comparePrice` field.

**Needed:**  
- Optional: add `comparePrice` to schema and API if the app uses it.

**Categories**  
- Backend already returns `productCount` and category list/detail; only response wrapping and path (`/users/addresses` vs `/addresses`) need alignment if mobile uses “user” scoping.

---

## 10. Notifications ✅ Fixed

- **Backend:** Uses `sendSuccess` for GET /notifications (paginated: `page`, `limit`; returns `notifications`, `total`, `page`, `limit`, `totalPages`, `unreadCount`), GET /notifications/unread-count (lightweight `{ unreadCount }` for badge), PATCH /:id/read, GET /settings, PATCH /settings. PATCH :id/read uses safe `req.params.id` (string).
- **Mobile:** `ENDPOINTS.NOTIFICATIONS` (LIST, UNREAD_COUNT, MARK_READ(id), SETTINGS), `notifications.service.ts` (getNotifications with pagination, getUnreadCount, markAsRead, getSettings, updateSettings), `useNotifications` (refetchInterval 60s when screen active), `useUnreadNotificationCount` (60s polling for profile badge). Notifications screen: pull-to-refresh, automatic refetch every 60s (no page reload needed). Profile screen: unread badge on Notifications row; badge count auto-updates via polling.

---

## 11. Config / environment ✅ Aligned

- Mobile `config.ts` (development): `API_URL: 'http://localhost:4000/api'`.  
- Backend: runs on port 4000 by default. Aligned.

---

## 12. Summary – remaining gaps and optimizations

**Done (mobile-aligned):**  
Response format (`sendSuccess` everywhere, including addresses POST), routes (profile, addresses, cart/clear, favorites body), auth refresh shape, orders pagination and shape, products/categories lists, cart shape, create order (mobile payload), order response mapping, payments (Stripe), notifications (paginated, unread count, WebSocket emit), config (port 4000).

**Remaining gaps:** None (forgot/reset password implemented).

**Optional optimizations for mobile:**

| Item | Notes |
|------|--------|
| **Product `comparePrice`** | Mobile `Product` type has optional `comparePrice`. Schema has no field. Add `comparePrice Float?` to Product and include in product APIs if the app shows compare-at pricing. |
| **Address list** | ✅ Mobile address screen wired to API: `address.service.ts`, `useAddresses` hooks, address screen fetches `GET /users/addresses`, shows list from `data.addresses`, pull-to-refresh, loading/error. |
| **Error shape** | ✅ All 4xx/5xx use `{ success: false, message: string }` (and optional `errors` for validation). `sendError` in routes; errorHandler middleware also returns this shape. |
| **Products search** | ✅ Backend `GET /api/products/search?q=...&limit=...` returns `data: Product[]` (array) to match mobile `searchProducts()`. |

This list is the current state relative to the mobile app.
