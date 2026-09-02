"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Clock, ArrowRight } from "lucide-react";
import { cn, formatPrice, getImageUrl } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { search } from "@/lib/api";
import type { Product } from "@/lib/types";

const RECENT_SEARCHES_KEY = "kalmklothing-recent-searches";

export default function SearchOverlay() {
  const { isSearchOpen, setSearchOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const performSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await search.search(q);
      setResults(data.results?.slice(0, 6) || []);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => performSearch(value), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    saveRecentSearch(query.trim());
    setSearchOpen(false);
    router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
    performSearch(term);
  };

  const handleClose = () => {
    setQuery("");
    setResults([]);
    setSearchOpen(false);
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-brand-100">
        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-3">
          <Search className="h-5 w-5 text-brand-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search for products..."
            className="flex-1 text-lg bg-transparent focus:outline-none placeholder:text-brand-300"
          />
        </form>
        <button
          onClick={handleClose}
          className="p-2 rounded-full hover:bg-brand-100 transition-colors"
          aria-label="Close search"
        >
          <X className="h-5 w-5 text-brand-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          {!query && recentSearches.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-400 mb-3">
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleRecentClick(term)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 rounded-full text-sm text-brand-600 hover:bg-brand-100 transition-colors"
                  >
                    <Clock className="h-3 w-3" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isSearching && (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 border-2 border-brand-300 border-t-brand-900 rounded-full animate-spin" />
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-400 mb-4">
                Products
              </h3>
              <div className="space-y-1">
                {results.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={() => {
                      saveRecentSearch(query.trim());
                      handleClose();
                    }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-brand-50 transition-colors"
                  >
                    <div className="relative w-14 h-18 rounded overflow-hidden bg-brand-100 flex-shrink-0">
                      {product.images?.[0] && (
                        <Image
                          src={getImageUrl(product.images[0].image)}
                          alt={product.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-brand-500">
                        {formatPrice(parseFloat(product.price))}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-brand-300 flex-shrink-0" />
                  </Link>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                className="mt-4 w-full py-3 text-sm font-medium text-brand-600 hover:text-brand-900 transition-colors"
              >
                View all results for &ldquo;{query}&rdquo;
              </button>
            </div>
          )}

          {!isSearching && query && results.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-10 w-10 text-brand-200 mx-auto mb-3" />
              <p className="text-sm text-brand-400">
                No products found for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {!query && recentSearches.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-10 w-10 text-brand-200 mx-auto mb-3" />
              <p className="text-sm text-brand-400">
                Start typing to search our collection
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
