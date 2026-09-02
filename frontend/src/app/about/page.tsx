import type { Metadata } from "next";
import Link from "next/link";
import { Award, Heart, Sparkles, Users } from "lucide-react";
import { BUSINESS_NAME, WHATSAPP_NUMBER } from "@/lib/constants";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${BUSINESS_NAME} - our story, mission, and commitment to premium fashion.`,
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-brand-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-950 opacity-90" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-accent-400 text-sm font-medium uppercase tracking-wider mb-4">Our Story</p>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Defining Style,<br />One Thread at a Time
            </h1>
            <p className="text-brand-300 text-lg leading-relaxed">
              {BUSINESS_NAME} was born from a passion for creating premium fashion that empowers
              individuals to express their unique identity with confidence.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Breadcrumb items={[{ label: "About" }]} />

        {/* Mission & Values */}
        <section className="mt-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl font-bold text-brand-900 mb-4">Our Mission & Values</h2>
            <p className="text-brand-500">
              We believe fashion should be more than clothing — it should be an expression of who you are.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Sparkles, title: "Quality First", desc: "Every piece is crafted with premium materials and meticulous attention to detail." },
              { icon: Heart, title: "Passion for Design", desc: "Our designs blend contemporary trends with timeless elegance." },
              { icon: Users, title: "Community", desc: "Building a community of confident individuals who define their own style." },
              { icon: Award, title: "Sustainability", desc: "Committed to ethical practices and sustainable fashion choices." },
            ].map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-5 w-5 text-accent-600" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-brand-900 mb-2">{item.title}</h3>
                <p className="text-sm text-brand-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="mt-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl font-bold text-brand-900 mb-4">Our Journey</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            {[
              { year: "2020", title: "The Beginning", desc: "Founded with a vision to bring premium Nigerian fashion to the world." },
              { year: "2021", title: "Growing Community", desc: "Reached our first 1,000 customers and expanded our collections." },
              { year: "2023", title: "New Horizons", desc: "Launched our online store and began nationwide delivery." },
              { year: "2024", title: "Defining Style", desc: "Continuing to innovate and bring you the finest in contemporary fashion." },
            ].map((item, i) => (
              <div key={item.year} className="flex gap-6 mb-10 last:mb-0">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-brand-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {item.year.slice(2)}
                  </div>
                  {i < 3 && <div className="w-0.5 flex-1 bg-brand-200 mt-2" />}
                </div>
                <div className="pb-8">
                  <p className="text-xs font-medium text-accent-600 uppercase tracking-wider">{item.year}</p>
                  <h3 className="font-heading text-lg font-semibold text-brand-900 mt-1">{item.title}</h3>
                  <p className="text-sm text-brand-500 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-20 bg-brand-50 rounded-2xl p-10 md:p-16 text-center">
          <h2 className="font-heading text-3xl font-bold text-brand-900 mb-4">Ready to Define Your Style?</h2>
          <p className="text-brand-500 mb-8 max-w-lg mx-auto">
            Explore our curated collections and find pieces that speak to your unique sense of style.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/shop"
              className="inline-flex items-center justify-center h-12 px-8 bg-brand-900 text-white text-sm font-medium rounded-md hover:bg-brand-800 transition-colors">
              Shop Now
            </Link>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-12 px-8 border border-brand-200 text-brand-900 text-sm font-medium rounded-md hover:bg-brand-100 transition-colors">
              Contact Us
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
