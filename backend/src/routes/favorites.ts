import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../middleware/authMiddleware';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { sendSuccess } from '../utils/response';

const router = Router();
const addFavoriteBodySchema = z.object({ productId: z.string().uuid() });

// GET /api/favorites
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            category: {
              select: { id: true, name: true, slug: true },
            },
            reviews: {
              select: { rating: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const productsWithRating = favorites.map((fav) => {
      const avgRating =
        fav.product.reviews.length > 0
          ? fav.product.reviews.reduce((sum, r) => sum + r.rating, 0) / fav.product.reviews.length
          : 0;

      return {
        id: fav.product.id,
        name: fav.product.name,
        slug: fav.product.slug,
        description: fav.product.description,
        price: fav.product.price,
        images: fav.product.images,
        stock: fav.product.stock,
        categoryId: fav.product.categoryId,
        category: fav.product.category,
        rating: Math.round(avgRating * 10) / 10,
        reviewsCount: fav.product.reviews.length,
        createdAt: fav.product.createdAt.toISOString(),
        updatedAt: fav.product.updatedAt.toISOString(),
      };
    });

    return sendSuccess(res, { products: productsWithRating });
  } catch (error) {
    console.error('Get favorites error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/favorites - Add to favorites (body: { productId }) - mobile app expects this
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    const body = addFavoriteBodySchema.parse(req.body);
    const productId = body.productId;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const existing = await prisma.favorite.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });
    if (existing) return res.status(409).json({ message: 'Product already in favorites' });
    const favorite = await prisma.favorite.create({
      data: { userId: req.user.id, productId },
    });
    return sendSuccess(res, {
      id: favorite.id,
      productId: favorite.productId,
      createdAt: favorite.createdAt.toISOString(),
    }, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.issues });
    }
    console.error('Add favorite error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/favorites/:productId
router.post('/:productId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const product = await prisma.product.findUnique({
      where: { id: req.params.productId },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: req.params.productId,
        },
      },
    });

    if (existing) {
      return res.status(409).json({ message: 'Product already in favorites' });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user.id,
        productId: req.params.productId,
      },
    });

    return sendSuccess(res, {
      id: favorite.id,
      productId: favorite.productId,
      createdAt: favorite.createdAt.toISOString(),
    }, undefined, 201);
  } catch (error) {
    console.error('Add favorite error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/favorites/:productId
router.delete('/:productId', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_productId: {
          userId: req.user.id,
          productId: req.params.productId,
        },
      },
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    await prisma.favorite.delete({
      where: { id: favorite.id },
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Remove favorite error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
