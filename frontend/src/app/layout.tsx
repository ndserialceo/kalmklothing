import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kalmklothing - Define Your Style",
    template: "%s | Kalmklothing",
  },
  description:
    "Premium fashion clothing for the modern individual. Discover curated collections that blend contemporary style with timeless elegance.",
  keywords: [
    "fashion",
    "clothing",
    "Nigerian fashion",
    "premium clothing",
    "style",
    "apparel",
  ],
  openGraph: {
    title: "Kalmklothing - Define Your Style",
    description:
      "Premium fashion clothing for the modern individual. Discover curated collections that blend contemporary style with timeless elegance.",
    url: "https://kalmklothing.com",
    siteName: "Kalmklothing",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kalmklothing - Define Your Style",
    description:
      "Premium fashion clothing for the modern individual.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body className="min-h-screen bg-background text-foreground font-body antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#111111",
                color: "#ffffff",
                fontFamily: "var(--font-body)",
              },
              success: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#ffffff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#ffffff",
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
