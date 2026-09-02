"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { cn, formatPrice, getImageUrl } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import Badge from "./Badge";
import type { Product } from "@/lib/types";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const addToCart = useCartStore((s) => s.addToCart);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const price = parseFloat(product.price);
  const comparePrice = product.compare_at_price
    ? parseFloat(product.compare_at_price)
    : null;
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  const firstImage = product.images?.[0];

  const colorSwatches = product.variants
    ?.filter((v) => v.options?.color)
    .map((v) => v.options.color)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 5);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
      setCartOpen(true);
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn("group block", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] bg-brand-50 rounded-lg overflow-hidden mb-3">
        {firstImage && (
          <Image
            src={getImageUrl(firstImage.image)}
            alt={firstImage.alt_text || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-transform duration-500",
              isHovered && "scale-105"
            )}
          />
        )}

        {product.is_new_arrival && !hasDiscount && (
          <Badge variant="new" />
        )}
        {hasDiscount && (
          <Badge variant="discount" label={`-${discountPercent}%`} />
        )}
        {!product.is_new_arrival && !hasDiscount && product.is_bestseller && (
          <Badge variant="featured" />
        )}

        <div
          className={cn(
            "absolute inset-x-0 bottom-0 p-3 flex items-center justify-center gap-2 transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <button
            onClick={handleAddToCart}
            className="flex-1 h-10 flex items-center justify-center gap-2 bg-brand-900 text-white text-xs font-medium rounded hover:bg-brand-800 transition-colors"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add to Cart
          </button>
          <button
            onClick={handleWishlist}
            className={cn(
              "h-10 w-10 flex items-center justify-center rounded border transition-colors",
              isWishlisted
                ? "bg-red-50 border-red-200 text-red-500"
                : "bg-white/90 border-brand-200 text-brand-700 hover:bg-white"
            )}
            aria-label="Add to wishlist"
          >
            <Heart
              className={cn("h-4 w-4", isWishlisted && "fill-current")}
            />
          </button>
        </div>

        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-brand-950/40 transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="bg-white rounded-full p-3 shadow-lg">
            <Eye className="h-5 w-5 text-brand-700" />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] uppercase tracking-wider text-brand-400 font-medium">
          {product.category_name}
        </p>
        <h3 className="text-sm font-medium text-brand-900 group-hover:text-accent-700 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-brand-900">
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-brand-400 line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>
        {colorSwatches && colorSwatches.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            {colorSwatches.map((color) => (
              <span
                key={color}
                className="w-3.5 h-3.5 rounded-full border border-brand-200"
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
