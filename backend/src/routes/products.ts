import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest, requireAuth } from '../middleware/authMiddleware';

const router = Router();

// GET /api/products - List products with pagination, search, filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const categoryId = req.query.categoryId as string;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    return res.json({
      products: products.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/products/trending
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Get products with most reviews (trending)
    const products = await prisma.product.findMany({
      include: {
        reviews: {
          select: { rating: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const productsWithRating = products.map((p) => {
      const avgRating =
        p.reviews.length > 0
          ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
          : 0;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        images: p.images,
        stock: p.stock,
        categoryId: p.categoryId,
        category: p.category,
        rating: Math.round(avgRating * 10) / 10,
        reviewsCount: p.reviews.length,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    });

    return res.json({ products: productsWithRating });
  } catch (error) {
    console.error('Get trending products error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        reviews: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;

    return res.json({
      ...product,
      rating: Math.round(avgRating * 10) / 10,
      reviewsCount: product.reviews.length,
      reviews: product.reviews.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/products/categories
router.get('/categories/all', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
    });

    return res.json({
      categories: categories.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
