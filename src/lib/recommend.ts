import { liteLines, liteVariants, isSoldOut, type LiteLine } from "@/lib/lite";

/**
 * Picks catalog fragrances for the scent quiz and the gift finder. Only uses what the catalog states:
 * families, occasions and notes from the product descriptions, intensity from the concentration in the name,
 * gender from the shop's categories, prices and stock from Zochil. Lines without those facts simply score lower.
 */
export const BUDGETS = [
  { id: "try", name: "Эхлээд туршъя", line: "50,000₮ хүртэл · мини, vial", min: 0, max: 50000 },
  { id: "mid", name: "50,000–150,000₮", line: "Том мини, travel хэмжээ", min: 50000, max: 150000 },
  { id: "high", name: "150,000–400,000₮", line: "Дунд, бүтэн хэмжээ", min: 150000, max: 400000 },
  { id: "top", name: "400,000₮-аас дээш", line: "Бүтэн сав, онцгой бэлэг", min: 400000, max: Infinity },
  { id: "any", name: "Хамаагүй", line: "Үнээс үл хамааран", min: 0, max: Infinity },
] as const;
export type BudgetId = (typeof BUDGETS)[number]["id"];

const INT_ORDER = ["light", "moderate", "strong", "intense"];

export type Wish = {
  families?: string[];
  moodFamilies?: string[];
  occasions?: string[];
  intensity?: string | null;
  budget?: BudgetId;
  gender?: "women" | "men" | null;
  preferKinds?: string[];
};

export type Pick = { line: LiteLine; price: number; variantLabel: string; reasons: string[] };

function priceIn(l: LiteLine, budget: BudgetId | undefined) {
  const b = BUDGETS.find((x) => x.id === (budget ?? "any"))!;
  const vs = liteVariants.filter((v) => v.s === l.s && !isSoldOut(v) && v.p >= b.min && v.p < b.max).sort((a, c) => Number(a.r) - Number(c.r) || a.p - c.p);
  return vs[0] ?? null;
}

export function recommend(w: Wish, limit = 6, reasonNames?: Record<string, string>): Pick[] {
  const name = (id: string) => reasonNames?.[id] ?? id;
  const score = (l: LiteLine, strictBudget: boolean) => {
    if (!l.x || !l.a) return null;
    if (w.gender === "women" && l.g === "men") return null;
    if (w.gender === "men" && l.g === "women") return null;
    const v = priceIn(l, strictBudget ? w.budget : "any");
    if (!v) return null;
    let s = 0;
    const reasons: string[] = [];
    for (const f of w.families ?? [])
      if (l.f.includes(f)) {
        s += 5;
        reasons.push(name(f));
      }
    for (const f of w.moodFamilies ?? [])
      if (l.f.includes(f)) {
        s += 2;
        if (!reasons.includes(name(f))) reasons.push(name(f));
      }
    for (const o of w.occasions ?? [])
      if (l.oc.includes(o)) {
        s += 3;
        reasons.push(name(o));
      }
    if (w.intensity && l.i) {
      const d = Math.abs(INT_ORDER.indexOf(w.intensity) - INT_ORDER.indexOf(l.i));
      if (d === 0) {
        s += 3;
        reasons.push(name(l.i));
      } else if (d === 1) s += 1;
    }
    if (w.gender && l.g === w.gender) s += 1;
    if (w.preferKinds?.includes(l.k)) s += 2;
    if (l.nt) s += 1; // a written-up fragrance we can explain
    if (!v.r) s += 1; // ready to ship
    return { line: l, price: v.p, variantLabel: v.z, reasons: [...new Set(reasons)].slice(0, 3), s };
  };
  const run = (strict: boolean) =>
    liteLines
      .map((l) => score(l, strict))
      .filter((x): x is NonNullable<ReturnType<typeof score>> => !!x && x.s > 0)
      .sort((a, b) => b.s - a.s || a.price - b.price);
  let picks = run(true);
  // too few within budget: fill with the nearest matches at any price
  if (picks.length < 3) picks = [...picks, ...run(false).filter((p) => !picks.some((q) => q.line.s === p.line.s))];
  // one per brand + name stem keeps the list varied
  const seen = new Set<string>();
  const out: Pick[] = [];
  for (const p of picks) {
    const key = `${p.line.b}|${p.line.n.split(" ")[0]}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ line: p.line, price: p.price, variantLabel: p.variantLabel, reasons: p.reasons });
    if (out.length >= limit) break;
  }
  return out;
}
