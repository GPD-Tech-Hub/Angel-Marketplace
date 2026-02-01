import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { sendSuccess } from '../utils/response';

const router = Router();

// GET /api/products - List products with pagination, search, filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100); // Max 100 items
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const categoryId = req.query.categoryId as string;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';

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
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          reviews: {
            select: { rating: true },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

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

    // PaginatedProducts: { products, total, page, limit, totalPages }
    return sendSuccess(res, {
      products: productsWithRating,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/products/search - Search products
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        reviews: {
          select: { rating: true },
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

    return sendSuccess(res, { products: productsWithRating });
  } catch (error) {
    console.error('Search products error:', error);
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

    return sendSuccess(res, { products: productsWithRating });
  } catch (error) {
    console.error('Get trending products error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/products/:slug - Get product by slug (preferred)
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    // Try to find by slug first
    let product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
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

    // If not found by slug, try by ID (for backward compatibility)
    if (!product) {
      product = await prisma.product.findUnique({
        where: { id: req.params.slug },
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
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : 0;

    return sendSuccess(res, {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      images: product.images,
      stock: product.stock,
      categoryId: product.categoryId,
      category: product.category,
      rating: Math.round(avgRating * 10) / 10,
      reviewsCount: product.reviews.length,
      reviews: product.reviews.map((r) => ({
        id: r.id,
        userId: r.userId,
        user: r.user,
        rating: r.rating,
        comment: r.comment,
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

// GET /api/products/categories/all - Legacy endpoint (redirects to /categories)
router.get('/categories/all', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { products: true },
        },
      },
    });

    return sendSuccess(res, {
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        image: c.image,
        productCount: c._count.products,
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
