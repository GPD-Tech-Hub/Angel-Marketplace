import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/server';

// Mock Prisma before app loads routes that use it
const mockFindMany = vi.fn();
const mockCount = vi.fn();
const mockFindFirst = vi.fn();
const mockUpdate = vi.fn();
const mockFindUnique = vi.fn();
const mockCreate = vi.fn();

vi.mock('../../src/lib/prisma', () => ({
  prisma: {
    notification: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (opts?: { where?: { read?: boolean } }) => mockCount(opts),
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
    notificationSettings: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

// Mock auth so we don't need a real JWT
vi.mock('../../src/middleware/authMiddleware', () => ({
  requireAuth: (_req: unknown, _res: unknown, next: () => void) => {
    (_req as { user?: { id: string; email: string } }).user = {
      id: 'user-1',
      email: 'test@example.com',
    };
    next();
  },
}));

describe('GET /api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindMany.mockResolvedValue([
      {
        id: 'n1',
        userId: 'user-1',
        title: 'Test',
        message: 'Message',
        type: 'order',
        read: false,
        createdAt: new Date('2025-01-01T00:00:00Z'),
      },
    ]);
    mockCount.mockImplementation((opts?: { where?: { read?: boolean } }) =>
      Promise.resolve(opts?.where?.read === false ? 1 : 1)
    );
  });

  it('returns 200 with success, data.notifications, pagination and unreadCount', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', 'Bearer any-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data.notifications)).toBe(true);
    expect(res.body.data.notifications).toHaveLength(1);
    expect(res.body.data.notifications[0].title).toBe('Test');
    expect(res.body.data.notifications[0].createdAt).toBe('2025-01-01T00:00:00.000Z');
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.limit).toBe(20);
    expect(res.body.data.totalPages).toBe(1);
    expect(typeof res.body.data.unreadCount).toBe('number');
  });

  it('accepts page and limit query params', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    const res = await request(app)
      .get('/api/notifications?page=2&limit=10')
      .set('Authorization', 'Bearer any-token');

    expect(res.status).toBe(200);
    expect(res.body.data.page).toBe(2);
    expect(res.body.data.limit).toBe(10);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      })
    );
  });
});

describe('GET /api/notifications/unread-count', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCount.mockResolvedValue(3);
  });

  it('returns 200 with success and data.unreadCount', async () => {
    const res = await request(app)
      .get('/api/notifications/unread-count')
      .set('Authorization', 'Bearer any-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.unreadCount).toBe(3);
  });
});

describe('PATCH /api/notifications/:id/read', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindFirst.mockResolvedValue({
      id: 'n1',
      userId: 'user-1',
      title: 'Test',
      message: 'Message',
      type: 'order',
      read: false,
      createdAt: new Date('2025-01-01T00:00:00Z'),
    });
    mockUpdate.mockResolvedValue({
      id: 'n1',
      userId: 'user-1',
      title: 'Test',
      message: 'Message',
      type: 'order',
      read: true,
      createdAt: new Date('2025-01-01T00:00:00Z'),
    });
  });

  it('returns 200 with updated notification when found', async () => {
    const res = await request(app)
      .patch('/api/notifications/n1/read')
      .set('Authorization', 'Bearer any-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.read).toBe(true);
  });

  it('returns 404 when notification not found', async () => {
    mockFindFirst.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/notifications/nonexistent/read')
      .set('Authorization', 'Bearer any-token');

    expect(res.status).toBe(404);
  });
});
