import type { Metadata } from "next";
import { BUSINESS_NAME } from "@/lib/constants";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `${BUSINESS_NAME} terms and conditions - the rules governing your use of our website and services.`,
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-900">Terms & Conditions</h1>
          <p className="text-brand-500 mt-1">Last updated: January 2024</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumb items={[{ label: "Terms & Conditions" }]} />

        <div className="mt-8 prose prose-sm max-w-none text-brand-600">
          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using the {BUSINESS_NAME} website and services, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">2. Account Registration</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must be at least 18 years old to create an account</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You must provide accurate and complete information</li>
              <li>One account per person; duplicate accounts may be suspended</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">3. Products & Orders</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Product images are for illustration purposes; actual items may vary slightly</li>
              <li>We reserve the right to limit order quantities</li>
              <li>Prices are in Nigerian Naira (₦) and subject to change without notice</li>
              <li>We reserve the right to cancel orders for errors in pricing or stock availability</li>
              <li>Order confirmation does not guarantee product availability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">4. Payment</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Payments are processed securely via Paystack and Flutterwave</li>
              <li>We do not store your payment card details</li>
              <li>All prices include applicable taxes unless stated otherwise</li>
              <li>Payment must be received in full before order processing</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">5. Shipping & Delivery</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Delivery timeframes are estimates and not guaranteed</li>
              <li>Risk of loss transfers to you upon delivery</li>
              <li>You are responsible for providing accurate delivery information</li>
              <li>Additional charges may apply for remote areas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">6. Returns & Refunds</h2>
            <p className="leading-relaxed">
              Returns are accepted within 14 days of delivery for eligible items. Please refer to our{" "}
              <a href="/returns" className="text-accent-600 hover:underline">Returns & Refunds policy</a>{" "}
              for complete details.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">7. Intellectual Property</h2>
            <p className="leading-relaxed">
              All content on this website, including text, graphics, logos, images, and software, is the property of {BUSINESS_NAME} and is protected by Nigerian and international copyright laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">8. Limitation of Liability</h2>
            <p className="leading-relaxed">
              {BUSINESS_NAME} shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services or purchase of products.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">9. Governing Law</h2>
            <p className="leading-relaxed">
              These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Lagos State, Nigeria.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">10. Contact</h2>
            <p className="leading-relaxed">
              For questions about these Terms, contact us at{" "}
              <a href="mailto:hello@kalmklothing.com" className="text-accent-600 hover:underline">hello@kalmklothing.com</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
