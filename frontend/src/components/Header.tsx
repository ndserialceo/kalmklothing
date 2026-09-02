"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  Heart,
  Home,
  Store,
  LogOut,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { NAVIGATION_LINKS } from "@/lib/constants";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const { setCartOpen, isMobileMenuOpen, setMobileMenuOpen, setSearchOpen } =
    useUIStore();
  const itemCount = useCartStore((s) => s.itemCount);
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 bg-white transition-shadow duration-300",
          scrolled && "shadow-sm"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 rounded hover:bg-brand-50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-brand-700" />
              ) : (
                <Menu className="h-5 w-5 text-brand-700" />
              )}
            </button>

            <Link href="/" className="flex items-center">
              <span className="font-heading text-xl sm:text-2xl font-bold text-brand-900 tracking-wider">
                KALMKLOTHING
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {NAVIGATION_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-brand-600 hover:text-brand-900 transition-colors relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-900 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full hover:bg-brand-50 transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5 text-brand-700" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                  className="p-2 rounded-full hover:bg-brand-50 transition-colors hidden sm:flex"
                  aria-label="Account"
                >
                  <User className="h-5 w-5 text-brand-700" />
                </button>

                {showAccountDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowAccountDropdown(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-brand-100 rounded-lg shadow-lg py-2 z-50 animate-slide-up">
                      {isAuthenticated ? (
                        <>
                          <div className="px-4 py-2 border-b border-brand-100">
                            <p className="text-sm font-medium text-brand-900">
                              {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-xs text-brand-400">{user?.email}</p>
                          </div>
                          <Link
                            href="/account"
                            onClick={() => setShowAccountDropdown(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-700 hover:bg-brand-50 transition-colors"
                          >
                            <User className="h-4 w-4" />
                            My Account
                          </Link>
                          <Link
                            href="/orders"
                            onClick={() => setShowAccountDropdown(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-700 hover:bg-brand-50 transition-colors"
                          >
                            <Package className="h-4 w-4" />
                            Orders
                          </Link>
                          <Link
                            href="/wishlist"
                            onClick={() => setShowAccountDropdown(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-700 hover:bg-brand-50 transition-colors"
                          >
                            <Heart className="h-4 w-4" />
                            Wishlist
                          </Link>
                          <button
                            onClick={() => {
                              logout();
                              setShowAccountDropdown(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-700 hover:bg-brand-50 transition-colors w-full"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            onClick={() => setShowAccountDropdown(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-700 hover:bg-brand-50 transition-colors"
                          >
                            <User className="h-4 w-4" />
                            Sign In
                          </Link>
                          <Link
                            href="/register"
                            onClick={() => setShowAccountDropdown(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-brand-700 hover:bg-brand-50 transition-colors"
                          >
                            Create Account
                          </Link>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => setCartOpen(true)}
                className="p-2 rounded-full hover:bg-brand-50 transition-colors relative"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5 text-brand-700" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4.5 w-4.5 flex items-center justify-center rounded-full bg-accent-600 text-white text-[10px] font-bold min-w-[18px]">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-brand-950/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-16 bottom-0 w-full max-w-sm bg-white shadow-xl animate-slide-up overflow-y-auto">
            <nav className="p-6 space-y-1">
              {NAVIGATION_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-brand-100 p-6">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <p className="px-4 text-sm font-medium text-brand-900 mb-2">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                  >
                    Orders
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-2.5 bg-brand-900 text-white text-sm font-medium rounded-lg hover:bg-brand-800 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-2.5 border border-brand-200 text-brand-700 text-sm font-medium rounded-lg hover:bg-brand-50 transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-brand-100 lg:hidden safe-bottom">
        <div className="grid grid-cols-5 h-14">
          {[
            { icon: Home, label: "Home", href: "/" },
            { icon: Store, label: "Shop", href: "/shop" },
            {
              icon: Search,
              label: "Search",
              href: "#",
              onClick: () => setSearchOpen(true),
            },
            {
              icon: ShoppingBag,
              label: "Cart",
              href: "#",
              onClick: () => setCartOpen(true),
              badge: itemCount,
            },
            { icon: User, label: "Account", href: "/account" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={(e) => {
                if (item.onClick) {
                  e.preventDefault();
                  item.onClick();
                }
              }}
              className="flex flex-col items-center justify-center gap-0.5 relative"
            >
              <item.icon className="h-5 w-5 text-brand-600" />
              <span className="text-[10px] text-brand-500 font-medium">
                {item.label}
              </span>
              {item.badge && item.badge > 0 && (
                <span className="absolute top-1 right-1/2 translate-x-3 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-accent-600 text-white text-[9px] font-bold px-1">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      <div className="h-16 lg:block hidden" />
    </>
  );
}
