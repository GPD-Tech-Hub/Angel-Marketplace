import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../middleware/authMiddleware';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const router = Router();

const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethodId: z.string().uuid().optional(),
  couponCode: z.string().optional(),
});

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

// GET /api/orders
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const status = req.query.status as string | undefined;
    const where: any = { userId: req.user.id };
    if (status) where.status = status;
    const orders = await prisma.order.findMany({
      where,
      include: { address: true, paymentMethod: true, items: { include: { product: { include: { category: { select: { id: true, name: true, slug: true } } } } } }, reviews: { select: { id: true, rating: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ orders: orders.map((o) => ({ ...o, items: o.items.map((i) => ({ ...i, product: { ...i.product, createdAt: i.product.createdAt.toISOString(), updatedAt: i.product.updatedAt.toISOString() }, createdAt: i.createdAt.toISOString() })), address: { ...o.address, createdAt: o.address.createdAt.toISOString(), updatedAt: o.address.updatedAt.toISOString() }, paymentMethod: o.paymentMethod ? { ...o.paymentMethod, createdAt: o.paymentMethod.createdAt.toISOString(), updatedAt: o.paymentMethod.updatedAt.toISOString() } : null, createdAt: o.createdAt.toISOString(), updatedAt: o.updatedAt.toISOString() })) });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/orders/:id
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user.id }, include: { address: true, paymentMethod: true, items: { include: { product: { include: { category: { select: { id: true, name: true, slug: true } } } } } }, reviews: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } } });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return res.json({ ...order, items: order.items.map((i) => ({ ...i, product: { ...i.product, createdAt: i.product.createdAt.toISOString(), updatedAt: i.product.updatedAt.toISOString() }, createdAt: i.createdAt.toISOString() })), address: { ...order.address, createdAt: order.address.createdAt.toISOString(), updatedAt: order.address.updatedAt.toISOString() }, paymentMethod: order.paymentMethod ? { ...order.paymentMethod, createdAt: order.paymentMethod.createdAt.toISOString(), updatedAt: order.paymentMethod.updatedAt.toISOString() } : null, reviews: order.reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })), createdAt: order.createdAt.toISOString(), updatedAt: order.updatedAt.toISOString() });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/orders
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const body = createOrderSchema.parse(req.body);
    const cartItems = await prisma.cartItem.findMany({ where: { userId: req.user.id }, include: { product: true } });
    if (cartItems.length === 0) return res.status(400).json({ message: 'Cart is empty' });
    const address = await prisma.address.findFirst({ where: { id: body.addressId, userId: req.user.id } });
    if (!address) return res.status(404).json({ message: 'Address not found' });
    let subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let vat = 0;
    const shippingFee = 80;
    let discount = 0;
    if (body.couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: body.couponCode } });
      if (coupon && coupon.isActive && coupon.usedCount < (coupon.usageLimit || Infinity)) {
        if (coupon.discountType === 'percentage') {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
        } else discount = coupon.discountValue;
        subtotal -= discount;
      }
    }
    const total = subtotal + vat + shippingFee;
    const order = await prisma.order.create({
      data: {
        userId: req.user.id,
        addressId: body.addressId,
        paymentMethodId: body.paymentMethodId || undefined,
        status: 'pending',
        subtotal: subtotal + discount,
        vat,
        shippingFee,
        total,
        couponCode: body.couponCode || undefined,
        items: { create: cartItems.map((item) => ({ productId: item.productId, quantity: item.quantity, price: item.price, size: item.size, color: item.color })) },
      },
      include: { address: true, paymentMethod: true, items: { include: { product: { include: { category: { select: { id: true, name: true, slug: true } } } } } } },
    });
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    if (body.couponCode) await prisma.coupon.update({ where: { code: body.couponCode }, data: { usedCount: { increment: 1 } } });
    await prisma.notification.create({ data: { userId: req.user.id, title: 'Order Placed', message: `Your order #${order.id.slice(0, 8)} has been placed successfully.`, type: 'order' } });
    return res.status(201).json({ ...order, items: order.items.map((i) => ({ ...i, product: { ...i.product, createdAt: i.product.createdAt.toISOString(), updatedAt: i.product.updatedAt.toISOString() }, createdAt: i.createdAt.toISOString() })), address: { ...order.address, createdAt: order.address.createdAt.toISOString(), updatedAt: order.address.updatedAt.toISOString() }, paymentMethod: order.paymentMethod ? { ...order.paymentMethod, createdAt: order.paymentMethod.createdAt.toISOString(), updatedAt: order.paymentMethod.updatedAt.toISOString() } : null, createdAt: order.createdAt.toISOString(), updatedAt: order.updatedAt.toISOString() });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: 'Validation error', errors: error.issues });
    console.error('Create order error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/orders/:id/review
router.post('/:id/review', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const body = createReviewSchema.parse(req.body);
    const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: req.user.id, status: 'delivered' } });
    if (!order) return res.status(404).json({ message: 'Order not found or not delivered' });
    const existingReview = await prisma.review.findUnique({ where: { userId_orderId: { userId: req.user.id, orderId: order.id } } });
    if (existingReview) return res.status(409).json({ message: 'Review already exists for this order' });
    const orderItem = await prisma.orderItem.findFirst({ where: { orderId: order.id } });
    if (!orderItem) return res.status(400).json({ message: 'Order has no items' });
    const review = await prisma.review.create({
      data: { userId: req.user.id, productId: orderItem.productId, orderId: order.id, rating: body.rating, comment: body.comment },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
    return res.status(201).json({ ...review, createdAt: review.createdAt.toISOString(), updatedAt: review.updatedAt.toISOString() });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: 'Validation error', errors: error.issues });
    console.error('Create review error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
