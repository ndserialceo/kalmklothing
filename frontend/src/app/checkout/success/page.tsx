"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, CreditCard, Truck, ShoppingBag, MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER, BUSINESS_NAME } from "@/lib/constants";
import Button from "@/components/Button";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") || "N/A";

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-900 mb-3">
          Order Confirmed!
        </h1>
        <p className="text-brand-500 text-lg mb-2">
          Thank you for shopping with {BUSINESS_NAME}.
        </p>
        <p className="text-sm text-brand-400 mb-8">
          Order Number: <span className="font-mono font-medium text-brand-700">{orderNumber}</span>
        </p>

        <div className="bg-brand-50 rounded-xl p-8 mb-10">
          <h2 className="font-heading text-xl font-semibold text-brand-900 mb-6">What&apos;s Next</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[
              { icon: CreditCard, label: "Payment", desc: "Complete payment via gateway", step: 1 },
              { icon: Package, label: "Processing", desc: "We prepare your order", step: 2 },
              { icon: Truck, label: "Shipping", desc: "Your order is on its way", step: 3 },
              { icon: ShoppingBag, label: "Delivery", desc: "Package arrives at your door", step: 4 },
            ].map((item, i) => (
              <div key={item.label} className="relative">
                {i < 3 && (
                  <div className="hidden sm:block absolute top-5 left-full w-full h-0.5 bg-brand-200" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-brand-900 text-white flex items-center justify-center mb-3">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <p className="text-sm font-medium text-brand-900">{item.label}</p>
                  <p className="text-xs text-brand-400 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/shop">
            <Button size="lg">Continue Shopping</Button>
          </Link>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I have a question about my order #${orderNumber}`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="secondary" size="lg">
              <MessageCircle className="h-4 w-4 mr-1.5" />
              Chat on WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-pulse text-brand-400">Loading...</div></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
