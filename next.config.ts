import { readFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

// Old Zochil URLs keep working: /products/<categoryId>/<productId> → /p/<line>, /products/<categoryId> → filtered catalog.
const catalog = JSON.parse(readFileSync(path.join(process.cwd(), "src", "data", "catalog.json"), "utf8")) as { lines: { slug: string; variants: { id: number }[] }[] };
const productRedirects = catalog.lines.flatMap((l) => l.variants.map((v) => ({ source: `/products/:category/${v.id}`, destination: `/p/${l.slug}`, permanent: true })));
// Zochil categories of shop 29401 → filters on the new site
const CATEGORIES: Record<number, string> = {
  250096: "/discovery",
  250097: "/fragrances?k=mini",
  250134: "/fragrances?k=mini&g=women",
  250133: "/fragrances?k=mini&g=men",
  250108: "/fragrances?k=makeup",
  250109: "/fragrances?k=skincare",
  250110: "/fragrances?k=body",
  351606: "/fragrances?k=vial",
  351623: "/fragrances?k=vial",
  353708: "/fragrances?k=petit",
  288049: "/fragrances?k=set",
  250749: "/fragrances?k=accessory",
  250105: "/fragrances?k=bag",
  250100: "/fragrances?k=full&now=1",
  250132: "/fragrances?k=full&now=1",
  250102: "/fragrances?k=skincare",
  250752: "/fragrances?k=skincare",
  250751: "/fragrances?k=body",
  285543: "/fragrances?k=wrap",
  250098: "/fragrances?pre=1",
  250099: "/fragrances?pre=1",
  250115: "/fragrances?pre=1&g=men",
  250116: "/fragrances?pre=1&g=women",
  250112: "/fragrances?k=makeup&pre=1",
  250113: "/fragrances?k=skincare&pre=1",
  250114: "/fragrances?k=body&pre=1",
};
for (const id of [250120, 250121, 250119, 250118, 250117, 250122]) CATEGORIES[id] = "/fragrances?k=makeup&pre=1";
for (const id of [250124, 250130, 250131, 250127, 250126, 250125, 250123, 250128, 250129]) CATEGORIES[id] = "/fragrances?k=skincare&pre=1";
const categoryRedirects = Object.entries(CATEGORIES).map(([id, destination]) => ({ source: `/products/${id}`, destination, permanent: true }));

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Photos are pre-sized WebP (480 px thumbs, 1000 px large), so they are served as-is.
  images: { unoptimized: true },
  async redirects() {
    return [
      { source: "/products", destination: "/fragrances", permanent: true },
      ...productRedirects,
      ...categoryRedirects,
      { source: "/products/:category(\\d+|null)", destination: "/fragrances", permanent: false },
      { source: "/products/:category(\\d+|null)/:id(\\d+)", destination: "/fragrances", permanent: false },
      { source: "/category/:path*", destination: "/fragrances", permanent: false },
      { source: "/saled-products", destination: "/fragrances", permanent: true },
      { source: "/shopping-cart", destination: "/cart", permanent: true },
      { source: "/checkout", destination: "/cart", permanent: true },
      { source: "/about", destination: "/story", permanent: true },
      { source: "/faq", destination: "/story#faq", permanent: true },
      { source: "/terms", destination: "/story#delivery", permanent: true },
      { source: "/contact", destination: "/story", permanent: true },
      { source: "/accounts/:path*", destination: "/account", permanent: false },
      { source: "/shop", destination: "/fragrances", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      { source: "/images/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
    ];
  },
};

export default nextConfig;
