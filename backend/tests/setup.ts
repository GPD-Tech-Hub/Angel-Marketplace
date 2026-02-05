/**
 * Vitest setup: ensure test env and optional global mocks.
 * NODE_ENV=test is set by Vitest so the server does not listen.
 */
process.env.NODE_ENV = 'test';
