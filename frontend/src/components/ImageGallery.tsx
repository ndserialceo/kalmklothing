"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";
import type { ProductImage } from "@/lib/types";

interface ImageGalleryProps {
  images: ProductImage[];
  alt: string;
  className?: string;
}

export default function ImageGallery({
  images,
  alt,
  className,
}: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);
  const currentImage = sortedImages[selectedIndex];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? sortedImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === sortedImages.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        className="relative aspect-[3/4] bg-brand-50 rounded-lg overflow-hidden cursor-crosshair group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={getImageUrl(currentImage?.image || "")}
          alt={currentImage?.alt_text || alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={cn(
            "object-cover transition-transform duration-300",
            isZoomed && "scale-[2.5]"
          )}
          style={
            isZoomed
              ? { transformOrigin: `${mousePosition.x}% ${mousePosition.y}%` }
              : undefined
          }
          priority
        />

        {!isZoomed && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white/80 backdrop-blur-sm rounded-full p-2.5">
              <ZoomIn className="h-5 w-5 text-brand-700" />
            </div>
          </div>
        )}

        {sortedImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4 text-brand-700" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4 text-brand-700" />
            </button>
          </>
        )}
      </div>

      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative flex-shrink-0 w-16 h-20 rounded overflow-hidden border-2 transition-colors",
                index === selectedIndex
                  ? "border-brand-900"
                  : "border-transparent hover:border-brand-300"
              )}
            >
              <Image
                src={getImageUrl(image.image)}
                alt={image.alt_text || `${alt} ${index + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
