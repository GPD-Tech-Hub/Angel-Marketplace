# Backend – Missing / Not Yet Implemented (vs Mobile App)

Gap analysis between the **mobile app** expectations and the **backend** implementation.

---

## 1. API response format

**Mobile expects:** All successful responses wrapped as `{ success: true, data: T, message?: string }`.  
Services use `response.data.data`.

**Backend today:** Returns raw payloads (e.g. `{ user, tokens }`, `{ products, pagination }`, `{ orders }`).

**Needed:**  
- Add a response helper (e.g. `sendSuccess(res, data)`) that wraps every success response in `{ success: true, data }`.  
- Use it in all route handlers so the app can keep using `response.data.data`.

---

## 2. Route / path mismatches

| Mobile app expects | Backend currently | Action |
|-------------------|-------------------|--------|
| `GET /users/profile` | `GET /users/me` | Add `GET /users/profile` (alias to same handler as `/me`) or change mobile to `/users/me`. |
| `PATCH /users/profile` | `PATCH /users/me` | Same: add `/users/profile` or update mobile. |
| `GET /users/addresses` | `GET /api/addresses` | Add `/users/addresses` route that proxies to addresses logic, or mount addresses under `router.use('/users', ...)` and use `/users/addresses`. |
| `POST /users/addresses` | `POST /api/addresses` | Same. |
| `PATCH /users/addresses/:id` | `PATCH /api/addresses/:id` | Same. |
| `DELETE /users/addresses/:id` | `DELETE /api/addresses/:id` | Same. |
| `DELETE /cart/clear` | `DELETE /cart` | Add `DELETE /cart/clear` that clears cart (same behavior as `DELETE /cart`), or change mobile to `DELETE /cart`. |
| `POST /favorites` (body: `{ productId }`) | `POST /favorites/:productId` | Support both: either add `POST /favorites` that reads `productId` from body, or change mobile to `POST /favorites/:productId`. |

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

## 6. Order payload and response shape

**Create order**  
- Mobile: `CreateOrderPayload` = `{ shippingAddress: ShippingAddress, paymentMethod: 'stripe' | 'paystack' | 'flutterwave' }`.  
- Backend: expects `{ addressId, paymentMethodId?, couponCode? }`.

**Needed:**  
- Either:  
  - Support mobile shape: accept `shippingAddress` (and optionally `paymentMethod` as provider string), create or match address server-side, then create order (and optionally link payment method), or  
  - Keep backend contract and have mobile send `addressId` (and optional `paymentMethodId`) after creating address/payment method in a previous step.  
- Document which flow is canonical and align types.

**Order response**  
- Mobile: `Order` has `orderNumber`, `shipping` (number), `shippingAddress` (object), `paymentMethod` (string), `status` as uppercase enum.  
- Backend: uses `id` (uuid), `shippingFee`, `address`, `paymentMethod` (object or id), `status` lowercase.

**Needed:**  
- Map backend order to mobile shape: e.g. `orderNumber` = short id or formatted number, `shipping` = `shippingFee`, `shippingAddress` = from `address`, `paymentMethod` = provider string or label.  
- Return inside `{ success, data }`.

---

## 7. Payment endpoints

**Create intent**  
- Mobile: `CreatePaymentIntentPayload` = `{ orderId, provider, amount, currency?, email?, metadata? }`.  
- Backend: expects `{ amount, currency?, orderId? }` (no `provider`, `email`, `metadata`).

**Needed:**  
- Extend create-intent body to accept `provider`, `email`, `metadata` and pass through to gateway.  
- Return shape expected by mobile (e.g. `PaymentIntent` with `id`, `clientSecret`/`authorizationUrl`/`reference`, `amount`, `currency`, `provider`).  
- Wrap in `{ success, data }`.

**Confirm**  
- Mobile: `ConfirmPaymentPayload` = `{ paymentIntentId, provider, reference? }`.  
- Backend: `{ paymentIntentId, paymentMethodId? }`.  

**Needed:**  
- Accept `provider` and `reference`; implement real verification with Stripe/Paystack/Flutterwave.  
- Return `{ success, data: { success: boolean } }` as expected by mobile.

**Webhook**  
- Backend: stub only; no signature verification or order status updates.

**Needed:**  
- Implement webhook signature verification and handlers that update order/payment status.

---

## 8. Features not implemented (stubs / TODOs)

| Feature | Location | Current state |
|--------|----------|----------------|
| Forgot password (email) | `auth.ts` | Returns generic message; no email sent. TODO: send reset link/token via email. |
| Reset password | `auth.ts` | Returns 501 “Password reset not yet implemented”. TODO: verify token and update password. |
| Create payment intent | `payments.ts` | Mock response. TODO: integrate Stripe/Paystack/Flutterwave. |
| Confirm payment | `payments.ts` | Always success. TODO: verify with gateway. |
| Payment webhook | `payments.ts` | No signature verification; no order updates. TODO: verify and handle events. |

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

## 10. Notifications

- Mobile: no notifications service found in the scanned files; endpoints are not used in the grep.  
- Backend: `/notifications` and `/notifications/settings` exist.

**Needed:**  
- If the app will use notifications, ensure list/settings responses are wrapped in `{ success, data }`.  
- No extra backend feature missing beyond response format.

---

## 11. Config / environment

- Mobile `config.ts`: `API_URL: 'http://localhost:3000/api'` (port 3000).  
- Backend: typically runs on port 4000.

**Needed:**  
- In dev, set mobile `API_URL` to `http://localhost:4000/api` (or whatever port the backend uses), or document that backend must run on 3000.

---

## 12. Summary checklist

- [ ] **Response format:** Wrap all success responses in `{ success: true, data }`.
- [ ] **Routes:** Add or align `/users/profile`, `/users/addresses`, `/cart/clear`, and `POST /favorites` (body) vs `POST /favorites/:productId`.
- [ ] **Auth refresh:** Return refresh tokens inside `data`.
- [ ] **Orders list:** Add pagination and align shape with `PaginatedResponse<Order>` (or document and align mobile).
- [ ] **Products/categories lists:** Wrap and use `data` as expected by mobile.
- [ ] **Cart:** Add or document `id`, `userId`, timestamps.
- [ ] **Create order:** Support mobile payload (address + provider) or document backend flow and align mobile.
- [ ] **Order response:** Map to mobile `Order` (orderNumber, shipping, shippingAddress, paymentMethod string).
- [ ] **Payments:** Extend create-intent/confirm payloads; implement real gateway + webhook.
- [ ] **Auth:** Implement forgot-password email and reset-password token verification.
- [ ] **Config:** Align API base URL (e.g. port 4000) for local dev.

This list is the full set of missing or not-yet-implemented items on the backend relative to the mobile app and current README/behavior.
