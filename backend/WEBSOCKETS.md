# WebSockets (Socket.IO)

Real-time notifications use **Socket.IO** on the same HTTP server as the REST API. When the backend creates a notification (e.g. order placed, order cancelled, payment received), it emits to the user’s room so the mobile app can update without polling.

## Backend

- **Server:** Socket.IO is attached to the Express HTTP server in `server.ts` via `initSocket(server)`.
- **Auth:** Clients must send a valid **JWT** in the handshake:
  - `auth.token` (e.g. `socket.auth = { token: accessToken }`), or
  - `Authorization: Bearer <accessToken>` header.
- **Room:** Each authenticated socket is joined to room `user:${userId}`.
- **Emit:** After creating a notification in the DB, the server calls `emitNotification(userId, payload)`. Payload: `{ id, title, message, type, read, createdAt }` (ISO string).
- **Events:** Server emits `notification` to the user’s room with that payload.

Used in:

- `src/routes/orders.ts` – after “Order Placed” and “Order Cancelled” notifications.
- `src/routes/stripeWebhook.ts` – after “Payment Received” notification on `payment_intent.succeeded`.

## Mobile app (React Native / Expo)

1. **Install client**

   ```bash
   npx expo install socket.io-client
   ```

2. **Connect with JWT**

   - Use the same base URL as your API (e.g. `http://localhost:4000` or your deployed URL).
   - Pass the access token in `auth.token` or in the `Authorization` header.

   Example:

   ```ts
   import { io } from 'socket.io-client';

   const socket = io(API_BASE_URL, {
     path: '/socket.io',
     auth: { token: accessToken },
     transports: ['websocket'],
   });

   socket.on('connect', () => { /* optional */ });
   socket.on('notification', (payload) => {
     // payload: { id, title, message, type, read, createdAt }
     // Invalidate React Query cache so notifications list and unread count refetch:
     queryClient.invalidateQueries({ queryKey: ['notifications'] });
   });
   socket.on('connect_error', (err) => { /* handle auth/network errors */ });
   ```

3. **When to connect**

   - Connect after login (when you have an access token).
   - Disconnect on logout.
   - Reconnect with a new token after refresh if you refresh tokens in the background.

4. **React Query**

   - On `notification` event, call `queryClient.invalidateQueries({ queryKey: ['notifications'] })` (or your notification keys) so the list and unread count refetch and the UI updates automatically.

## Summary

- **Backend:** Socket.IO on the same server; JWT in handshake; join `user:${userId}`; emit `notification` after creating a notification in DB.
- **Mobile:** `socket.io-client`, connect with `auth.token` (access token), listen for `notification`, invalidate notification queries to refresh the UI. No page reload needed; updates are pushed as soon as the server creates a notification.
