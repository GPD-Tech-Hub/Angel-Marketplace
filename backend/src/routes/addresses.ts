import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../middleware/authMiddleware';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

const addressSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  address: z.string().min(5),
  apartment: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  zipCode: z.string().min(4),
  country: z.string().min(2),
  phone: z.string().min(10),
  isDefault: z.boolean().default(false),
});

router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);
    const addresses = await prisma.address.findMany({ where: { userId: req.user.id }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
    return sendSuccess(res, { addresses: addresses.map((a) => ({ ...a, createdAt: a.createdAt.toISOString(), updatedAt: a.updatedAt.toISOString() })) });
  } catch (error) {
    console.error('Get addresses error:', error);
    return sendError(res, 'Internal server error', 500);
  }
});

router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);
    const body = addressSchema.parse(req.body);
    if (body.isDefault) await prisma.address.updateMany({ where: { userId: req.user.id, isDefault: true }, data: { isDefault: false } });
    const address = await prisma.address.create({ data: { ...body, userId: req.user.id } });
    return sendSuccess(
      res,
      { ...address, createdAt: address.createdAt.toISOString(), updatedAt: address.updatedAt.toISOString() },
      undefined,
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) return sendError(res, 'Validation error', 400, { errors: error.issues });
    console.error('Create address error:', error);
    return sendError(res, 'Internal server error', 500);
  }
});

router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);
    const body = addressSchema.partial().parse(req.body);
    const address = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!address) return sendError(res, 'Address not found', 404);
    if (body.isDefault) await prisma.address.updateMany({ where: { userId: req.user.id, isDefault: true, id: { not: req.params.id } }, data: { isDefault: false } });
    const updated = await prisma.address.update({ where: { id: req.params.id }, data: body });
    return sendSuccess(res, { ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
  } catch (error) {
    if (error instanceof z.ZodError) return sendError(res, 'Validation error', 400, { errors: error.issues });
    console.error('Update address error:', error);
    return sendError(res, 'Internal server error', 500);
  }
});

router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Not authenticated', 401);
    const address = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!address) return sendError(res, 'Address not found', 404);
    await prisma.address.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    console.error('Delete address error:', error);
    return sendError(res, 'Internal server error', 500);
  }
});

export default router;
