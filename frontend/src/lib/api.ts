import axios from "axios";
import toast from "react-hot-toast";
import { API_URL } from "./constants";
import type {
  User,
  Address,
  Category,
  Product,
  Cart,
  Order,
  Payment,
  Review,
  Wishlist,
  Coupon,
  DashboardStats,
  Notification,
  Setting,
  PaginatedResponse,
  ApiResponse,
} from "./types";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      "Something went wrong";

    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
      }
    }

    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

// Auth
export const auth = {
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>("/auth/login/", data),

  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) =>
    api.post<ApiResponse<{ user: User; token: string }>>(
      "/auth/register/",
      data
    ),

  logout: () => api.post("/auth/logout/"),

  getProfile: () => api.get<ApiResponse<User>>("/auth/profile/"),

  updateProfile: (data: Partial<User>) =>
    api.patch<ApiResponse<User>>("/auth/profile/", data),

  changePassword: (data: { old_password: string; new_password: string }) =>
    api.post("/auth/change-password/", data),
};

// Products
export const products = {
  getParams: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Product>>("/products/", { params }),

  getProduct: (slug: string) =>
    api.get<ApiResponse<Product>>(`/products/${slug}/`),

  getFeatured: () =>
    api.get<PaginatedResponse<Product>>("/products/", {
      params: { is_featured: true },
    }),

  getNewArrivals: () =>
    api.get<PaginatedResponse<Product>>("/products/", {
      params: { is_new_arrival: true },
    }),

  getBestSellers: () =>
    api.get<PaginatedResponse<Product>>("/products/", {
      params: { is_bestseller: true },
    }),

  searchProducts: (query: string) =>
    api.get<PaginatedResponse<Product>>("/products/search/", {
      params: { q: query },
    }),
};

// Categories
export const categories = {
  getCategories: () =>
    api.get<PaginatedResponse<Category>>("/categories/"),

  getCategoryProducts: (
    slug: string,
    params?: Record<string, string | number | boolean>
  ) =>
    api.get<PaginatedResponse<Product>>(`/categories/${slug}/products/`, {
      params,
    }),

  getCategoryTree: () =>
    api.get<ApiResponse<Category[]>>("/categories/tree/"),
};

