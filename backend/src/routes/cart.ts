import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../middleware/authMiddleware';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { sendSuccess } from '../utils/response';

const router = Router();

const addToCartSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
  size: z.string().optional(),
  color: z.string().optional(),
});

const updateCartSchema = z.object({
  quantity: z.number().int().positive(),
});

// GET /api/cart
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Cart shape for mobile: Cart = { id, userId, items, subtotal, itemCount, createdAt, updatedAt }
    const itemDates = cartItems.flatMap((i) => [i.createdAt.getTime(), i.updatedAt.getTime()]);
    const minTs = itemDates.length ? Math.min(...itemDates) : Date.now();
    const maxTs = itemDates.length ? Math.max(...itemDates) : Date.now();

    return sendSuccess(res, {
      id: req.user.id,
      userId: req.user.id,
      items: cartItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        product: {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          description: item.product.description,
          price: item.product.price,
          images: item.product.images,
          stock: item.product.stock,
          categoryId: item.product.categoryId,
          category: item.product.category,
          createdAt: item.product.createdAt.toISOString(),
        },
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        createdAt: item.createdAt.toISOString(),
      })),
      subtotal,
      itemCount,
      createdAt: new Date(minTs).toISOString(),
      updatedAt: new Date(maxTs).toISOString(),
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/cart/items - Add item to cart
router.post('/items', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const body = addToCartSchema.parse(req.body);
    const { productId, quantity, size, color } = body;

    // Get product to get current price
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if item already in cart
    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_productId_size_color: {
          userId: req.user.id,
          productId,
          size: size || null,
          color: color || null,
        },
      },
    });

    if (existing) {
      // Update quantity
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: {
          product: {
            include: {
              category: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
      });

      return sendSuccess(res, {
        id: updated.id,
        productId: updated.productId,
        product: {
          id: updated.product.id,
          name: updated.product.name,
          slug: updated.product.slug,
          description: updated.product.description,
          price: updated.product.price,
          images: updated.product.images,
          stock: updated.product.stock,
          categoryId: updated.product.categoryId,
          category: updated.product.category,
          createdAt: updated.product.createdAt.toISOString(),
        },
        quantity: updated.quantity,
        price: updated.price,
        size: updated.size,
        color: updated.color,
        createdAt: updated.createdAt.toISOString(),
      });
    }

    // Create new cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        userId: req.user.id,
        productId,
        quantity,
        price: product.price,
        size,
        color,
      },
      include: {
        product: {
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    return sendSuccess(res, {
      id: cartItem.id,
      productId: cartItem.productId,
      product: {
        id: cartItem.product.id,
        name: cartItem.product.name,
        slug: cartItem.product.slug,
        description: cartItem.product.description,
        price: cartItem.product.price,
        images: cartItem.product.images,
        stock: cartItem.product.stock,
        categoryId: cartItem.product.categoryId,
        category: cartItem.product.category,
        createdAt: cartItem.product.createdAt.toISOString(),
      },
      quantity: cartItem.quantity,
      price: cartItem.price,
      size: cartItem.size,
      color: cartItem.color,
      createdAt: cartItem.createdAt.toISOString(),
    }, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error('Add to cart error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/cart/items/:id - Update cart item
router.patch('/items/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const body = updateCartSchema.parse(req.body);

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const updated = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: body.quantity },
      include: {
        product: {
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    return sendSuccess(res, {
      id: updated.id,
      productId: updated.productId,
      product: {
        id: updated.product.id,
        name: updated.product.name,
        slug: updated.product.slug,
        description: updated.product.description,
        price: updated.product.price,
        images: updated.product.images,
        stock: updated.product.stock,
        categoryId: updated.product.categoryId,
        category: updated.product.category,
        createdAt: updated.product.createdAt.toISOString(),
      },
      quantity: updated.quantity,
      price: updated.price,
      size: updated.size,
      color: updated.color,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error('Update cart error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/cart/items/:id - Remove cart item
router.delete('/items/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Delete cart item error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/cart/clear - Clear entire cart (mobile app expects this path)
router.delete('/clear', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    return res.status(204).send();
  } catch (error) {
    console.error('Clear cart error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/cart - Clear entire cart
router.delete('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    return res.status(204).send();
  } catch (error) {
    console.error('Clear cart error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
