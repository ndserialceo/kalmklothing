"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Star,
  Heart,
  Share2,
  MessageCircle,
  Truck,
  RotateCcw,
  Shield,
} from "lucide-react";
import { products, reviews } from "@/lib/api";
import { cn, formatPrice, generateWhatsAppLink } from "@/lib/utils";
import { WHATSAPP_NUMBER } from "@/lib/constants";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import Breadcrumb from "@/components/Breadcrumb";
import ImageGallery from "@/components/ImageGallery";
import QuantitySelector from "@/components/QuantitySelector";
import SizeGuide from "@/components/SizeGuide";
import Button from "@/components/Button";
import Badge from "@/components/Badge";
import ProductGrid from "@/components/ProductGrid";
import type { Review } from "@/lib/types";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const addToCart = useCartStore((s) => s.addToCart);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const { data: productData, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => products.getProduct(slug),
  });

  const product = productData?.data?.data;

  const { data: reviewsData } = useQuery({
    queryKey: ["product-reviews", product?.id],
    queryFn: () => reviews.getProductReviews(product!.id),
    enabled: !!product,
  });

  const { data: relatedData } = useQuery({
    queryKey: ["related-products", product?.category?.slug],
    queryFn: () =>
      products.getParams({ category: product!.category.slug, page_size: 4 }),
    enabled: !!product,
  });

  const reviewList = reviewsData?.data?.results || [];
  const relatedProducts =
    relatedData?.data?.results?.filter((p) => p.id !== product?.id) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-[3/4] bg-brand-100 rounded-lg animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 w-32 bg-brand-100 rounded animate-pulse" />
              <div className="h-8 w-64 bg-brand-100 rounded animate-pulse" />
              <div className="h-4 w-24 bg-brand-100 rounded animate-pulse" />
              <div className="h-6 w-40 bg-brand-100 rounded animate-pulse" />
              <div className="h-20 w-full bg-brand-100 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-heading text-2xl font-bold text-brand-900 mb-2">
            Product Not Found
          </h2>
          <p className="text-brand-500 mb-6">
            The product you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const price = parseFloat(product.price);
  const comparePrice = product.compare_at_price
    ? parseFloat(product.compare_at_price)
    : null;
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  const colorOptions = product.variants
    ?.filter((v) => v.options?.color)
    .map((v) => v.options.color)
    .filter((v, i, a) => a.indexOf(v) === i) || [];

  const sizeOptions = product.variants
    ?.filter((v) => v.options?.size)
    .map((v) => v.options.size)
    .filter((v, i, a) => a.indexOf(v) === i) || [];

  const selectedVariant = product.variants?.find(
    (v) =>
      v.options?.color === selectedColor && v.options?.size === selectedSize
  );

  const inStock = selectedVariant
    ? selectedVariant.stock > 0
    : product.stock > 0;

  const handleAddToCart = async () => {
    if (sizeOptions.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    try {
      await addToCart(product.id, quantity, selectedVariant?.id);
      setCartOpen(true);
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (sizeOptions.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    try {
      await addToCart(product.id, quantity, selectedVariant?.id);
      router.push("/checkout");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const whatsappLink = generateWhatsAppLink(
    WHATSAPP_NUMBER,
    `Hi, I'm interested in ${product.name} - ${formatPrice(price)}`
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < rating
            ? "text-accent-400 fill-accent-400"
            : "text-brand-200"
        )}
      />
    ));
  };

  const tabs = [
    { id: "description", label: "Description" },
    { id: "materials", label: "Materials & Care" },
    { id: "shipping", label: "Shipping & Returns" },
    { id: "reviews", label: `Reviews (${reviewList.length})` },
  ];

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Breadcrumb
          items={[
            { label: "Shop", href: "/shop" },
            {
              label: product.category_name,
              href: `/shop?category=${product.category.slug}`,
            },
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-4">
          {/* Product Gallery */}
          <ImageGallery
            images={product.images}
            alt={product.name}
          />

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex items-center gap-2">
              {product.is_new_arrival && <Badge variant="new" />}
              {hasDiscount && (
                <Badge variant="discount" label={`-${discountPercent}%`} />
              )}
              {!product.is_new_arrival && !hasDiscount && product.is_bestseller && (
                <Badge variant="featured" />
              )}
            </div>

            {/* Title */}
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-brand-900">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating !== undefined && (
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {renderStars(product.rating)}
                </div>
                <span className="text-sm text-brand-500">
                  ({product.review_count || 0} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-brand-900">
                {formatPrice(price)}
              </span>
              {hasDiscount && (
                <span className="text-lg text-brand-400 line-through">
                  {formatPrice(comparePrice)}
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.short_description && (
              <p className="text-brand-600 leading-relaxed">
                {product.short_description}
              </p>
            )}

            {/* Color Selector */}
            {colorOptions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-brand-900 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 transition-all",
                        selectedColor === color
                          ? "border-brand-900 scale-110"
                          : "border-brand-200 hover:border-brand-400"
                      )}
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {sizeOptions.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-brand-900">
                    Size
                  </label>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-xs text-accent-600 hover:text-accent-700 underline"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => {
                    const variant = product.variants?.find(
                      (v) => v.options?.size === size
                    );
                    const outOfStock = variant && variant.stock <= 0;
                    return (
                      <button
                        key={size}
                        onClick={() => !outOfStock && setSelectedSize(size)}
                        disabled={outOfStock}
                        className={cn(
                          "px-4 py-2 text-sm font-medium rounded border transition-colors",
                          selectedSize === size
                            ? "bg-brand-900 text-white border-brand-900"
                            : outOfStock
                            ? "border-brand-100 text-brand-300 cursor-not-allowed line-through"
                            : "border-brand-200 text-brand-700 hover:border-brand-400"
                        )}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-brand-900 mb-2">
                Quantity
              </label>
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                max={selectedVariant ? selectedVariant.stock : product.stock}
              />
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  inStock ? "bg-green-500" : "bg-red-500"
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  inStock ? "text-green-600" : "text-red-600"
                )}
              >
                {inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                fullWidth
                size="lg"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                Add to Cart
              </Button>
              <Button
                fullWidth
                variant="secondary"
                size="lg"
                onClick={handleBuyNow}
                disabled={!inStock}
              >
                Buy Now
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex-1"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      isWishlisted && "fill-red-500 text-red-500"
                    )}
                  />
                  {isWishlisted ? "Wishlisted" : "Wishlist"}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="lg">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-brand-100">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="h-5 w-5 text-brand-400" />
                <span className="text-xs text-brand-500">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="h-5 w-5 text-brand-400" />
                <span className="text-xs text-brand-500">Easy Returns</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Shield className="h-5 w-5 text-brand-400" />
                <span className="text-xs text-brand-500">Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16 border-t border-brand-100 pt-8">
          <div className="flex border-b border-brand-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                  activeTab === tab.id
                    ? "border-brand-900 text-brand-900"
                    : "border-transparent text-brand-400 hover:text-brand-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="py-6">
            {activeTab === "description" && (
              <div className="prose prose-sm max-w-none text-brand-600">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === "materials" && (
              <div className="text-sm text-brand-600 space-y-4">
                <div>
                  <h4 className="font-medium text-brand-900 mb-1">
                    Materials
                  </h4>
                  <p>Premium quality fabric blend. Made for comfort and durability.</p>
                </div>
                <div>
                  <h4 className="font-medium text-brand-900 mb-1">Care</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Machine wash cold with like colors</li>
                    <li>Tumble dry low</li>
                    <li>Do not bleach</li>
                    <li>Iron on low heat if needed</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="text-sm text-brand-600 space-y-4">
                <div>
                  <h4 className="font-medium text-brand-900 mb-1">
                    Shipping
                  </h4>
                  <p>
                    Standard delivery takes 3-5 business days within Nigeria.
                    Free shipping on orders above ₦100,000.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-brand-900 mb-1">
                    Returns
                  </h4>
                  <p>
                    We accept returns within 14 days of delivery. Items must be
                    unworn with original tags attached. Contact our support team
                    to initiate a return.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {reviewList.length === 0 ? (
                  <p className="text-center text-brand-500 py-8">
                    No reviews yet. Be the first to review this product.
                  </p>
                ) : (
                  reviewList.map((review: Review) => (
                    <div
                      key={review.id}
                      className="border-b border-brand-100 pb-6 last:border-0"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm font-medium text-brand-900">
                          {review.user.first_name} {review.user.last_name}
                        </span>
                        {review.is_verified_purchase && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      {review.title && (
                        <h4 className="font-medium text-brand-900 mb-1">
                          {review.title}
                        </h4>
                      )}
                      <p className="text-sm text-brand-600">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="font-heading text-2xl font-bold text-brand-900 mb-6">
              You May Also Like
            </h2>
            <ProductGrid products={relatedProducts.slice(0, 4)} />
          </div>
        )}
      </div>

      <SizeGuide
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
    </main>
  );
}
