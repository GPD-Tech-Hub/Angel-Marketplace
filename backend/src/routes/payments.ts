import { Router, Request, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../middleware/authMiddleware';
import { prisma } from '../lib/prisma';
import { stripe, isStripeEnabled, getStripePublishableKey, isLive } from '../lib/stripe';
import { z } from 'zod';
import { sendSuccess } from '../utils/response';

const router = Router();

// GET /api/payments/config — public; returns Stripe publishable key for current env (single source of truth for mobile)
router.get('/config', (_req: Request, res: Response) => {
  const enabled = isStripeEnabled();
  const publishableKey = enabled ? getStripePublishableKey() : null;
  const stripeEnvironment = isLive() ? 'live' : 'test';
  return sendSuccess(res, {
    stripePublishableKey: publishableKey || null,
    stripeEnvironment,
    stripeEnabled: enabled,
  });
});

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
    return sendSuccess(res, { paymentMethods: paymentMethods.map((pm) => ({ ...pm, createdAt: pm.createdAt.toISOString(), updatedAt: pm.updatedAt.toISOString() })) });
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
    const data = { ...paymentMethod, createdAt: paymentMethod.createdAt.toISOString(), updatedAt: paymentMethod.updatedAt.toISOString() };
    return sendSuccess(res, data, undefined, 201);
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
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) return res.status(400).json({ message: 'Invalid id' });
    const body = paymentMethodSchema.partial().parse(req.body);
    const paymentMethod = await prisma.paymentMethod.findFirst({ where: { id, userId: req.user.id } });
    if (!paymentMethod) return res.status(404).json({ message: 'Payment method not found' });
    if (body.isDefault) await prisma.paymentMethod.updateMany({ where: { userId: req.user.id, isDefault: true, id: { not: id } }, data: { isDefault: false } });
    const updated = await prisma.paymentMethod.update({ where: { id }, data: body });
    return sendSuccess(res, { ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() });
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
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) return res.status(400).json({ message: 'Invalid id' });
    const paymentMethod = await prisma.paymentMethod.findFirst({ where: { id, userId: req.user.id } });
    if (!paymentMethod) return res.status(404).json({ message: 'Payment method not found' });
    await prisma.paymentMethod.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    console.error('Delete payment method error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

const createPaymentIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('USD'),
  orderId: z.string().uuid().optional(),
  provider: z.enum(['stripe', 'paystack', 'flutterwave']).default('stripe'),
  email: z.string().email().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

// POST /api/payments/create-intent - Create payment intent (Stripe)
router.post('/create-intent', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    const body = createPaymentIntentSchema.parse(req.body);

    if (body.provider !== 'stripe') {
      return res.status(400).json({
        message: 'Only Stripe is supported. Set provider to "stripe" or omit.',
      });
    }

    if (!isStripeEnabled()) {
      return res.status(503).json({
        message: 'Stripe is not configured. Set STRIPE_TEST_SECRET_KEY or STRIPE_LIVE_SECRET_KEY (or STRIPE_SECRET_KEY) per STRIPE_ENVIRONMENT.',
      });
    }

    const amountCents = Math.round(body.amount * 100);
    const metadata: Record<string, string> = {
      userId: req.user.id,
      ...(body.orderId && { orderId: body.orderId }),
      ...body.metadata,
    };

    const paymentIntent = await stripe!.paymentIntents.create({
      amount: amountCents,
      currency: body.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata,
      ...(body.email && { receipt_email: body.email }),
    });

    return sendSuccess(
      res,
      {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret ?? undefined,
        amount: body.amount,
        currency: body.currency,
        provider: 'stripe' as const,
        status: paymentIntent.status,
      },
      undefined,
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error('Create payment intent error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1),
  provider: z.enum(['stripe', 'paystack', 'flutterwave']).default('stripe'),
  reference: z.string().optional(),
  paymentMethodId: z.string().uuid().optional(),
});

// POST /api/payments/confirm - Confirm payment (retrieve Stripe PaymentIntent status)
router.post('/confirm', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    const body = confirmPaymentSchema.parse(req.body);

    if (body.provider !== 'stripe') {
      return res.status(400).json({
        message: 'Only Stripe is supported. Set provider to "stripe" or omit.',
      });
    }

    if (!isStripeEnabled()) {
      return res.status(503).json({
        message: 'Stripe is not configured. Set STRIPE_TEST_SECRET_KEY or STRIPE_LIVE_SECRET_KEY (or STRIPE_SECRET_KEY) per STRIPE_ENVIRONMENT.',
      });
    }

    const paymentIntent = await stripe!.paymentIntents.retrieve(body.paymentIntentId);
    const success = paymentIntent.status === 'succeeded';

    return sendSuccess(res, {
      success,
      paymentIntentId: body.paymentIntentId,
      status: paymentIntent.status,
      message: success ? 'Payment confirmed successfully' : `Payment status: ${paymentIntent.status}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error('Confirm payment error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Webhook is mounted in server.ts with raw body (see stripeWebhookHandler)

export default router;
