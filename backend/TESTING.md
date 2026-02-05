# Backend testing

## How we try to avoid errors

1. **Unit tests** – Response helpers (`sendSuccess`, `sendError`) are tested so we know the API response shape is correct.
2. **Route tests** – Notification routes (list, pagination, unread-count, mark read) are tested with **mocked Prisma** so they run without a database. These tests check status codes, `success: true`, and response shape.
3. **No DB in CI** – Route tests use `vi.mock('../../src/lib/prisma')` and `vi.mock('../../src/middleware/authMiddleware')` so you can run `npm test` without a real DB or JWT.

## Running tests

```bash
npm test          # run all tests once (Vitest)
npm run test:watch  # run tests in watch mode
```

## What is covered

- **`tests/utils/response.test.ts`** – `sendSuccess` and `sendError` (status, body shape).
- **`tests/routes/notifications.test.ts`** – GET `/api/notifications` (list + pagination), GET `/api/notifications/unread-count`, PATCH `/api/notifications/:id/read` (success and 404), with mocked Prisma and auth.

## What is not covered (yet)

- Auth routes (login, register, refresh) – would need test user or mocked Prisma.
- Orders, cart, products, payments – same idea: add tests with mocks or a test DB.
- Real database integration – for full integration tests, use a test DB and run migrations, then point `DATABASE_URL` to it and add tests that hit the real Prisma client.

## Being “sure” there are no errors

- **Tests** reduce regressions: if someone changes response shape or notification logic, tests should fail.
- **Types** (TypeScript + Prisma) catch many mistakes at build time.
- **Manual/QA** – run the app and mobile client, create orders, mark notifications read, and check WebSocket push.
- **Optional** – add more route tests (auth, orders, cart) and/or run integration tests against a test DB for higher confidence.
