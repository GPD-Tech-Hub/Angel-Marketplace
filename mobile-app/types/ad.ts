export interface Ad {
  id: string;
  title: string;
  description?: string | null;
  image?: string | null;
  destinationType: string;
  productId?: string | null;
  categoryId?: string | null;
  categorySlug?: string | null;
  searchQuery?: string | null;
  customUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}
