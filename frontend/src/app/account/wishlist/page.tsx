"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { wishlist as wishlistApi, cart as cartApi } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { formatPrice, getImageUrl } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/Button";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const queryClient = useQueryClient();
  const { addToCart } = useCartStore();
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const { data, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: () => wishlistApi.getWishlist(),
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => wishlistApi.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Removed from wishlist");
    },
  });

  const handleMoveToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      await removeMutation.mutateAsync(productId);
      setCartOpen(true);
      toast.success("Moved to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const items = data?.data?.data?.items || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-brand-100 overflow-hidden animate-pulse">
            <div className="aspect-[3/4] bg-brand-100" />
            <div className="p-3 space-y-2">
              <div className="h-3 w-20 bg-brand-100 rounded" />
              <div className="h-4 w-full bg-brand-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-brand-100">
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Save items you love to your wishlist and come back to them anytime."
          actionLabel="Explore Products"
          onAction={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-brand-100 p-6">
        <h2 className="font-heading text-lg font-semibold text-brand-900 mb-5">
          My Wishlist ({items.length})
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {items.map((item: any) => {
            const product = item.product;
            const firstImage = product.images?.[0];
            const price = parseFloat(product.price);
            const comparePrice = product.compare_at_price ? parseFloat(product.compare_at_price) : null;
            return (
              <div key={item.id} className="bg-white border border-brand-100 rounded-lg overflow-hidden group">
                <Link href={`/products/${product.slug}`} className="relative aspect-[3/4] bg-brand-50 block">
                  {firstImage && (
                    <Image src={getImageUrl(firstImage.image)} alt={product.name} fill className="object-cover" />
                  )}
                </Link>
                <div className="p-3">
                  <p className="text-[11px] uppercase tracking-wider text-brand-400 font-medium">
                    {product.category_name}
                  </p>
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="text-sm font-medium text-brand-900 line-clamp-1 mt-1 hover:text-accent-700 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-sm font-semibold text-brand-900">{formatPrice(price)}</span>
                    {comparePrice && comparePrice > price && (
                      <span className="text-xs text-brand-400 line-through">{formatPrice(comparePrice)}</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" fullWidth onClick={() => handleMoveToCart(product.id)}>
                      <ShoppingBag className="h-3.5 w-3.5 mr-1" />
                      Move to Cart
                    </Button>
                    <button onClick={() => removeMutation.mutate(product.id)}
                      className="w-9 h-9 flex items-center justify-center rounded border border-brand-200 text-brand-400 hover:text-red-500 hover:border-red-200 transition-colors flex-shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
