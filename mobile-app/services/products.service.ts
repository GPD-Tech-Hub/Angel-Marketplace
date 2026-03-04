import api from './api';
import { ENDPOINTS } from '@/constants/endpoints';
import {
  Product,
  Category,
  Ad,
  PaginatedProducts,
  ProductFilters,
  ApiResponse,
} from '@/types';

export const productsService = {
  async getProducts(
    filters?: ProductFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedProducts> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));

    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.minPrice) params.append('minPrice', String(filters.minPrice));
    if (filters?.maxPrice) params.append('maxPrice', String(filters.maxPrice));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);

    const response = await api.get<ApiResponse<PaginatedProducts>>(
      `${ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`
    );
    return response.data.data;
  },

  async getProduct(slug: string): Promise<Product> {
    const response = await api.get<ApiResponse<Product>>(
      ENDPOINTS.PRODUCTS.DETAIL(slug)
    );
    return response.data.data;
  },

  async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    const response = await api.get<ApiResponse<Product[]>>(
      `${ENDPOINTS.PRODUCTS.SEARCH}?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    return response.data.data;
  },

  async getCategories(): Promise<Category[]> {
    const response = await api.get<ApiResponse<Category[]>>(
      ENDPOINTS.CATEGORIES.LIST
    );
    return response.data.data;
  },

  async getCategory(slug: string): Promise<Category> {
    const response = await api.get<ApiResponse<Category>>(
      ENDPOINTS.CATEGORIES.DETAIL(slug)
    );
    return response.data.data;
  },

  async getCategoryProducts(
    slug: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedProducts> {
    const response = await api.get<ApiResponse<PaginatedProducts>>(
      `${ENDPOINTS.CATEGORIES.PRODUCTS(slug)}?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  async getTrending(limit: number = 10): Promise<Product[]> {
    const response = await api.get<ApiResponse<{ products: Product[] }>>(
      `${ENDPOINTS.PRODUCTS.TRENDING}?limit=${limit}`
    );
    return response.data.data.products ?? [];
  },

  async getAds(limit: number = 5, categorySlug?: string): Promise<Ad[]> {
    const params = new URLSearchParams();
    params.append('limit', String(limit));
    if (categorySlug) params.append('categorySlug', categorySlug);

    const response = await api.get<ApiResponse<Ad[]>>(
      `${ENDPOINTS.ADS.LIST}?${params.toString()}`
    );
    return response.data.data ?? [];
  },
};

export default productsService;
