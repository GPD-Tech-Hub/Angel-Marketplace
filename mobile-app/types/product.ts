export interface ProductReview {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  verifiedPurchase?: boolean;
  source?: 'mobile' | 'php';
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
  /** Per-currency prices map returned by the backend, e.g. { GBP: 9.99, USD: 12.50 } */
  prices?: Record<string, number>;
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
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
