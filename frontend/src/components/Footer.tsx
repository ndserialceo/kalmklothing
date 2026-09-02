import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { FaInstagram, FaTwitter, FaFacebookF } from "react-icons/fa";
import { WHATSAPP_NUMBER, BUSINESS_NAME } from "@/lib/constants";

const shopLinks = [
  { label: "New Arrivals", href: "/shop?new=true" },
  { label: "Featured", href: "/shop?featured=true" },
  { label: "Men", href: "/shop?gender=men" },
  { label: "Women", href: "/shop?gender=women" },
  { label: "Sale", href: "/shop?sale=true" },
];

const helpLinks = [
  { label: "FAQ", href: "/faq" },
  { label: "Shipping", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "Contact", href: "/contact" },
];

const socialLinks = [
  { icon: FaInstagram, href: "https://instagram.com/kalmklothing", label: "Instagram" },
  { icon: FaTwitter, href: "https://twitter.com/kalmklothing", label: "Twitter" },
  { icon: FaFacebookF, href: "https://facebook.com/kalmklothing", label: "Facebook" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-950 text-brand-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div className="space-y-5">
            <Link href="/" className="inline-block">
              <span className="font-heading text-2xl font-bold text-white tracking-wider">
                KALMKLOTHING
              </span>
            </Link>
            <p className="text-brand-400 text-sm leading-relaxed max-w-xs">
              Define Your Style. Premium fashion for the modern individual who
              values quality and timeless elegance.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-full border border-brand-700 flex items-center justify-center text-brand-400 hover:text-white hover:border-brand-500 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Shop
            </h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Help
            </h3>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <Phone className="h-4 w-4 mt-0.5 text-brand-500 flex-shrink-0" />
                <span>+234 {WHATSAPP_NUMBER.slice(3)}</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Mail className="h-4 w-4 mt-0.5 text-brand-500 flex-shrink-0" />
                <span>hello@kalmklothing.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-brand-500 flex-shrink-0" />
                <span>Lagos, Nigeria</span>
              </li>
            </ul>

            <div className="pt-2">
              <p className="text-xs text-brand-500 uppercase tracking-wider mb-2">
                Newsletter
              </p>
              <form className="flex" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 h-10 px-3 bg-brand-900 border border-brand-700 rounded-l text-sm text-white placeholder:text-brand-500 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  className="h-10 px-4 bg-accent-600 text-white text-sm font-medium rounded-r hover:bg-accent-700 transition-colors"
                >
                  Join
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="py-6 border-t border-brand-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-500">
            &copy; {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-xs text-brand-500">
            <Link href="/privacy" className="hover:text-brand-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-brand-300 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
