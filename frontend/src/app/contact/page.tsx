"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, Send, ChevronDown } from "lucide-react";
import { WHATSAPP_NUMBER, BUSINESS_NAME } from "@/lib/constants";
import { generateWhatsAppLink } from "@/lib/utils";
import Button from "@/components/Button";
import Breadcrumb from "@/components/Breadcrumb";
import toast from "react-hot-toast";

const SUBJECTS = [
  "General Inquiry",
  "Order Status",
  "Returns & Refunds",
  "Sizing Help",
  "Wholesale",
  "Partnership",
  "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", order_number: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", phone: "", order_number: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-900">Contact Us</h1>
          <p className="text-brand-500 mt-1">We&apos;d love to hear from you. Get in touch with us.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Breadcrumb items={[{ label: "Contact" }]} />

        <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-10">
          {/* Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="bg-white border border-brand-100 rounded-lg p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-brand-600 mb-1.5">Name *</label>
                  <input type="text" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-600 mb-1.5">Email *</label>
                  <input type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-600 mb-1.5">Phone</label>
                  <input type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-600 mb-1.5">Order Number (Optional)</label>
                  <input type="text" value={form.order_number}
                    onChange={(e) => setForm({ ...form, order_number: e.target.value })}
                    placeholder="e.g. KL-12345"
                    className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-600 mb-1.5">Subject *</label>
                <div className="relative">
                  <select required value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full appearance-none px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 bg-white pr-8">
                    <option value="">Select a subject</option>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-600 mb-1.5">Message *</label>
                <textarea rows={5} required value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can we help you?"
                  className="w-full px-3 py-2.5 text-sm border border-brand-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500 resize-none" />
              </div>
              <Button type="submit" size="lg" loading={isSubmitting}>
                <Send className="h-4 w-4 mr-1.5" />
                Send Message
              </Button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-5 mt-8 lg:mt-0 space-y-5">
            <div className="bg-brand-50 rounded-lg p-6">
              <h3 className="font-heading text-lg font-semibold text-brand-900 mb-5">Get in Touch</h3>
              <div className="space-y-5">
                <a href={generateWhatsAppLink(WHATSAPP_NUMBER, "Hi, I need help.")}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-900">WhatsApp</p>
                    <p className="text-xs text-brand-500">Chat with us instantly</p>
                  </div>
                </a>
                <a href="tel:+2348000000000" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-200 transition-colors">
                    <Phone className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-900">Phone</p>
                    <p className="text-xs text-brand-500">+234 800 000 0000</p>
                  </div>
                </a>
                <a href="mailto:hello@kalmklothing.com" className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-200 transition-colors">
                    <Mail className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-900">Email</p>
                    <p className="text-xs text-brand-500">hello@kalmklothing.com</p>
                  </div>
                </a>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-900">Address</p>
                    <p className="text-xs text-brand-500">Lagos, Nigeria</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-50 rounded-lg p-6">
              <h3 className="font-heading text-lg font-semibold text-brand-900 mb-3">Business Hours</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-brand-500">Monday - Friday</span><span className="text-brand-900 font-medium">9:00 AM - 6:00 PM</span></div>
                <div className="flex justify-between"><span className="text-brand-500">Saturday</span><span className="text-brand-900 font-medium">10:00 AM - 4:00 PM</span></div>
                <div className="flex justify-between"><span className="text-brand-500">Sunday</span><span className="text-brand-400">Closed</span></div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-brand-100 rounded-lg h-48 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-8 w-8 text-brand-300 mx-auto mb-2" />
                <p className="text-sm text-brand-400">Map coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
