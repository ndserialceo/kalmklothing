"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import { products, categories } from "@/lib/api";
import { cn } from "@/lib/utils";
import { PRODUCT_SORT_OPTIONS } from "@/lib/constants";
import ProductGrid from "@/components/ProductGrid";
import Button from "@/components/Button";
import type { Category } from "@/lib/types";

const SIZES = ["S", "M", "L", "XL", "XXL"];
const COLORS = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#ffffff" },
  { name: "Navy", value: "#1e3a5f" },
  { name: "Brown", value: "#8B4513" },
  { name: "Gold", value: "#d4a017" },
  { name: "Green", value: "#2d5a27" },
  { name: "Red", value: "#c0392b" },
  { name: "Blue", value: "#2980b9" },
];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : []
  );
  const [selectedGender, setSelectedGender] = useState(
    searchParams.get("gender") || ""
  );
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    searchParams.get("size") ? searchParams.get("size")!.split(",") : []
  );
  const [selectedColors, setSelectedColors] = useState<string[]>(
    searchParams.get("color") ? searchParams.get("color")!.split(",") : []
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [inStock, setInStock] = useState(searchParams.get("in_stock") === "true");
  const [onSale, setOnSale] = useState(searchParams.get("on_sale") === "true");
  const [isNew, setIsNew] = useState(searchParams.get("is_new") === "true");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "-created_at");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({
    category: true,
    gender: true,
    size: true,
    color: true,
    price: true,
    availability: true,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories-list"],
    queryFn: () => categories.getCategories(),
  });

  const categoryList = categoriesData?.data?.results || [];

  const params = useMemo(() => {
    const p: Record<string, string | number | boolean> = {
      page: currentPage,
      page_size: 20,
      ordering: sortBy,
    };
    if (searchQuery) p.search = searchQuery;
    if (selectedCategories.length === 1) p.category = selectedCategories[0];
    if (selectedCategories.length > 1) p.category = selectedCategories.join(",");
    if (selectedGender) p.gender = selectedGender;
    if (selectedSizes.length > 0) p.size = selectedSizes.join(",");
    if (selectedColors.length > 0) p.color = selectedColors.join(",");
    if (minPrice) p.min_price = minPrice;
    if (maxPrice) p.max_price = maxPrice;
    if (inStock) p.in_stock = "true";
    if (onSale) p.on_sale = "true";
    if (isNew) p.is_new_arrival = "true";
    return p;
  }, [
    searchQuery, selectedCategories, selectedGender, selectedSizes,
    selectedColors, minPrice, maxPrice, inStock, onSale, isNew, sortBy, currentPage,
  ]);

  const { data, isLoading } = useQuery({
    queryKey: ["shop-products", params],
    queryFn: () => products.getParams(params),
  });

  const productList = data?.data?.results || [];
  const totalCount = data?.data?.count || 0;
  const totalPages = Math.ceil(totalCount / 20);

  const updateURL = useCallback(() => {
    const p = new URLSearchParams();
    if (searchQuery) p.set("q", searchQuery);
    if (selectedCategories.length > 0) p.set("category", selectedCategories.join(","));
    if (selectedGender) p.set("gender", selectedGender);
    if (selectedSizes.length > 0) p.set("size", selectedSizes.join(","));
    if (selectedColors.length > 0) p.set("color", selectedColors.join(","));
    if (minPrice) p.set("min_price", minPrice);
    if (maxPrice) p.set("max_price", maxPrice);
    if (inStock) p.set("in_stock", "true");
    if (onSale) p.set("on_sale", "true");
    if (isNew) p.set("is_new", "true");
    if (sortBy !== "-created_at") p.set("sort", sortBy);
    if (currentPage > 1) p.set("page", currentPage.toString());
    router.push(`/shop?${p.toString()}`, { scroll: false });
  }, [
    searchQuery, selectedCategories, selectedGender, selectedSizes,
    selectedColors, minPrice, maxPrice, inStock, onSale, isNew,
    sortBy, currentPage, router,
  ]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedGender("");
    setSelectedSizes([]);
    setSelectedColors([]);
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setOnSale(false);
    setIsNew(false);
    setCurrentPage(1);
    router.push("/shop", { scroll: false });
  };

  const toggleFilter = (key: string) => {
    setExpandedFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasActiveFilters =
    searchQuery || selectedCategories.length > 0 || selectedGender ||
    selectedSizes.length > 0 || selectedColors.length > 0 ||
    minPrice || maxPrice || inStock || onSale || isNew;

  const SectionHeader = ({ title, filterKey }: { title: string; filterKey: string }) => (
    <button
      onClick={() => toggleFilter(filterKey)}
      className="flex items-center justify-between w-full py-3 text-sm font-medium text-brand-900"
    >
      {title}
      {expandedFilters[filterKey] ? (
        <ChevronUp className="h-4 w-4 text-brand-400" />
      ) : (
        <ChevronDown className="h-4 w-4 text-brand-400" />
      )}
    </button>
  );

  const renderFilters = () => (
    <div className="space-y-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-brand-900">Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="text-xs text-accent-600 hover:text-accent-700 flex items-center gap-1">
            <RotateCcw className="h-3 w-3" />
            Clear All
          </button>
        )}
      </div>

      {/* Category */}
      <div className="border-b border-brand-100">
        <SectionHeader title="Category" filterKey="category" />
        {expandedFilters.category && (
          <div className="pb-4 space-y-2 max-h-48 overflow-y-auto">
            {categoryList.map((cat: Category) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.slug)}
                  onChange={(e) => {
                    setSelectedCategories(e.target.checked
                      ? [...selectedCategories, cat.slug]
                      : selectedCategories.filter((c) => c !== cat.slug));
                    setCurrentPage(1);
                  }}
                  className="w-4 h-4 rounded border-brand-300 text-accent-600 focus:ring-accent-500"
                />
                <span className="text-sm text-brand-700">{cat.name}</span>
                {cat.product_count !== undefined && (
                  <span className="text-xs text-brand-400 ml-auto">({cat.product_count})</span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Gender */}
      <div className="border-b border-brand-100">
        <SectionHeader title="Gender" filterKey="gender" />
        {expandedFilters.gender && (
          <div className="pb-4 space-y-2">
            {["", "Men", "Women", "Unisex"].map((g) => (
              <label key={g} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="gender" checked={selectedGender === g}
                  onChange={() => { setSelectedGender(g); setCurrentPage(1); }}
                  className="w-4 h-4 border-brand-300 text-accent-600 focus:ring-accent-500" />
                <span className="text-sm text-brand-700">{g || "All"}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Size */}
      <div className="border-b border-brand-100">
        <SectionHeader title="Size" filterKey="size" />
        {expandedFilters.size && (
          <div className="pb-4 flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button key={size}
                onClick={() => {
                  setSelectedSizes(selectedSizes.includes(size)
                    ? selectedSizes.filter((s) => s !== size)
                    : [...selectedSizes, size]);
                  setCurrentPage(1);
                }}
                className={cn("px-3 py-1.5 text-xs font-medium rounded border transition-colors",
                  selectedSizes.includes(size)
                    ? "bg-brand-900 text-white border-brand-900"
                    : "border-brand-200 text-brand-700 hover:border-brand-400")}>
                {size}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color */}
      <div className="border-b border-brand-100">
        <SectionHeader title="Color" filterKey="color" />
        {expandedFilters.color && (
          <div className="pb-4 flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <button key={color.value}
                onClick={() => {
                  setSelectedColors(selectedColors.includes(color.value)
                    ? selectedColors.filter((c) => c !== color.value)
                    : [...selectedColors, color.value]);
                  setCurrentPage(1);
                }}
                className={cn("w-8 h-8 rounded-full border-2 transition-all",
                  selectedColors.includes(color.value)
                    ? "border-brand-900 scale-110"
                    : "border-brand-200 hover:border-brand-400")}
                style={{ backgroundColor: color.value }} title={color.name} />
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-brand-100">
        <SectionHeader title="Price Range" filterKey="price" />
        {expandedFilters.price && (
          <div className="pb-4 flex items-center gap-2">
            <input type="number" placeholder="Min" value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-sm border border-brand-200 rounded focus:outline-none focus:ring-1 focus:ring-accent-500" />
            <span className="text-brand-400">-</span>
            <input type="number" placeholder="Max" value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 text-sm border border-brand-200 rounded focus:outline-none focus:ring-1 focus:ring-accent-500" />
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="border-b border-brand-100 last:border-0">
        <SectionHeader title="Availability" filterKey="availability" />
        {expandedFilters.availability && (
          <div className="pb-4 space-y-2">
            {[
              { label: "In Stock", checked: inStock, onChange: setInStock },
              { label: "On Sale", checked: onSale, onChange: setOnSale },
              { label: "New Arrivals", checked: isNew, onChange: setIsNew },
            ].map((item) => (
              <label key={item.label} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={item.checked}
                  onChange={(e) => { item.onChange(e.target.checked); setCurrentPage(1); }}
                  className="w-4 h-4 rounded border-brand-300 text-accent-600 focus:ring-accent-500" />
                <span className="text-sm text-brand-700">{item.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-900 mb-2">Shop</h1>
          <p className="text-brand-500">Discover our curated collection of premium fashion</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
            <input type="text" placeholder="Search products..." value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent-500 focus:border-accent-500" />
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24">{renderFilters()}</div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-100">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 border border-brand-200 rounded-lg text-sm">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && <span className="w-2 h-2 bg-accent-500 rounded-full" />}
                </button>
                <p className="text-sm text-brand-500">
                  <span className="font-medium text-brand-900">{totalCount}</span> products found
                </p>
              </div>
              <div className="relative">
                <select value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                  className="appearance-none pl-3 pr-8 py-2 border border-brand-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-accent-500">
                  {PRODUCT_SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400 pointer-events-none" />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategories.map((cat) => (
                  <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 rounded-full text-xs font-medium text-brand-700">
                    {cat}
                    <button onClick={() => setSelectedCategories(selectedCategories.filter((c) => c !== cat))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {selectedGender && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 rounded-full text-xs font-medium text-brand-700">
                    {selectedGender}
                    <button onClick={() => setSelectedGender("")}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {selectedSizes.map((size) => (
                  <span key={size} className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 rounded-full text-xs font-medium text-brand-700">
                    Size: {size}
                    <button onClick={() => setSelectedSizes(selectedSizes.filter((s) => s !== size))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 rounded-full text-xs font-medium text-brand-700">
                    Price: {minPrice || "0"} - {maxPrice || "∞"}
                    <button onClick={() => { setMinPrice(""); setMaxPrice(""); }}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {inStock && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 rounded-full text-xs font-medium text-brand-700">
                    In Stock
                    <button onClick={() => setInStock(false)}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {onSale && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 rounded-full text-xs font-medium text-brand-700">
                    On Sale
                    <button onClick={() => setOnSale(false)}><X className="h-3 w-3" /></button>
                  </span>
                )}
                {isNew && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-100 rounded-full text-xs font-medium text-brand-700">
                    New Arrivals
                    <button onClick={() => setIsNew(false)}><X className="h-3 w-3" /></button>
                  </span>
                )}
              </div>
            )}

            <ProductGrid products={productList} loading={isLoading} />

            {!isLoading && productList.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-7 w-7 text-brand-400" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-brand-900 mb-2">No products found</h3>
                <p className="text-brand-500 mb-6 max-w-sm mx-auto">
                  Try adjusting your filters or search terms to find what you&apos;re looking for.
                </p>
                <Button variant="secondary" onClick={clearAllFilters}>Clear All Filters</Button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button variant="secondary" size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  Previous
                </Button>
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                  let page: number;
                  if (totalPages <= 7) page = i + 1;
                  else if (currentPage <= 4) page = i + 1;
                  else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
                  else page = currentPage - 3 + i;
                  return (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={cn("w-9 h-9 rounded text-sm font-medium transition-colors",
                        currentPage === page ? "bg-brand-900 text-white" : "text-brand-700 hover:bg-brand-100")}>
                      {page}
                    </button>
                  );
                })}
                <Button variant="secondary" size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-brand-950/60 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto">
            <div className="p-4 border-b border-brand-100 flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold text-brand-900">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1 rounded-full hover:bg-brand-100">
                <X className="h-5 w-5 text-brand-500" />
              </button>
            </div>
            <div className="p-4">{renderFilters()}</div>
            <div className="p-4 border-t border-brand-100">
              <Button fullWidth onClick={() => setMobileFiltersOpen(false)}>
                Show Results ({totalCount})
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ShopLoadingFallback() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-8 w-32 bg-brand-100 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-brand-100 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoadingFallback />}>
      <ShopContent />
    </Suspense>
  );
}
