import type { Metadata } from "next";
import { RotateCcw, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { BUSINESS_NAME } from "@/lib/constants";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Returns & Refunds",
  description: `Learn about ${BUSINESS_NAME}'s return and refund policy.`,
};

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-900">Returns & Refunds</h1>
          <p className="text-brand-500 mt-1">Our hassle-free return and refund policy.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumb items={[{ label: "Returns" }]} />

        {/* Key Points */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Clock, title: "14-Day Window", desc: "Return items within 14 days of delivery." },
            { icon: RotateCcw, title: "Easy Process", desc: "Contact us and we'll guide you through it." },
            { icon: CheckCircle, title: "Quick Refunds", desc: "Refunds processed within 5-7 business days." },
          ].map((item) => (
            <div key={item.title} className="bg-brand-50 rounded-lg p-5 text-center">
              <item.icon className="h-6 w-6 text-accent-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-brand-900 mb-1">{item.title}</h3>
              <p className="text-xs text-brand-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Return Policy */}
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-brand-900 mb-5">Return Policy</h2>
          <div className="prose prose-sm max-w-none text-brand-600 space-y-4">
            <p>At {BUSINESS_NAME}, we want you to be completely satisfied with your purchase. If for any reason you are not happy with your order, we accept returns within 14 days of delivery.</p>
            <h3 className="font-heading text-lg font-semibold text-brand-900 mt-6">Eligible Returns</h3>
            <ul className="space-y-2">
              <li>Items must be unworn, unwashed, and unused</li>
              <li>Original tags must be attached</li>
              <li>Items must be in original packaging</li>
              <li>Proof of purchase (order number) required</li>
            </ul>
            <h3 className="font-heading text-lg font-semibold text-brand-900 mt-6">Non-Returnable Items</h3>
            <ul className="space-y-2">
              <li>Items that have been worn, washed, or altered</li>
              <li>Items without original tags</li>
              <li>Sale or clearance items</li>
              <li>Custom or personalized orders</li>
              <li>Undergarments and swimwear (for hygiene reasons)</li>
            </ul>
          </div>
        </section>

        {/* How to Return */}
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-brand-900 mb-5">How to Return an Item</h2>
          <div className="space-y-4">
            {[
              { step: "1", title: "Contact Us", desc: "Reach out via WhatsApp or email with your order number and reason for return." },
              { step: "2", title: "Get Authorization", desc: "We'll review your request and provide a Return Authorization Number (RAN) and return instructions." },
              { step: "3", title: "Package Your Item", desc: "Pack the item securely in its original packaging with all tags attached. Include your RAN." },
              { step: "4", title: "Ship It Back", desc: "Drop off at the nearest courier location or schedule a pickup (Lagos only)." },
              { step: "5", title: "Receive Refund", desc: "Once we receive and inspect your return, your refund will be processed within 5-7 business days." },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-brand-900 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-brand-900">{item.title}</h3>
                  <p className="text-sm text-brand-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Refund Process */}
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-brand-900 mb-5">Refund Process</h2>
          <div className="bg-brand-50 rounded-lg p-6 space-y-4 text-sm text-brand-600">
            <p>Refunds are processed to the original payment method used at checkout.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <p className="font-medium text-brand-900">Debit Card / Bank Transfer</p>
                <p className="text-xs text-brand-500 mt-1">Refund within 5-7 business days</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="font-medium text-brand-900">Store Credit</p>
                <p className="text-xs text-brand-500 mt-1">Issued within 24 hours of approval</p>
              </div>
            </div>
          </div>
        </section>

        {/* Exchanges */}
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-brand-900 mb-5">Exchanges</h2>
          <p className="text-sm text-brand-600 leading-relaxed">
            We offer exchanges for different sizes or colors of the same item, subject to availability.
            Contact us to arrange an exchange. If the new item costs more, you&apos;ll be asked to pay the difference.
            If it costs less, we&apos;ll refund the difference.
          </p>
        </section>

        {/* Contact */}
        <section className="mt-12 bg-brand-50 rounded-lg p-6 text-center">
          <AlertTriangle className="h-6 w-6 text-accent-600 mx-auto mb-3" />
          <h3 className="font-heading text-lg font-semibold text-brand-900 mb-2">Need to Make a Return?</h3>
          <p className="text-sm text-brand-500 mb-4">Contact our support team to get started.</p>
          <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-10 px-6 bg-brand-900 text-white text-sm font-medium rounded-lg hover:bg-brand-800 transition-colors">
            Contact Support
          </a>
        </section>
      </div>
    </main>
  );
}
