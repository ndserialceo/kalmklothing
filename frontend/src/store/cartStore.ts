import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cart as cartApi } from "@/lib/api";
import { useAuthStore } from "./authStore";
import type { CartItem, Coupon } from "@/lib/types";

interface CartState {
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
  coupon: Coupon | null;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number, variantId?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  calculateTotals: () => void;
  setGuestCart: (items: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      total: 0,
      itemCount: 0,
      coupon: null,
      isLoading: false,

      fetchCart: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        if (!isAuthenticated) {
          get().calculateTotals();
          return;
        }

        set({ isLoading: true });
        try {
          const { data } = await cartApi.getCart();
          const cart = data.data;
          set({
            items: cart.items,
            coupon: cart.coupon || null,
            isLoading: false,
          });
          get().calculateTotals();
        } catch {
          set({ isLoading: false });
        }
      },

      addToCart: async (productId, quantity, variantId) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        if (!isAuthenticated) {
          const existing = get().items.find(
            (item) =>
              item.product_id === productId && item.variant_id === variantId
          );
          if (existing) {
            set({
              items: get().items.map((item) =>
                item.id === existing.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            });
          }
          get().calculateTotals();
          return;
        }

        set({ isLoading: true });
        try {
          const { data } = await cartApi.addToCart({
            product_id: productId,
            quantity,
            variant_id: variantId,
          });
          set({ items: data.data.items, isLoading: false });
          get().calculateTotals();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateQuantity: async (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId);
          return;
        }

        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        if (!isAuthenticated) {
          set({
            items: get().items.map((item) =>
              item.id === itemId ? { ...item, quantity } : item
            ),
          });
          get().calculateTotals();
          return;
        }

        set({ isLoading: true });
        try {
          const { data } = await cartApi.updateCartItem(itemId, { quantity });
          set({ items: data.data.items, isLoading: false });
          get().calculateTotals();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      removeItem: async (itemId) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        if (!isAuthenticated) {
          set({ items: get().items.filter((item) => item.id !== itemId) });
          get().calculateTotals();
          return;
        }

        set({ isLoading: true });
        try {
          const { data } = await cartApi.removeFromCart(itemId);
          set({ items: data.data.items, isLoading: false });
          get().calculateTotals();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      clearCart: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;

        if (!isAuthenticated) {
          set({ items: [], coupon: null });
          get().calculateTotals();
          return;
        }

        set({ isLoading: true });
        try {
          await cartApi.clearCart();
          set({ items: [], coupon: null, isLoading: false });
          get().calculateTotals();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      applyCoupon: async (code) => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        if (!isAuthenticated) return;

        set({ isLoading: true });
        try {
          const { data } = await cartApi.applyCoupon(code);
          set({
            coupon: data.data.coupon || null,
            isLoading: false,
          });
          get().calculateTotals();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      removeCoupon: async () => {
        const isAuthenticated = useAuthStore.getState().isAuthenticated;
        if (!isAuthenticated) {
          set({ coupon: null });
          get().calculateTotals();
          return;
        }

        set({ isLoading: true });
        try {
          await cartApi.removeCoupon();
          set({ coupon: null, isLoading: false });
          get().calculateTotals();
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      calculateTotals: () => {
        const { items, coupon } = get();
        const subtotal = items.reduce(
          (sum, item) => sum + parseFloat(item.price) * item.quantity,
          0
        );
        let discount = 0;
        if (coupon) {
          if (coupon.discount_type === "percentage") {
            discount = subtotal * (parseFloat(coupon.discount_value) / 100);
          } else {
            discount = parseFloat(coupon.discount_value);
          }
        }
        const total = Math.max(0, subtotal - discount);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        set({ subtotal, total, itemCount });
      },

      setGuestCart: (items) => {
        set({ items });
        get().calculateTotals();
      },
    }),
    {
      name: "kalmklothing-cart",
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
        subtotal: state.subtotal,
        total: state.total,
        itemCount: state.itemCount,
      }),
    }
  )
);
