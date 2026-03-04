export interface ProductReview {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: { firstName: string; lastName: string };
}

export interface ProductFeature {
  featureName: string;
  featureValue: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  images: string[];
  stock: number;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt?: string;
  // Variants
  hasSizes?: boolean;
  hasColors?: boolean;
  sizes?: string[];
  colors?: string[];
  // Features / specs
  features?: ProductFeature[];
  // Reviews
  rating?: number;
  reviewsCount?: number;
  reviews?: ProductReview[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  productCount?: number;
}

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
