import type { Metadata } from "next";
import { BUSINESS_NAME } from "@/lib/constants";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `${BUSINESS_NAME} privacy policy - how we collect, use, and protect your personal information.`,
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-900">Privacy Policy</h1>
          <p className="text-brand-500 mt-1">Last updated: January 2024</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumb items={[{ label: "Privacy Policy" }]} />

        <div className="mt-8 prose prose-sm max-w-none text-brand-600">
          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">1. Introduction</h2>
            <p className="leading-relaxed">
              {BUSINESS_NAME} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and purchase our products.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">2. Information We Collect</h2>
            <h3 className="font-heading text-lg font-semibold text-brand-900 mb-2">Personal Information</h3>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Name and contact details (email, phone number)</li>
              <li>Delivery and billing addresses</li>
              <li>Payment information (processed securely via Paystack/Flutterwave)</li>
              <li>Account credentials (email and password)</li>
            </ul>
            <h3 className="font-heading text-lg font-semibold text-brand-900 mb-2">Automatically Collected Information</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>IP address and browser type</li>
              <li>Device information</li>
              <li>Pages visited and time spent on our site</li>
              <li>Referring website or source</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To process and fulfill your orders</li>
              <li>To communicate with you about your orders and account</li>
              <li>To send promotional materials (with your consent)</li>
              <li>To improve our website and services</li>
              <li>To detect and prevent fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">4. Information Sharing</h2>
            <p className="leading-relaxed">
              We do not sell your personal information. We may share your data with:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Payment processors (Paystack, Flutterwave) for transaction processing</li>
              <li>Delivery partners for order fulfillment</li>
              <li>Analytics providers to improve our services</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">5. Data Security</h2>
            <p className="leading-relaxed">
              We implement industry-standard security measures including SSL encryption, secure payment processing, and regular security audits. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">6. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing communications</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">7. Cookies</h2>
            <p className="leading-relaxed">
              We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookies through your browser settings.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">8. Changes to This Policy</h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-bold text-brand-900 mb-3">9. Contact Us</h2>
            <p className="leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:hello@kalmklothing.com" className="text-accent-600 hover:underline">hello@kalmklothing.com</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