// Cart
export const cart = {
  getCart: () => api.get<ApiResponse<Cart>>("/cart/"),

  addToCart: (data: { product_id: string; variant_id?: string; quantity: number }) =>
    api.post<ApiResponse<Cart>>("/cart/items/", data),

  updateCartItem: (itemId: string, data: { quantity: number }) =>
    api.patch<ApiResponse<Cart>>(`/cart/items/${itemId}/`, data),

  removeFromCart: (itemId: string) =>
    api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}/`),

  clearCart: () => api.delete<ApiResponse<Cart>>("/cart/"),

  applyCoupon: (code: string) =>
    api.post<ApiResponse<Cart>>("/cart/coupon/", { code }),

  removeCoupon: () => api.delete<ApiResponse<Cart>>("/cart/coupon/"),
};

// Wishlist
export const wishlist = {
  getWishlist: () =>
    api.get<ApiResponse<Wishlist>>("/wishlist/"),

  addToWishlist: (productId: string) =>
    api.post<ApiResponse<Wishlist>>("/wishlist/items/", {
      product_id: productId,
    }),

  removeFromWishlist: (productId: string) =>
    api.delete<ApiResponse<Wishlist>>(`/wishlist/items/${productId}/`),

  checkWishlist: (productId: string) =>
    api.get<ApiResponse<{ is_in_wishlist: boolean }>>(
      `/wishlist/check/${productId}/`
    ),
};

// Orders
export const orders = {
  createOrder: (data: {
    shipping_address_id: string;
    billing_address_id?: string;
    payment_method: string;
    notes?: string;
  }) => api.post<ApiResponse<Order>>("/orders/", data),

  getOrders: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Order>>("/orders/", { params }),

  getOrder: (orderNumber: string) =>
    api.get<ApiResponse<Order>>(`/orders/${orderNumber}/`),

  trackOrder: (orderNumber: string) =>
    api.get<ApiResponse<Order>>(`/orders/${orderNumber}/track/`),
};

// Payments
export const payments = {
  initializePayment: (orderId: string, gateway: string) =>
    api.post<ApiResponse<{ authorization_url: string; reference: string }>>(
      `/payments/initialize/`,
      { order_id: orderId, gateway }
    ),

  verifyPayment: (reference: string) =>
    api.get<ApiResponse<Payment>>(`/payments/verify/${reference}/`),
};

// Reviews
export const reviews = {
  getProductReviews: (productId: string) =>
    api.get<PaginatedResponse<Review>>(`/products/${productId}/reviews/`),

  createReview: (data: {
    product_id: string;
    rating: number;
    title?: string;
    comment: string;
  }) => api.post<ApiResponse<Review>>("/reviews/", data),

  deleteReview: (reviewId: string) =>
    api.delete(`/reviews/${reviewId}/`),
};

// Addresses
export const addresses = {
  getAddresses: () =>
    api.get<PaginatedResponse<Address>>("/addresses/"),

  createAddress: (data: Omit<Address, "id">) =>
    api.post<ApiResponse<Address>>("/addresses/", data),

  updateAddress: (id: string, data: Partial<Address>) =>
    api.patch<ApiResponse<Address>>(`/addresses/${id}/`, data),

  deleteAddress: (id: string) =>
    api.delete(`/addresses/${id}/`),

  setDefaultAddress: (id: string) =>
    api.post<ApiResponse<Address>>(`/addresses/${id}/set-default/`),
};

// Search
export const search = {
  search: (query: string, params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedResponse<Product>>("/search/", {
      params: { q: query, ...params },
    }),

  getSuggestions: (query: string) =>
    api.get<ApiResponse<string[]>>("/search/suggestions/", {
      params: { q: query },
    }),
};

// Admin
export const admin = {
  dashboard: () =>
    api.get<ApiResponse<DashboardStats>>("/admin/dashboard/"),

  products: {
    list: (params?: Record<string, string | number | boolean>) =>
      api.get<PaginatedResponse<Product>>("/admin/products/", { params }),
    get: (id: string) =>
      api.get<ApiResponse<Product>>(`/admin/products/${id}/`),
    create: (data: FormData) =>
      api.post<ApiResponse<Product>>("/admin/products/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    update: (id: string, data: FormData) =>
      api.patch<ApiResponse<Product>>(`/admin/products/${id}/`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    delete: (id: string) => api.delete(`/admin/products/${id}/`),
  },

  orders: {
    list: (params?: Record<string, string | number | boolean>) =>
      api.get<PaginatedResponse<Order>>("/admin/orders/", { params }),
    get: (id: string) =>
      api.get<ApiResponse<Order>>(`/admin/orders/${id}/`),
    updateStatus: (id: string, status: string) =>
      api.patch<ApiResponse<Order>>(`/admin/orders/${id}/`, { status }),
  },

  customers: {
    list: (params?: Record<string, string | number | boolean>) =>
      api.get<PaginatedResponse<User>>("/admin/customers/", { params }),
    get: (id: string) =>
      api.get<ApiResponse<User>>(`/admin/customers/${id}/`),
  },

  coupons: {
    list: (params?: Record<string, string | number | boolean>) =>
      api.get<PaginatedResponse<Coupon>>("/admin/coupons/", { params }),
    create: (data: Omit<Coupon, "id" | "usage_count">) =>
      api.post<ApiResponse<Coupon>>("/admin/coupons/", data),
    update: (id: string, data: Partial<Coupon>) =>
      api.patch<ApiResponse<Coupon>>(`/admin/coupons/${id}/`, data),
    delete: (id: string) => api.delete(`/admin/coupons/${id}/`),
  },

  reviews: {
    list: (params?: Record<string, string | number | boolean>) =>
      api.get<PaginatedResponse<Review>>("/admin/reviews/", { params }),
    delete: (id: string) => api.delete(`/admin/reviews/${id}/`),
  },

  settings: {
    get: () =>
      api.get<ApiResponse<Setting[]>>("/admin/settings/"),
    update: (data: Record<string, string>) =>
      api.patch<ApiResponse<Setting[]>>("/admin/settings/", data),
  },

  categories: {
    list: (params?: Record<string, string | number | boolean>) =>
      api.get<PaginatedResponse<Category>>("/admin/categories/", { params }),
    create: (data: Omit<Category, "id">) =>
      api.post<ApiResponse<Category>>("/admin/categories/", data),
    update: (id: string, data: Partial<Category>) =>
      api.patch<ApiResponse<Category>>(`/admin/categories/${id}/`, data),
    delete: (id: string) => api.delete(`/admin/categories/${id}/`),
  },

  notifications: {
    list: (params?: Record<string, string | number | boolean>) =>
      api.get<PaginatedResponse<Notification>>("/admin/notifications/", {
        params,
      }),
    markRead: (id: string) =>
      api.patch<ApiResponse<Notification>>(`/admin/notifications/${id}/`, {
        is_read: true,
      }),
    markAllRead: () =>
      api.post("/admin/notifications/mark-all-read/"),
  },
};

export default api;
