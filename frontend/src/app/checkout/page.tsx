"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Lock, CreditCard, Building2, Smartphone, MapPin, Truck, ChevronDown, Check } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { orders as ordersApi, payments as paymentsApi, addresses as addressesApi } from "@/lib/api";
import { cn, formatPrice, getImageUrl } from "@/lib/utils";
import { NIGERIAN_STATES, WHATSAPP_NUMBER } from "@/lib/constants";
import Button from "@/components/Button";
import Breadcrumb from "@/components/Breadcrumb";
import type { Address } from "@/lib/types";

const DELIVERY_FEES: Record<string, number> = {
  Lagos: 1500,
  Ogun: 2000,
  Abuja: 2500,
  Oyo: 2500,
  Rivers: 3000,
  default: 3500,
};

function getDeliveryFee(state: string): number {
  return DELIVERY_FEES[state] || DELIVERY_FEES.default;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, total, coupon, fetchCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    whatsapp: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "Lagos",
    country: "Nigeria",
    delivery_method: "standard",
    payment_method: "paystack",
    notes: "",
    use_saved_address: "",
    agree_terms: false,
  });

  const { data: addressesData } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => addressesApi.getAddresses(),
    enabled: isAuthenticated,
  });

  const savedAddresses = addressesData?.data?.results || [];

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        first_name: user.first_name || prev.first_name,
        last_name: user.last_name || prev.last_name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (form.use_saved_address) {
      const addr = savedAddresses.find((a: Address) => a.id === form.use_saved_address);
      if (addr) {
        setForm((prev) => ({
          ...prev,
          first_name: addr.first_name,
          last_name: addr.last_name,
          phone: addr.phone,
          address_line_1: addr.address_line_1,
          address_line_2: addr.address_line_2 || "",
          city: addr.city,
          state: addr.state,
          country: addr.country,
        }));
      }
    }
  }, [form.use_saved_address, savedAddresses]);

  const deliveryFee =
    form.delivery_method === "pickup"
      ? 0
      : form.delivery_method === "express"
      ? getDeliveryFee(form.state) * 2
      : getDeliveryFee(form.state);

  const orderTotal = total + deliveryFee;
  const discountAmount = coupon
    ? coupon.discount_type === "percentage"
      ? subtotal * (parseFloat(coupon.discount_value) / 100)
      : parseFloat(coupon.discount_value)
    : 0;

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.agree_terms || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const orderData = {
        shipping_address_id: form.use_saved_address || "new",
        payment_method: form.payment_method,
        notes: form.notes || undefined,
        shipping_address: {
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          address_line_1: form.address_line_1,
          address_line_2: form.address_line_2,
          city: form.city,
          state: form.state,
          country: form.country,
        },
      };

      const { data: orderResponse } = await ordersApi.createOrder(orderData as any);
      const order = orderResponse.data;

      const { data: paymentResponse } = await paymentsApi.initializePayment(
        order.id,
        form.payment_method
      );

      if (paymentResponse.data.authorization_url) {
        window.location.href = paymentResponse.data.authorization_url;
      } else {
        router.push(`/checkout/success?order=${order.order_number}`);
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-brand-500 mb-4">Your cart is empty.</p>
          <Link href="/shop" className="text-accent-600 hover:text-accent-700 font-medium text-sm">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-900">Checkout</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />

        <form onSubmit={handleSubmit} className="mt-6 lg:grid lg:grid-cols-12 lg:gap-10">
          {/* Left Column - Form */}
          <div className="lg:col-span-7 space-y-8">
            {/* Contact */}
            <section className="bg-white border border-brand-100 rounded-lg p-6">
              <h2 className="font-heading text-lg font-semibold text-brand-900 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-900 text-white text-xs flex items-center justify-center font-medium">1</span>
                Contact Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-brand-600 mb-1.5">First Name *</label>
                  <input type="text" required value={form.first_name} onChange={(e) => updateField("first_name", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-600 mb-1.5">Last Name *</label>
                  <input type="text" required value={form.last_name} onChange={(e) => updateField("last_name", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-600 mb-1.5">Email *</label>
                  <input type="email" required value={form.email} onChange={(e) => updateField("email", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-600 mb-1.5">Phone *</label>
                  <input type="tel" required value={form.phone} onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+234..." className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-brand-600 mb-1.5">WhatsApp (Optional)</label>
                  <input type="tel" value={form.whatsapp} onChange={(e) => updateField("whatsapp", e.target.value)}
                    placeholder="+234..." className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
                </div>
              </div>
            </section>

            {/* Delivery Address */}
            <section className="bg-white border border-brand-100 rounded-lg p-6">
              <h2 className="font-heading text-lg font-semibold text-brand-900 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-900 text-white text-xs flex items-center justify-center font-medium">2</span>
                Delivery Address
              </h2>

              {savedAddresses.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-brand-600 mb-1.5">Use Saved Address</label>
                  <div className="relative">
                    <select value={form.use_saved_address} onChange={(e) => updateField("use_saved_address", e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 bg-white pr-8">
                      <option value="">Enter new address</option>
                      {savedAddresses.map((addr: Address) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.label}: {addr.address_line_1}, {addr.city}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-brand-600 mb-1.5">Address Line 1 *</label>
                  <input type="text" required value={form.address_line_1} onChange={(e) => updateField("address_line_1", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-brand-600 mb-1.5">Address Line 2</label>
                  <input type="text" value={form.address_line_2} onChange={(e) => updateField("address_line_2", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-600 mb-1.5">City *</label>
                  <input type="text" required value={form.city} onChange={(e) => updateField("city", e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-600 mb-1.5">State *</label>
                  <div className="relative">
                    <select required value={form.state} onChange={(e) => updateField("state", e.target.value)}
                      className="w-full appearance-none px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 bg-white pr-8">
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400 pointer-events-none" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-brand-600 mb-1.5">Country</label>
                  <input type="text" value={form.country} readOnly
                    className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg bg-brand-50 text-brand-500" />
                </div>
              </div>
            </section>

            {/* Delivery Method */}
            <section className="bg-white border border-brand-100 rounded-lg p-6">
              <h2 className="font-heading text-lg font-semibold text-brand-900 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-900 text-white text-xs flex items-center justify-center font-medium">3</span>
                Delivery Method
              </h2>
              <div className="space-y-3">
                {[
                  { value: "standard", label: "Standard Delivery", desc: `3-7 business days - ${formatPrice(getDeliveryFee(form.state))}`, icon: Truck },
                  { value: "express", label: "Express Delivery", desc: `1-3 business days - ${formatPrice(getDeliveryFee(form.state) * 2)}`, icon: Truck },
                  { value: "pickup", label: "Pickup", desc: "Free - Lagos office", icon: MapPin },
                ].map((method) => (
                  <label key={method.value}
                    className={cn("flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                      form.delivery_method === method.value
                        ? "border-brand-900 bg-brand-50"
                        : "border-brand-200 hover:border-brand-300")}>
                    <input type="radio" name="delivery" value={method.value} checked={form.delivery_method === method.value}
                      onChange={(e) => updateField("delivery_method", e.target.value)} className="sr-only" />
                    <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      form.delivery_method === method.value ? "border-brand-900" : "border-brand-300")}>
                      {form.delivery_method === method.value && <div className="w-2.5 h-2.5 rounded-full bg-brand-900" />}
                    </div>
                    <method.icon className="h-5 w-5 text-brand-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-brand-900">{method.label}</p>
                      <p className="text-xs text-brand-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* Payment Method */}
            <section className="bg-white border border-brand-100 rounded-lg p-6">
              <h2 className="font-heading text-lg font-semibold text-brand-900 mb-5 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-900 text-white text-xs flex items-center justify-center font-medium">4</span>
                Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  { value: "paystack", label: "Paystack", desc: "Debit card, Bank transfer, USSD", icon: CreditCard },
                  { value: "flutterwave", label: "Flutterwave", desc: "Card, Bank, Mobile Money", icon: Smartphone },
                ].map((method) => (
                  <label key={method.value}
                    className={cn("flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                      form.payment_method === method.value
                        ? "border-brand-900 bg-brand-50"
                        : "border-brand-200 hover:border-brand-300")}>
                    <input type="radio" name="payment" value={method.value} checked={form.payment_method === method.value}
                      onChange={(e) => updateField("payment_method", e.target.value)} className="sr-only" />
                    <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                      form.payment_method === method.value ? "border-brand-900" : "border-brand-300")}>
                      {form.payment_method === method.value && <div className="w-2.5 h-2.5 rounded-full bg-brand-900" />}
                    </div>
                    <method.icon className="h-5 w-5 text-brand-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-brand-900">{method.label}</p>
                      <p className="text-xs text-brand-500">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-brand-400">
                <Lock className="h-3.5 w-3.5" />
                Your payment information is secure and encrypted
              </div>
            </section>

            {/* Order Notes */}
            <section className="bg-white border border-brand-100 rounded-lg p-6">
              <h3 className="text-sm font-medium text-brand-900 mb-3">Order Notes (Optional)</h3>
              <textarea rows={3} value={form.notes} onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Special instructions for your order..."
                className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 resize-none" />
            </section>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-brand-50 rounded-lg p-6 sticky top-24">
              <h2 className="font-heading text-lg font-semibold text-brand-900 mb-5">Order Summary</h2>

              <div className="max-h-64 overflow-y-auto space-y-4 mb-5">
                {items.map((item) => {
                  const firstImage = item.product.images?.[0];
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-14 h-16 bg-white rounded overflow-hidden flex-shrink-0">
                        {firstImage && (
                          <Image src={getImageUrl(firstImage.image)} alt={item.product.name} fill className="object-cover" />
                        )}
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-brand-900 line-clamp-1">{item.product.name}</p>
                        {item.variant && (
                          <p className="text-[11px] text-brand-400">
                            {Object.values(item.variant.options).join(" / ")}
                          </p>
                        )}
                      </div>
                      <p className="text-xs font-medium text-brand-900">
                        {formatPrice(parseFloat(item.price) * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 text-sm border-t border-brand-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-brand-500">Subtotal</span>
                  <span className="font-medium text-brand-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-500">Shipping</span>
                  <span className="font-medium text-brand-900">
                    {deliveryFee === 0 ? <span className="text-green-600">Free</span> : formatPrice(deliveryFee)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-brand-200">
                  <span className="font-semibold text-brand-900">Total</span>
                  <span className="text-lg font-bold text-brand-900">{formatPrice(orderTotal)}</span>
                </div>
              </div>

              <label className="flex items-start gap-3 mt-5 cursor-pointer">
                <input type="checkbox" checked={form.agree_terms} onChange={(e) => updateField("agree_terms", e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-brand-300 text-accent-600 focus:ring-accent-500" />
                <span className="text-xs text-brand-500">
                  I agree to the{" "}
                  <Link href="/terms" className="text-accent-600 hover:underline">Terms & Conditions</Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-accent-600 hover:underline">Privacy Policy</Link>
                </span>
              </label>

              <Button type="submit" fullWidth size="lg" className="mt-5" loading={isSubmitting} disabled={!form.agree_terms}>
                <Lock className="h-4 w-4 mr-1.5" />
                Place Order
              </Button>

              <div className="mt-4 text-center">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I need help with checkout.")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs text-brand-400 hover:text-brand-600 transition-colors"
                >
                  Need help? Chat with us on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
