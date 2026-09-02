"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { cn, formatPrice, getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import EmptyState from "./EmptyState";

export default function MiniCart() {
  const { isCartOpen, setCartOpen } = useUIStore();
  const { items, subtotal, total, itemCount, updateQuantity, removeItem } =
    useCartStore();
  const overlayRef = useUIStore((s) => s.setCartOpen);

  const shippingEstimate = subtotal >= 50000 ? 0 : 2500;

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        ref={() => {}}
        className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm animate-fade-in"
        onClick={() => setCartOpen(false)}
      />

      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-right">
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-700" />
            <h2 className="font-heading text-lg font-semibold text-brand-900">
              Your Cart
            </h2>
            {itemCount > 0 && (
              <span className="text-xs font-medium text-brand-400">
                ({itemCount} {itemCount === 1 ? "item" : "items"})
              </span>
            )}
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-1.5 rounded-full hover:bg-brand-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5 text-brand-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Looks like you haven't added anything to your cart yet."
              actionLabel="Continue Shopping"
              onAction={() => setCartOpen(false)}
            />
          ) : (
            <div className="divide-y divide-brand-100">
              {items.map((item) => {
                const itemPrice = parseFloat(item.price);
                return (
                  <div key={item.id} className="flex gap-4 p-5">
                    <div className="relative w-20 h-24 rounded overflow-hidden bg-brand-100 flex-shrink-0">
                      {item.product.images?.[0] && (
                        <Image
                          src={getImageUrl(item.product.images[0].image)}
                          alt={item.product.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${item.product.slug}`}
                          onClick={() => setCartOpen(false)}
                          className="text-sm font-medium text-brand-900 hover:text-accent-700 transition-colors line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-0.5 rounded hover:bg-brand-100 transition-colors flex-shrink-0"
                          aria-label="Remove item"
                        >
                          <X className="h-3.5 w-3.5 text-brand-400" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-brand-400">
                        {item.variant?.options?.size && (
                          <span>Size: {item.variant.options.size}</span>
                        )}
                        {item.variant?.options?.color && (
                          <span>Color: {item.variant.options.color}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-brand-200 rounded">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="h-7 w-7 flex items-center justify-center hover:bg-brand-50 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="h-7 w-8 flex items-center justify-center text-xs font-medium border-x border-brand-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="h-7 w-7 flex items-center justify-center hover:bg-brand-50 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-brand-900">
                          {formatPrice(itemPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-brand-100 p-5 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-brand-500">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-500">
                <span>Shipping</span>
                <span>
                  {shippingEstimate === 0
                    ? "Free"
                    : formatPrice(shippingEstimate)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-brand-900 pt-2 border-t border-brand-100">
                <span>Total</span>
                <span>{formatPrice(total + shippingEstimate)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href="/cart"
                onClick={() => setCartOpen(false)}
                className="flex items-center justify-center h-11 w-full border border-brand-200 rounded text-sm font-medium text-brand-900 hover:bg-brand-50 transition-colors"
              >
                View Cart
              </Link>
              <Link
                href="/checkout"
                onClick={() => setCartOpen(false)}
                className="flex items-center justify-center h-11 w-full bg-accent-600 text-white rounded text-sm font-medium hover:bg-accent-700 transition-colors gap-2"
              >
                Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
