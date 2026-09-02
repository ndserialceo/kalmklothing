"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, ArrowLeft, Tag, Truck } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { cn, formatPrice, getImageUrl } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import Button from "@/components/Button";
import QuantitySelector from "@/components/QuantitySelector";
import EmptyState from "@/components/EmptyState";
import Breadcrumb from "@/components/Breadcrumb";

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, total, coupon, isLoading, fetchCart, updateQuantity, removeItem, applyCoupon, removeCoupon, calculateTotals } =
    useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      await applyCoupon(couponCode.trim());
      setCouponCode("");
    } catch {
      // error handled by store
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
  };

  const shippingEstimate = subtotal >= 50000 ? 0 : 1500;
  const discount = coupon
    ? coupon.discount_type === "percentage"
      ? subtotal * (parseFloat(coupon.discount_value) / 100)
      : parseFloat(coupon.discount_value)
    : 0;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb items={[{ label: "Cart" }]} />
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Looks like you haven't added anything to your cart yet. Explore our collections to find something you'll love."
            actionLabel="Start Shopping"
            onAction={() => router.push("/shop")}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-900">
            Shopping Cart
          </h1>
          <p className="text-brand-500 mt-1">{items.length} item{items.length !== 1 ? "s" : ""} in your cart</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: "Cart" }]} />

        <div className="mt-6 lg:grid lg:grid-cols-12 lg:gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <div className="grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 pb-3 border-b border-brand-200 text-xs font-medium text-brand-400 uppercase tracking-wider">
                <span>Product</span>
                <span className="text-center">Price</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Total</span>
                <span className="w-8" />
              </div>

              <div className="divide-y divide-brand-100">
                {items.map((item) => {
                  const firstImage = item.product.images?.[0];
                  const variant = item.variant;
                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 py-6 items-center"
                    >
                      <div className="flex items-center gap-4">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="relative w-20 h-24 bg-brand-50 rounded overflow-hidden flex-shrink-0"
                        >
                          {firstImage && (
                            <Image
                              src={getImageUrl(firstImage.image)}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          )}
                        </Link>
                        <div className="min-w-0">
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="text-sm font-medium text-brand-900 hover:text-accent-700 transition-colors line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          {variant && (
                            <p className="text-xs text-brand-400 mt-0.5">
                              {Object.entries(variant.options)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join(" / ")}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-brand-700 text-center">
                        {formatPrice(parseFloat(item.price))}
                      </p>

                      <div className="flex justify-center">
                        <QuantitySelector
                          value={item.quantity}
                          onChange={(qty) => updateQuantity(item.id, qty)}
                          size="sm"
                        />
                      </div>

                      <p className="text-sm font-medium text-brand-900 text-right">
                        {formatPrice(parseFloat(item.price) * item.quantity)}
                      </p>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-brand-400 hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {items.map((item) => {
                const firstImage = item.product.images?.[0];
                const variant = item.variant;
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-brand-100 rounded-lg p-4"
                  >
                    <div className="flex gap-4">
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="relative w-20 h-24 bg-brand-50 rounded overflow-hidden flex-shrink-0"
                      >
                        {firstImage && (
                          <Image
                            src={getImageUrl(firstImage.image)}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <Link
                            href={`/products/${item.product.slug}`}
                            className="text-sm font-medium text-brand-900 line-clamp-1"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 -mr-1 text-brand-400 hover:text-red-500"
                            aria-label="Remove"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        {variant && (
                          <p className="text-xs text-brand-400 mt-0.5">
                            {Object.entries(variant.options)
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" / ")}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-brand-900 mt-2">
                          {formatPrice(parseFloat(item.price))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-brand-100">
                      <QuantitySelector
                        value={item.quantity}
                        onChange={(qty) => updateQuantity(item.id, qty)}
                        size="sm"
                      />
                      <p className="text-sm font-semibold text-brand-900">
                        {formatPrice(parseFloat(item.price) * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-brand-50 rounded-lg p-6 sticky top-24">
              <h2 className="font-heading text-lg font-semibold text-brand-900 mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-500">Subtotal</span>
                  <span className="font-medium text-brand-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-500 flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5" />
                    Shipping
                  </span>
                  <span className="font-medium text-brand-900">
                    {shippingEstimate === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `Est. ${formatPrice(shippingEstimate)}`
                    )}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      Discount
                    </span>
                    <span className="font-medium">-{formatPrice(discount)}</span>
                  </div>
                )}
                {subtotal < 50000 && (
                  <p className="text-xs text-brand-400 bg-brand-100 rounded px-3 py-2">
                    Add {formatPrice(50000 - subtotal)} more for free shipping
                  </p>
                )}
              </div>

              {/* Coupon */}
              <div className="mt-5 pt-5 border-t border-brand-200">
                {coupon ? (
                  <div className="flex items-center justify-between bg-green-50 rounded px-3 py-2">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <Tag className="h-3.5 w-3.5" />
                      <span className="font-medium">{coupon.code}</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon code"
                      className="flex-1 px-3 py-2 text-sm border border-brand-200 rounded focus:outline-none focus:ring-1 focus:ring-accent-500 bg-white"
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleApplyCoupon}
                      loading={couponLoading}
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-5 border-t border-brand-200">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-semibold text-brand-900">Total</span>
                  <span className="text-xl font-bold text-brand-900">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <Button
                fullWidth
                size="lg"
                className="mt-5"
                onClick={() => router.push("/checkout")}
              >
                Proceed to Checkout
              </Button>

              <div className="mt-4 text-center">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I have a question about my cart.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-400 hover:text-brand-600 transition-colors"
                >
                  Need help? Chat with us on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
