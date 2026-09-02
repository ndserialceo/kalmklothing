import type { Metadata } from "next";
import { Truck, Clock, MapPin, CheckCircle } from "lucide-react";
import { BUSINESS_NAME } from "@/lib/constants";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Shipping & Delivery",
  description: `Learn about ${BUSINESS_NAME}'s shipping and delivery options, rates, and timeframes.`,
};

const SHIPPING_ZONES = [
  { zone: "Lagos", fee: "₦1,500", time: "1-3 business days" },
  { zone: "Ogun", fee: "₦2,000", time: "2-4 business days" },
  { zone: "South West (Oyo, Ondo, Osun, Ekiti)", fee: "₦2,500", time: "3-5 business days" },
  { zone: "South South (Rivers, Delta, Akwa Ibom, etc.)", fee: "₦3,000", time: "3-5 business days" },
  { zone: "South East (Anambra, Enugu, Imo, etc.)", fee: "₦3,000", time: "3-5 business days" },
  { zone: "North Central (Abuja, Kwara, Kogi, etc.)", fee: "₦2,500", time: "3-5 business days" },
  { zone: "North West (Kano, Kaduna, Sokoto, etc.)", fee: "₦3,500", time: "4-7 business days" },
  { zone: "North East (Borno, Bauchi, Adamawa, etc.)", fee: "₦3,500", time: "4-7 business days" },
];

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-900">Shipping & Delivery</h1>
          <p className="text-brand-500 mt-1">Everything you need to know about getting your order delivered.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumb items={[{ label: "Shipping" }]} />

        {/* Key Points */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: Truck, title: "Nationwide Delivery", desc: "We deliver to all 36 states plus FCT." },
            { icon: Clock, title: "Fast Processing", desc: "Orders placed before 2PM are processed same day." },
            { icon: CheckCircle, title: "Free Shipping", desc: "Orders above ₦50,000 ship free (standard)." },
          ].map((item) => (
            <div key={item.title} className="bg-brand-50 rounded-lg p-5 text-center">
              <item.icon className="h-6 w-6 text-accent-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-brand-900 mb-1">{item.title}</h3>
              <p className="text-xs text-brand-500">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Shipping Zones */}
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-brand-900 mb-5">Shipping Rates & Timeframes</h2>
          <div className="border border-brand-100 rounded-lg overflow-hidden">
            <div className="grid grid-cols-3 bg-brand-50 px-5 py-3 text-xs font-medium text-brand-600 uppercase tracking-wider">
              <span>Zone</span>
              <span className="text-center">Fee</span>
              <span className="text-right">Delivery Time</span>
            </div>
            {SHIPPING_ZONES.map((zone, i) => (
              <div key={zone.zone}
                className={`grid grid-cols-3 px-5 py-3.5 text-sm ${i % 2 === 0 ? "bg-white" : "bg-brand-50"}`}>
                <span className="text-brand-900 font-medium">{zone.zone}</span>
                <span className="text-center text-brand-700">{zone.fee}</span>
                <span className="text-right text-brand-500">{zone.time}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-brand-400 mt-3">
            * Delivery times are estimates and may vary. Express delivery available at 2x standard rates.
          </p>
        </section>

        {/* How it works */}
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-brand-900 mb-5">How It Works</h2>
          <div className="space-y-4">
            {[
              { step: "1", title: "Place Your Order", desc: "Browse our shop, add items to your cart, and complete checkout with your preferred payment method." },
              { step: "2", title: "Order Processing", desc: "We carefully pick, quality-check, and package your items within 24 hours." },
              { step: "3", title: "Shipping & Tracking", desc: "Your order is dispatched and you receive a tracking number via email and WhatsApp." },
              { step: "4", title: "Delivery", desc: "Your package arrives at your doorstep. Signature may be required for security." },
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

        {/* Notes */}
        <section className="mt-12 bg-brand-50 rounded-lg p-6">
          <h3 className="font-heading text-lg font-semibold text-brand-900 mb-3">Important Notes</h3>
          <ul className="space-y-2 text-sm text-brand-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              Free standard shipping on orders above ₦50,000
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              Same-day dispatch for orders placed before 2:00 PM (Lagos time)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              Pickup available from our Lagos office at no extra cost
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              Delivery times may be affected by public holidays and festivals
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
