"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
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
import Breadcrumb from "@/components/Breadcrumb";
import ProductGrid from "@/components/ProductGrid";
import Button from "@/components/Button";
import type { Category } from "@/lib/types";

const SIZES = ["S", "M", "L", "XL", "XXL"];

function CategoryContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedSizes, setSelectedSizes] = useState<string[]>(
    searchParams.get("size") ? searchParams.get("size")!.split(",") : []
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "-created_at");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({ size: true });

  const { data: categoryData } = useQuery({
    queryKey: ["category-tree"],
    queryFn: () => categories.getCategoryTree(),
  });

  const categoryTree = categoryData?.data?.data || [];
  const category = categoryTree.find((c: Category) => c.slug === slug);

  const queryParams = useMemo(() => {
    const p: Record<string, string | number | boolean> = {
      page: currentPage, page_size: 20, ordering: sortBy, category: slug,
    };
    if (searchQuery) p.search = searchQuery;
    if (selectedSizes.length > 0) p.size = selectedSizes.join(",");
    return p;
  }, [searchQuery, selectedSizes, sortBy, currentPage, slug]);

  const { data, isLoading } = useQuery({
    queryKey: ["category-products", queryParams],
    queryFn: () => products.getParams(queryParams),
  });

  const productList = data?.data?.results || [];
  const totalCount = data?.data?.count || 0;
  const totalPages = Math.ceil(totalCount / 20);

  const updateURL = useCallback(() => {
    const p = new URLSearchParams();
    if (searchQuery) p.set("q", searchQuery);
    if (selectedSizes.length > 0) p.set("size", selectedSizes.join(","));
    if (sortBy !== "-created_at") p.set("sort", sortBy);
    if (currentPage > 1) p.set("page", currentPage.toString());
    router.push(`/category/${slug}?${p.toString()}`, { scroll: false });
  }, [searchQuery, selectedSizes, sortBy, currentPage, slug, router]);

  useEffect(() => { updateURL(); }, [updateURL]);

  const clearAllFilters = () => {
    setSearchQuery(""); setSelectedSizes([]); setCurrentPage(1);
    router.push(`/category/${slug}`, { scroll: false });
  };

  const toggleFilter = (key: string) => {
    setExpandedFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasActiveFilters = searchQuery || selectedSizes.length > 0;

  const renderFilters = () => (
    <div className="space-y-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-brand-900">Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="text-xs text-accent-600 hover:text-accent-700 flex items-center gap-1">
            <RotateCcw className="h-3 w-3" /> Clear All
          </button>
        )}
      </div>
      <div className="border-b border-brand-100 last:border-0">
        <button onClick={() => toggleFilter("size")}
          className="flex items-center justify-between w-full py-3 text-sm font-medium text-brand-900">
          Size
          {expandedFilters.size ? <ChevronUp className="h-4 w-4 text-brand-400" /> : <ChevronDown className="h-4 w-4 text-brand-400" />}
        </button>
        {expandedFilters.size && (
          <div className="pb-4 flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button key={size} onClick={() => {
                setSelectedSizes(selectedSizes.includes(size)
                  ? selectedSizes.filter((s) => s !== size) : [...selectedSizes, size]);
                setCurrentPage(1);
              }} className={cn("px-3 py-1.5 text-xs font-medium rounded border transition-colors",
                selectedSizes.includes(size)
                  ? "bg-brand-900 text-white border-brand-900"
                  : "border-brand-200 text-brand-700 hover:border-brand-400")}>
                {size}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white">
      <div className="relative bg-gradient-to-r from-brand-900 via-brand-800 to-brand-950 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-600 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-16">
          <Breadcrumb
            items={[
              { label: "Shop", href: "/shop" },
              { label: category?.name || slug },
            ]}
            className="mb-4 [&_span]:text-white/60 [&_a]:text-white/60 [&_a:hover]:text-white"
          />
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-white mb-3">
            {category?.name || "Category"}
          </h1>
          {category?.description && <p className="text-brand-300 max-w-lg">{category.description}</p>}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-400" />
            <input type="text" placeholder="Search in this category..." value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-accent-500" />
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
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </button>
                <p className="text-sm text-brand-500">
                  <span className="font-medium text-brand-900">{totalCount}</span> products
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
            <ProductGrid products={productList} loading={isLoading} />
            {!isLoading && productList.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-7 w-7 text-brand-400" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-brand-900 mb-2">No products found</h3>
                <p className="text-brand-500 mb-6">Try adjusting your filters or check back later.</p>
                <Button variant="secondary" onClick={clearAllFilters}>Clear Filters</Button>
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button variant="secondary" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
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
                <Button variant="secondary" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
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
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1 rounded-full hover:bg-brand-100"><X className="h-5 w-5 text-brand-500" /></button>
            </div>
            <div className="p-4">{renderFilters()}</div>
            <div className="p-4 border-t border-brand-100">
              <Button fullWidth onClick={() => setMobileFiltersOpen(false)}>Show Results ({totalCount})</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white"><div className="bg-gradient-to-r from-brand-900 to-brand-950 py-12"><div className="max-w-7xl mx-auto px-4"><div className="h-4 w-48 bg-white/20 rounded animate-pulse mb-4" /><div className="h-8 w-64 bg-white/20 rounded animate-pulse" /></div></div></div>}>
      <CategoryContent />
    </Suspense>
  );
}
