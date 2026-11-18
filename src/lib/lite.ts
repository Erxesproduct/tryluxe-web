import data from "@/data/lite.json";

/**
 * Slim records for client components.
 * V (one per size / SKU): i Zochil id, s line slug, n name, b brand, z size label, c concentration, p price,
 * o price before discount, k stock (null = not counted), r pre-order, t first image name.
 */
export type LiteVariant = { i: number; s: string; n: string; b: string | null; z: string; c: string | null; p: number; o: number | null; k: number | null; r: 0 | 1; t: string | null };
/**
 * L (one per fragrance line): s slug, n name, b brand, k kind, x is a fragrance, g gender, i intensity, c concentration,
 * f families, se seasons, oc occasions, nt notes [top, heart, base] (first three each), p / q lowest / highest price,
 * a can be ordered, r ready now, t image, vz number of sizes, sz size labels.
 */
export type LiteLine = {
  s: string;
  n: string;
  b: string | null;
  k: string;
  x: 0 | 1;
  g: "women" | "men" | null;
  i: string | null;
  c: string | null;
  f: string[];
  se: string[];
  oc: string[];
  nt: [string[], string[], string[]] | null;
  p: number;
  q: number;
  a: 0 | 1;
  r: 0 | 1;
  t: string | null;
  vz: number;
  sz: string[];
};

export const liteVariants = data.v as LiteVariant[];
export const liteLines = data.l as LiteLine[];
const byId = new Map(liteVariants.map((v) => [v.i, v]));
const bySlug = new Map(liteLines.map((l) => [l.s, l]));
export const getLiteVariant = (id: number) => byId.get(id);
export const getLiteLine = (slug: string) => bySlug.get(slug);
export const variantsOf = (slug: string) => liteVariants.filter((v) => v.s === slug);

export const thumbSrc = (name: string | null) => (name ? `/images/p/${name}-t.webp` : null);
export const largeSrc = (name: string | null) => (name ? `/images/p/${name}.webp` : null);
export const isSoldOut = (v: Pick<LiteVariant, "k" | "r">) => !v.r && v.k === 0;
