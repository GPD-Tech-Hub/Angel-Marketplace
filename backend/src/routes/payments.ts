import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../middleware/authMiddleware';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

const paymentMethodSchema = z.object({
  type: z.string(),
  brand: z.string().optional(),
  last4: z.string().optional(),
  cardNumber: z.string().optional(),
  expiryMonth: z.number().int().min(1).max(12).optional(),
  expiryYear: z.number().int().min(new Date().getFullYear()).optional(),
  isDefault: z.boolean().default(false),
});

// GET /api/payments
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const paymentMethods = await prisma.paymentMethod.findMany({ where: { userId: req.user.id }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
    return res.json({ paymentMethods: paymentMethods.map((pm) => ({ ...pm, createdAt: pm.createdAt.toISOString(), updatedAt: pm.updatedAt.toISOString() })) });
  } catch (error) {
    console.error('Get payment methods error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/payments
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const body = paymentMethodSchema.parse(req.body);
    if (body.isDefault) await prisma.paymentMethod.updateMany({ where: { userId: req.user.id, isDefault: true }, data: { isDefault: false } });
    const paymentMethod = await prisma.paymentMethod.create({ data: { ...body, userId: req.user.id } });
    return res.status(201).json({ ...paymentMethod, createdAt: paymentMethod.createdAt.toISOString(), updatedAt: paymentMethod.updatedAt.toISOString() });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: 'Validation error', errors: error.issues });
    console.error('Create payment method error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/payments/:id
router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const body = paymentMethodSchema.partial().parse(req.body);
    const paymentMethod = await prisma.paymentMethod.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!paymentMethod) return res.status(404).json({ message: 'Payment method not found' });
    if (body.isDefault) await prisma.paymentMethod.updateMany({ where: { userId: req.user.id, isDefault: true, id: { not: req.params.id } }, data: { isDefault: false } });
    const updated = await prisma.paymentMethod.update({ where: { id: req.params.id }, data: body });
    return res.json({ ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: 'Validation error', errors: error.issues });
    console.error('Update payment method error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/payments/:id
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const paymentMethod = await prisma.paymentMethod.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!paymentMethod) return res.status(404).json({ message: 'Payment method not found' });
    await prisma.paymentMethod.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    console.error('Delete payment method error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
