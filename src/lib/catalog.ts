import "server-only";

import data from "@/data/catalog.json";
import type { FamilyId, IntensityId, KindId, OccasionId } from "@/lib/labels";

export type Variant = {
  /** Zochil product id: one size / SKU. erxes product code TL-<id>. */
  id: number;
  label: string;
  size: string | null;
  conc: string | null;
  price: number;
  compareAt: number | null;
  /** null: not counted (pre-order) */
  stock: number | null;
  preorder: boolean;
  kind: KindId;
  /** image names under /images/p/ (<name>.webp large, <name>-t.webp thumbnail) */
  images: string[];
  zochilCategory: number | null;
  zochilSku: string | null;
};

export type Line = {
  slug: string;
  title: string;
  fullName: string;
  brand: string | null;
  brandSlug: string | null;
  brandInferred: boolean;
  kind: KindId;
  kinds: KindId[];
  isFragrance: boolean;
  gender: "women" | "men" | null;
  conc: string | null;
  intensity: IntensityId | null;
  /** Only what the product description states (Эхлэл / Зүрх / Суурь). */
  notes: { top: string[]; heart: string[]; base: string[] } | null;
  familyText: string | null;
  families: FamilyId[];
  seasons: string[];
  occasions: OccasionId[];
  fitText: string | null;
  description: string | null;
  variants: Variant[];
  minPrice: number;
  maxPrice: number;
  available: boolean;
  readyNow: boolean;
  preorderOnly: boolean;
  onSale: boolean;
  featured: boolean;
  /** Verified orders on Zochil (order_verified_count, summed over sizes). */
  orders: number;
  createdAt: string;
};

export type Brand = { slug: string; name: string; lines: number; skus: number; fragrances: number; logo: string | null };

export const lines = data.lines as Line[];
export const brands = data.brands as Brand[];
export const catalogSource = data.source;

const bySlug = new Map(lines.map((l) => [l.slug, l]));
const byVariant = new Map(lines.flatMap((l) => l.variants.map((v) => [v.id, { line: l, variant: v }] as const)));
export const getLine = (slug: string) => bySlug.get(slug);
export const getBrand = (slug: string) => brands.find((b) => b.slug === slug);
export const getVariant = (id: number) => byVariant.get(id);

export const img = (name: string) => `/images/p/${name}.webp`;
export const thumb = (name: string) => `/images/p/${name}-t.webp`;
export const cover = (l: Line) => l.variants.find((v) => v.images.length)?.images[0] ?? null;
/** erxes product code */
export const sku = (id: number) => `TL-${id}`;

export const fragrances = lines.filter((l) => l.isFragrance);
export const soldOut = (v: Pick<Variant, "stock" | "preorder">) => !v.preorder && v.stock === 0;

/** Variant shown first: the cheapest one that can be bought now, else the cheapest pre-order. */
export const leadVariant = (l: Line) => l.variants.find((v) => !v.preorder && !soldOut(v)) ?? l.variants.find((v) => !soldOut(v)) ?? l.variants[0];

/** Every note the shop has written down, with how many fragrances carry it. */
export function noteIndex() {
  const tiers = { top: new Map<string, number>(), heart: new Map<string, number>(), base: new Map<string, number>() };
  for (const l of lines) {
    if (!l.notes) continue;
    for (const t of ["top", "heart", "base"] as const) for (const n of new Set(l.notes[t])) tiers[t].set(n, (tiers[t].get(n) ?? 0) + 1);
  }
  const sorted = (m: Map<string, number>) => [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([note, count]) => ({ note, count }));
  return { top: sorted(tiers.top), heart: sorted(tiers.heart), base: sorted(tiers.base) };
}
export const hasNote = (l: Line, note: string) => !!l.notes && [...l.notes.top, ...l.notes.heart, ...l.notes.base].some((n) => n === note);

/** Ready to ship first, then most ordered. */
export const byPopularity = (a: Line, b: Line) => Number(b.readyNow) - Number(a.readyNow) || b.orders - a.orders || Number(b.featured) - Number(a.featured);
