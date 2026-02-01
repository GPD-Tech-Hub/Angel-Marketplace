/**
 * DTOs (Data Transfer Objects) for API request/response shapes.
 * Used for Swagger/OpenAPI documentation and type consistency.
 */

// ----- Auth -----
export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface AuthResponseDto {
  user: UserDto;
  tokens: { accessToken: string; refreshToken: string };
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  password: string;
}

// ----- User -----
export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatar?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
}

// ----- API Response Wrapper -----
export interface ApiResponseDto<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorDto {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ----- Pagination -----
export interface PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ----- Product / Category -----
export interface ProductDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  images: string[];
  stock: number;
  categoryId: string;
  category?: CategoryRefDto;
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRefDto {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedProductsDto {
  products: ProductDto[];
  pagination: PaginationMetaDto;
}

// ----- Cart -----
export interface CartItemDto {
  id: string;
  productId: string;
  product: ProductDto;
  quantity: number;
  price: number;
  size?: string | null;
  color?: string | null;
  createdAt: string;
}

export interface CartDto {
  items: CartItemDto[];
  subtotal: number;
  itemCount: number;
}

export interface AddToCartDto {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface UpdateCartItemDto {
  quantity: number;
}

// ----- Address -----
export interface AddressDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressDto {
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

// ----- Order -----
export interface OrderItemDto {
  id: string;
  productId: string;
  product: ProductDto;
  quantity: number;
  price: number;
  size?: string | null;
  color?: string | null;
  createdAt: string;
}

export interface OrderDto {
  id: string;
  userId: string;
  addressId: string;
  paymentMethodId?: string | null;
  status: string;
  subtotal: number;
  vat: number;
  shippingFee: number;
  total: number;
  couponCode?: string | null;
  trackingNumber?: string | null;
  address: AddressDto;
  paymentMethod?: unknown | null;
  items: OrderItemDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  addressId: string;
  paymentMethodId?: string;
  couponCode?: string;
}

export interface PaginatedOrdersDto {
  orders: OrderDto[];
  pagination?: PaginationMetaDto;
}

// ----- Favorites -----
export interface FavoriteProductDto extends ProductDto {}

// ----- Payment -----
export interface CreatePaymentIntentDto {
  amount: number;
  currency?: string;
  orderId?: string;
}

export interface ConfirmPaymentDto {
  paymentIntentId: string;
  paymentMethodId?: string;
}
