"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronDown,
  Gem,
  ShieldCheck,
  Truck,
  Headphones,
  Camera,
  ExternalLink,
} from "lucide-react";
import { products, categories } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { BUSINESS_NAME } from "@/lib/constants";
import ProductGrid from "@/components/ProductGrid";
import Button from "@/components/Button";
import type { Category } from "@/lib/types";

const categoryGradients = [
  "from-amber-600 to-orange-700",
  "from-rose-600 to-pink-700",
  "from-emerald-600 to-teal-700",
  "from-violet-600 to-purple-700",
];

export default function HomePage() {
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categories.getCategories(),
  });

  const { data: newArrivalsData, isLoading: newArrivalsLoading } = useQuery({
    queryKey: ["new-arrivals"],
    queryFn: () => products.getNewArrivals(),
  });

  const { data: bestSellersData, isLoading: bestSellersLoading } = useQuery({
    queryKey: ["best-sellers"],
    queryFn: () => products.getBestSellers(),
  });

  const categoryList = categoriesData?.data?.results || [];
  const newArrivals = newArrivalsData?.data?.results || [];
  const bestSellers = bestSellersData?.data?.results || [];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a017' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-accent-400 text-sm tracking-[0.3em] uppercase mb-4 font-medium">
            {BUSINESS_NAME}
          </p>
          <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
            Define Your
            <span className="block text-accent-400">Style</span>
          </h1>
          <p className="text-brand-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Premium African fashion for the modern individual. Discover pieces
            that celebrate your heritage and elevate your wardrobe.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/shop">
              <Button size="lg" className="min-w-[200px]">
                Shop Now
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/shop?featured=true">
              <Button variant="secondary" size="lg" className="min-w-[200px] border-white/30 text-white hover:bg-white/10">
                Explore Collection
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-white/50" />
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-accent-600 text-sm tracking-[0.2em] uppercase mb-2">
              Browse
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-900">
              Shop by Category
            </h2>
          </div>
          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-brand-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categoryList.slice(0, 4).map((cat: Category, index: number) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group relative aspect-[4/5] rounded-lg overflow-hidden"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      categoryGradients[index % categoryGradients.length]
                    } transition-transform duration-500 group-hover:scale-110`}
                  />
                  <div className="absolute inset-0 bg-brand-950/20 group-hover:bg-brand-950/40 transition-colors duration-300" />
                  <div className="relative h-full flex flex-col items-center justify-center text-white p-4">
                    <h3 className="font-heading text-xl md:text-2xl font-bold mb-1">
                      {cat.name}
                    </h3>
                    {cat.product_count !== undefined && (
                      <p className="text-sm text-white/80">
                        {cat.product_count} Products
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link href="/shop">
              <Button variant="secondary">
                View All Categories
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20 px-4 bg-brand-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-accent-600 text-sm tracking-[0.2em] uppercase mb-2">
                Just Dropped
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-900">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/new-arrivals"
              className="text-sm font-medium text-brand-600 hover:text-brand-900 transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid products={newArrivals.slice(0, 8)} loading={newArrivalsLoading} />
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-brand-900 via-brand-800 to-accent-900 p-8 md:p-16">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-400 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-600 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 text-center">
              <p className="text-accent-400 text-sm tracking-[0.2em] uppercase mb-3">
                Limited Time Offer
              </p>
              <h2 className="font-heading text-2xl md:text-4xl font-bold text-white mb-4">
                Free Delivery on Orders Above{" "}
                <span className="text-accent-400">{formatPrice(100000)}</span>
              </h2>
              <p className="text-brand-300 mb-8 max-w-lg mx-auto">
                Shop now and enjoy free delivery straight to your doorstep.
                No minimum purchase required for orders over the threshold.
              </p>
              <Link href="/shop">
                <Button size="lg">
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-accent-600 text-sm tracking-[0.2em] uppercase mb-2">
                Customer Favorites
              </p>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-900">
                Best Sellers
              </h2>
            </div>
            <Link
              href="/shop?bestsellers=true"
              className="text-sm font-medium text-brand-600 hover:text-brand-900 transition-colors flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid products={bestSellers.slice(0, 8)} loading={bestSellersLoading} />
        </div>
      </section>

      {/* Why Shop With Us */}
      <section className="py-20 px-4 bg-brand-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-accent-600 text-sm tracking-[0.2em] uppercase mb-2">
              Our Promise
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-900">
              Why Shop With Us
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Gem,
                title: "Premium Quality",
                desc: "Carefully crafted pieces using the finest materials.",
              },
              {
                icon: ShieldCheck,
                title: "Secure Payment",
                desc: "Your transactions are safe with our secure checkout.",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                desc: "Swift and reliable delivery to your doorstep.",
              },
              {
                icon: Headphones,
                title: "Customer Support",
                desc: "Dedicated support team ready to assist you.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-accent-100 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-accent-600" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-brand-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-brand-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram / Social Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-accent-600 text-sm tracking-[0.2em] uppercase mb-2">
              Stay Connected
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-900 mb-3">
              Follow Us @kalmklothing
            </h2>
            <p className="text-brand-500 max-w-md mx-auto">
              Join our community and get inspired by the latest styles and
              everyday looks.
            </p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-brand-200 to-brand-300 relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-brand-900/0 group-hover:bg-brand-900/50 transition-colors duration-300 flex items-center justify-center">
                  <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a
              href="https://instagram.com/kalmklothing"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="secondary">
                <ExternalLink className="h-4 w-4" />
                Follow Us
              </Button>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
