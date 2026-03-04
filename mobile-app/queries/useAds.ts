import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const ADS_URL = 'https://angelmarketplace.org/api/ads.php';

export interface Ad {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  destinationType: 'product' | 'category' | 'search' | 'custom';
  productId: string | null;
  categoryId: string | null;
  categorySlug: string | null;
  searchQuery: string | null;
  customUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

async function fetchAds(): Promise<Ad[]> {
  const response = await axios.get<{ success: boolean; data: Ad[] }>(ADS_URL);
  return response.data.data ?? [];
}

export function useAds() {
  return useQuery({
    queryKey: ['ads'],
    queryFn: fetchAds,
    staleTime: 1000 * 60 * 10, // 10 min — ads change infrequently
    retry: 1,
  });
}
