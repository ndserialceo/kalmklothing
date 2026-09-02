export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  last_login?: string;
}

export interface Address {
  id: string;
  user?: string;
  label: string;
  first_name: string;
  last_name: string;
  phone: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string | null;
  children?: Category[];
  product_count?: number;
  is_active: boolean;
  sort_order: number;
}

export interface ProductImage {
  id: string;
  image: string;
  alt_text?: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: string;
  compare_at_price?: string;
  stock: number;
  is_active: boolean;
  options: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  category: Category;
  category_name: string;
  price: string;
  compare_at_price?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
  sku?: string;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_bestseller: boolean;
  rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product: Product;
  product_id: string;
  variant?: ProductVariant;
  variant_id?: string;
  quantity: number;
  price: string;
  total: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: string;
  discount: string;
  total: string;
  coupon?: Coupon;
  item_count: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  product_name: string;
  product_image?: string;
  variant_name?: string;
  quantity: number;
  unit_price: string;
  total: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  status_display: string;
  items: OrderItem[];
  subtotal: string;
  shipping_cost: string;
  discount: string;
  total: string;
  shipping_address: Address;
  billing_address?: Address;
  payment_status: string;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  shipped_at?: string;
  delivered_at?: string;
}

export interface Payment {
  id: string;
  order: string;
  gateway: string;
  reference: string;
  amount: string;
  status: string;
  status_display: string;
  currency: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  verified_at?: string;
}

export interface Wishlist {
  id: string;
  items: WishlistItem[];
  item_count: number;
}

export interface WishlistItem {
  id: string;
  product: Product;
  product_id: string;
  added_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: string;
  min_order_amount?: string;
  max_discount_amount?: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  usage_count: number;
  usage_limit?: number;
}

export interface Review {
  id: string;
  user: User;
  product: string;
  rating: number;
  title?: string;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  description?: string;
}

export interface DashboardStats {
  total_revenue: string;
  total_orders: number;
  total_customers: number;
  total_products: number;
  revenue_growth: number;
  order_growth: number;
  recent_orders: Order[];
  top_products: Product[];
  revenue_by_day: { date: string; amount: string }[];
  orders_by_status: { status: string; count: number }[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}
