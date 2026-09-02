"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, X, ArrowRight } from "lucide-react";
import { search } from "@/lib/api";
import ProductGrid from "@/components/ProductGrid";
import Button from "@/components/Button";
import Link from "next/link";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const updateURL = useCallback(() => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    router.push(`/search?${p.toString()}`, { scroll: false });
  }, [query, router]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  const { data, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => search.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const { data: suggestionsData } = useQuery({
    queryKey: ["search-suggestions", debouncedQuery],
    queryFn: () => search.getSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const results = data?.data?.results || [];
  const totalCount = data?.data?.count || 0;
  const suggestions = suggestionsData?.data?.data || [];

  return (
    <main className="min-h-screen bg-white">
      {/* Search Header */}
      <div className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-brand-900 text-center mb-6">
              Search
            </h1>
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-400" />
              <input
                type="text"
                placeholder="Search for products, categories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-12 py-4 border border-brand-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 shadow-sm"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-brand-100"
                >
                  <X className="h-5 w-5 text-brand-400" />
                </button>
              )}
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && debouncedQuery.length >= 2 && (
              <div className="mt-2 bg-white rounded-lg shadow-lg border border-brand-100 overflow-hidden">
                {suggestions.slice(0, 5).map((suggestion: string) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setQuery(suggestion);
                      setDebouncedQuery(suggestion);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-brand-700 hover:bg-brand-50 flex items-center gap-3 transition-colors"
                  >
                    <SearchIcon className="h-4 w-4 text-brand-300" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {debouncedQuery && debouncedQuery.length >= 2 ? (
          <>
            <div className="mb-6">
              <p className="text-sm text-brand-500">
                {isLoading ? (
                  "Searching..."
                ) : (
                  <>
                    <span className="font-medium text-brand-900">{totalCount}</span>{" "}
                    results for &ldquo;
                    <span className="font-medium text-brand-900">{debouncedQuery}</span>
                    &rdquo;
                  </>
                )}
              </p>
            </div>

            <ProductGrid products={results} loading={isLoading} />

            {!isLoading && results.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="h-7 w-7 text-brand-400" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-brand-900 mb-2">
                  No results found
                </h3>
                <p className="text-brand-500 mb-6 max-w-sm mx-auto">
                  We couldn&apos;t find anything matching &ldquo;{debouncedQuery}&rdquo;.
                  Try different keywords or browse our collections.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button variant="secondary" onClick={() => setQuery("")}>
                    Clear Search
                  </Button>
                  <Link href="/shop">
                    <Button>
                      Browse Shop
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="h-7 w-7 text-brand-400" />
            </div>
            <h3 className="font-heading text-xl font-semibold text-brand-900 mb-2">
              Start typing to search
            </h3>
            <p className="text-brand-500 max-w-sm mx-auto">
              Find your perfect piece from our curated collection of premium
              fashion.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function SearchLoadingFallback() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-brand-50 border-b border-brand-100">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            <div className="h-8 w-32 bg-brand-100 rounded animate-pulse mx-auto mb-6" />
            <div className="h-14 w-full bg-brand-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchContent />
    </Suspense>
  );
}
