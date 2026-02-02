import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../middleware/authMiddleware';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { sendSuccess } from '../utils/response';

const router = Router();

const shippingAddressSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  address: z.string().min(5),
  apartment: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  zipCode: z.string().min(4),
  country: z.string().min(2),
  phone: z.string().min(10),
});

const createOrderSchemaLegacy = z.object({
  addressId: z.string().uuid(),
  paymentMethodId: z.string().uuid().optional(),
  couponCode: z.string().optional(),
});

const createOrderSchemaMobile = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['stripe', 'paystack', 'flutterwave']),
  couponCode: z.string().optional(),
});

const createOrderSchema = z.union([createOrderSchemaLegacy, createOrderSchemaMobile]);

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

type OrderWithRelations = Awaited<ReturnType<typeof prisma.order.findFirst>> & {
  address: { firstName: string; lastName: string; address: string; apartment: string | null; city: string; state: string; zipCode: string; country: string; phone: string };
  paymentMethod: { type: string } | null;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
    product: { id: string; name: string; slug: string; description: string | null; price: number; images: string[]; stock: number; categoryId: string; createdAt: Date; updatedAt: Date; category?: { id: string; name: string; slug: string } };
    createdAt: Date;
  }>;
  paymentProvider?: string | null;
  status: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  trackingNumber: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

function toMapOrderToMobileShape(order: OrderWithRelations) {
  const statusUpper = order.status.toUpperCase() as 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  return {
    id: order.id,
    orderNumber: `#${order.id.slice(-8).toUpperCase()}`,
    userId: order.userId,
    items: order.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      product: {
        id: i.product.id,
        name: i.product.name,
        slug: i.product.slug,
        description: i.product.description,
        price: i.product.price,
        images: i.product.images,
        stock: i.product.stock,
        categoryId: i.product.categoryId,
        category: i.product.category,
        createdAt: i.product.createdAt.toISOString(),
        updatedAt: i.product.updatedAt.toISOString(),
      },
      quantity: i.quantity,
      price: i.price,
    })),
    status: statusUpper,
    subtotal: order.subtotal,
    shipping: order.shippingFee,
    total: order.total,
    shippingAddress: {
      firstName: order.address.firstName,
      lastName: order.address.lastName,
      address: order.address.address,
      apartment: order.address.apartment ?? undefined,
      city: order.address.city,
      state: order.address.state,
      zipCode: order.address.zipCode,
      country: order.address.country,
      phone: order.address.phone,
    },
    paymentMethod: order.paymentProvider ?? order.paymentMethod?.type ?? 'stripe',
    trackingNumber: order.trackingNumber ?? undefined,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

// GET /api/orders — PaginatedResponse<Order>: { data: Order[], total, page, limit, totalPages }
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const where: any = { userId: req.user.id };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { address: true, paymentMethod: true, items: { include: { product: { include: { category: { select: { id: true, name: true, slug: true } } } } } }, reviews: { select: { id: true, rating: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const data = orders.map((o) => toMapOrderToMobileShape(o as OrderWithRelations));

    return sendSuccess(res, {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/orders/:id
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id?.[0];
    if (!id) return res.status(400).json({ message: 'Invalid id' });
    const order = await prisma.order.findFirst({ where: { id, userId: req.user.id }, include: { address: true, paymentMethod: true, items: { include: { product: { include: { category: { select: { id: true, name: true, slug: true } } } } } } } });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    return sendSuccess(res, toMapOrderToMobileShape(order as OrderWithRelations));
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/orders — accepts mobile payload { shippingAddress, paymentMethod } or legacy { addressId, paymentMethodId? }
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const body = createOrderSchema.parse(req.body);
    const cartItems = await prisma.cartItem.findMany({ where: { userId: req.user.id }, include: { product: true } });
    if (cartItems.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    let addressId: string;
    let paymentProvider: string | undefined;
    let paymentMethodId: string | undefined;

    if ('shippingAddress' in body) {
      const addr = body.shippingAddress;
      const newAddress = await prisma.address.create({
        data: {
          userId: req.user.id,
          firstName: addr.firstName,
          lastName: addr.lastName,
          address: addr.address,
          apartment: addr.apartment,
          city: addr.city,
          state: addr.state,
          zipCode: addr.zipCode,
          country: addr.country,
          phone: addr.phone,
          isDefault: false,
        },
      });
      addressId = newAddress.id;
      paymentProvider = body.paymentMethod;
    } else {
      const address = await prisma.address.findFirst({ where: { id: body.addressId, userId: req.user.id } });
      if (!address) return res.status(404).json({ message: 'Address not found' });
      addressId = body.addressId;
      paymentMethodId = body.paymentMethodId;
    }

    let subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let vat = 0;
    const shippingFee = 80;
    let discount = 0;
    const couponCode = 'couponCode' in body ? body.couponCode : body.couponCode;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (coupon && coupon.isActive && coupon.usedCount < (coupon.usageLimit ?? Infinity)) {
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
        addressId,
        paymentMethodId,
        paymentProvider: paymentProvider ?? undefined,
        status: 'pending',
        subtotal: subtotal + discount,
        vat,
        shippingFee,
        total,
        couponCode: couponCode ?? undefined,
        items: { create: cartItems.map((item) => ({ productId: item.productId, quantity: item.quantity, price: item.price, size: item.size, color: item.color })) },
      },
      include: { address: true, paymentMethod: true, items: { include: { product: { include: { category: { select: { id: true, name: true, slug: true } } } } } } },
    });
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    if (couponCode) await prisma.coupon.update({ where: { code: couponCode }, data: { usedCount: { increment: 1 } } });
    await prisma.notification.create({ data: { userId: req.user.id, title: 'Order Placed', message: `Your order #${order.id.slice(0, 8)} has been placed successfully.`, type: 'order' } });
    return sendSuccess(res, toMapOrderToMobileShape(order as OrderWithRelations), undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: 'Validation error', errors: error.issues });
    console.error('Create order error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/orders/:id/cancel
router.post('/:id/cancel', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow cancellation of pending or processing orders
    if (order.status !== 'pending' && order.status !== 'processing') {
      return res.status(400).json({
        message: `Cannot cancel order with status: ${order.status}. Only pending or processing orders can be cancelled.`,
      });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'cancelled' },
      include: {
        address: true,
        paymentMethod: true,
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        title: 'Order Cancelled',
        message: `Your order #${order.id.slice(0, 8)} has been cancelled.`,
        type: 'order',
      },
    });

    return sendSuccess(res, toMapOrderToMobileShape(updated as OrderWithRelations));
  } catch (error) {
    console.error('Cancel order error:', error);
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
    return sendSuccess(res, { ...review, createdAt: review.createdAt.toISOString(), updatedAt: review.updatedAt.toISOString() }, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ message: 'Validation error', errors: error.issues });
    console.error('Create review error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
