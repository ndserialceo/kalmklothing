"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Breadcrumb from "@/components/Breadcrumb";

const FAQ_CATEGORIES = [
  {
    category: "Orders & Payment",
    questions: [
      { q: "How do I place an order?", a: "Browse our shop, add items to your cart, and proceed to checkout. You can pay via Paystack (debit card, bank transfer, USSD) or Flutterwave." },
      { q: "Can I modify my order after placing it?", a: "Orders can be modified within 2 hours of placement. Contact us via WhatsApp or email with your order number to make changes." },
      { q: "What payment methods do you accept?", a: "We accept debit cards, bank transfers, and USSD payments through Paystack and Flutterwave. All transactions are secure and encrypted." },
      { q: "Is my payment information secure?", a: "Yes. We use Paystack and Flutterwave, both PCI DSS compliant payment processors. We never store your card details." },
      { q: "How do I apply a coupon code?", a: "Enter your coupon code in the cart page or at checkout and click 'Apply'. The discount will be reflected in your total." },
    ],
  },
  {
    category: "Shipping & Delivery",
    questions: [
      { q: "How long does delivery take?", a: "Standard delivery takes 3-7 business days depending on your location. Express delivery takes 1-3 business days. Lagos deliveries are typically faster." },
      { q: "How much is shipping?", a: "Shipping starts from ₦1,500 within Lagos. Other states range from ₦2,000 to ₦3,500. Orders above ₦50,000 qualify for free standard shipping." },
      { q: "Do you deliver nationwide?", a: "Yes! We deliver to all 36 states in Nigeria plus the FCT. Delivery times may vary based on location." },
      { q: "Can I track my order?", a: "Yes. Once your order is shipped, you'll receive a tracking number via email and WhatsApp. You can also track your order in your account dashboard." },
      { q: "Do you offer pickup?", a: "Yes, you can pick up your order from our Lagos office at no extra cost. You'll receive the pickup address once your order is ready." },
    ],
  },
  {
    category: "Returns & Refunds",
    questions: [
      { q: "What is your return policy?", a: "We accept returns within 14 days of delivery for unworn, unwashed items with original tags attached. Items must be in original packaging." },
      { q: "How do I initiate a return?", a: "Contact us via WhatsApp or email with your order number and reason for return. We'll provide return instructions and a return authorization." },
      { q: "How long do refunds take?", a: "Refunds are processed within 5-7 business days after we receive and inspect the returned item. The amount will be credited to your original payment method." },
      { q: "Can I exchange an item?", a: "Yes! You can exchange for a different size or color of the same item, subject to availability. Contact us to arrange an exchange." },
      { q: "What items cannot be returned?", a: "Items that are worn, washed, altered, or without original tags cannot be returned. Sale items and custom orders are also final sale." },
    ],
  },
  {
    category: "Account & Support",
    questions: [
      { q: "How do I create an account?", a: "Click 'Create Account' on the login page or navigate to /register. Fill in your details and you're ready to shop!" },
      { q: "I forgot my password. What do I do?", a: "Click 'Forgot Password' on the login page, enter your email, and we'll send you a reset link. Check your spam folder if you don't see it." },
      { q: "How do I contact customer support?", a: "You can reach us via WhatsApp (fastest), email at hello@kalmklothing.com, or through the contact form on our website." },
      { q: "How do I track my order?", a: "Log into your account, go to 'Orders', and click on the order you want to track. You can also use the tracking link sent to your email." },
      { q: "Can I save items for later?", a: "Yes! Use the heart icon on any product to add it to your wishlist. You can access your wishlist from your account dashboard." },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-900">Frequently Asked Questions</h1>
          <p className="text-brand-500 mt-1">Find answers to common questions about shopping with us.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumb items={[{ label: "FAQ" }]} />

        <div className="mt-8 space-y-10">
          {FAQ_CATEGORIES.map((cat) => (
            <div key={cat.category}>
              <h2 className="font-heading text-xl font-semibold text-brand-900 mb-4">{cat.category}</h2>
              <div className="space-y-2">
                {cat.questions.map((item, i) => {
                  const key = `${cat.category}-${i}`;
                  const isOpen = openIndex === key;
                  return (
                    <div key={key} className="border border-brand-100 rounded-lg overflow-hidden">
                      <button onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-brand-50 transition-colors">
                        <span className="text-sm font-medium text-brand-900 pr-4">{item.q}</span>
                        <ChevronDown className={cn("h-4 w-4 text-brand-400 flex-shrink-0 transition-transform", isOpen && "rotate-180")} />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4">
                          <p className="text-sm text-brand-500 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-brand-50 rounded-xl p-8">
          <HelpCircle className="h-8 w-8 text-brand-300 mx-auto mb-3" />
          <h3 className="font-heading text-lg font-semibold text-brand-900 mb-2">Still have questions?</h3>
          <p className="text-sm text-brand-500 mb-4">Can&apos;t find what you&apos;re looking for? Our support team is here to help.</p>
          <a href="https://wa.me/2348000000000" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-10 px-6 bg-brand-900 text-white text-sm font-medium rounded-lg hover:bg-brand-800 transition-colors">
            Chat with Us
          </a>
        </div>
      </div>
    </main>
  );
}
