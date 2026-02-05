import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../middleware/authMiddleware';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { sendSuccess } from '../utils/response';

const router = Router();

const updateSettingsSchema = z.object({
  general: z.boolean().optional(),
  sound: z.boolean().optional(),
  vibrate: z.boolean().optional(),
  specialOffer: z.boolean().optional(),
  promoDiscounts: z.boolean().optional(),
  payments: z.boolean().optional(),
  cashback: z.boolean().optional(),
  appUpdates: z.boolean().optional(),
  newService: z.boolean().optional(),
  newTips: z.boolean().optional(),
});

// GET /api/notifications?page=1&limit=20
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit), 10) || 20));
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId: req.user.id } }),
      prisma.notification.count({ where: { userId: req.user.id, read: false } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return sendSuccess(res, {
      notifications: notifications.map((n) => ({
        ...n,
        createdAt: n.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
      totalPages,
      unreadCount,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/notifications/unread-count (lightweight, for badge)
router.get('/unread-count', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user.id, read: false },
    });

    return sendSuccess(res, { unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) return res.status(400).json({ message: 'Invalid id' });

    const notification = await prisma.notification.findFirst({
      where: { id, userId: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return sendSuccess(res, {
      ...updated,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/notifications/settings
router.get('/settings', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: req.user.id },
    });

    if (!settings) {
      // Create default settings if they don't exist
      settings = await prisma.notificationSettings.create({
        data: { userId: req.user.id },
      });
    }

    return sendSuccess(res, {
      general: settings.general,
      sound: settings.sound,
      vibrate: settings.vibrate,
      specialOffer: settings.specialOffer,
      promoDiscounts: settings.promoDiscounts,
      payments: settings.payments,
      cashback: settings.cashback,
      appUpdates: settings.appUpdates,
      newService: settings.newService,
      newTips: settings.newTips,
      updatedAt: settings.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/notifications/settings
router.patch('/settings', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const body = updateSettingsSchema.parse(req.body);

    let settings = await prisma.notificationSettings.findUnique({
      where: { userId: req.user.id },
    });

    if (!settings) {
      settings = await prisma.notificationSettings.create({
        data: { userId: req.user.id, ...body },
      });
    } else {
      settings = await prisma.notificationSettings.update({
        where: { userId: req.user.id },
        data: body,
      });
    }

    return sendSuccess(res, {
      general: settings.general,
      sound: settings.sound,
      vibrate: settings.vibrate,
      specialOffer: settings.specialOffer,
      promoDiscounts: settings.promoDiscounts,
      payments: settings.payments,
      cashback: settings.cashback,
      appUpdates: settings.appUpdates,
      newService: settings.newService,
      newTips: settings.newTips,
      updatedAt: settings.updatedAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error('Update notification settings error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
