import Link from "next/link";
import { brands, byPopularity, hasNote, lines, type Line } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { FAMILIES, GENDERS, INTENSITY, KINDS, OCCASIONS, SEASONS } from "@/lib/labels";
import { CloseIcon } from "./icons";
import { ProductCard } from "./product-card";

export type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export const PRICE_BANDS = [
  { id: "0-50000", name: `${formatPrice(50000)} хүртэл`, min: 0, max: 50000 },
  { id: "50000-150000", name: "50,000–150,000₮", min: 50000, max: 150000 },
  { id: "150000-400000", name: "150,000–400,000₮", min: 150000, max: 400000 },
  { id: "400000-", name: `${formatPrice(400000)}-аас дээш`, min: 400000, max: Infinity },
] as const;

const SORTS = [
  { id: "popular", name: "Эрэлттэй нь эхэндээ" },
  { id: "new", name: "Шинэ нь эхэндээ" },
  { id: "price-asc", name: "Үнэ өсөхөөр" },
  { id: "price-desc", name: "Үнэ буурахаар" },
  { id: "name", name: "Нэрээр (A–Z)" },
] as const;
const PER_PAGE = 36;

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");

type Filters = { q: string; t: string; k: string; b: string; f: string; g: string; oc: string; se: string; i: string; p: string; pre: string; now: string; note: string; sort: string; page: number };
const KEYS = ["q", "t", "k", "b", "f", "g", "oc", "se", "i", "p", "pre", "now", "note", "sort"] as const;

export function readFilters(sp: Params, fixed: Partial<Filters> = {}): Filters {
  const r = Object.fromEntries(KEYS.map((k) => [k, one(sp[k]).slice(0, 80)])) as Omit<Filters, "page">;
  return { ...r, page: Math.max(1, Number.parseInt(one(sp.page), 10) || 1), ...fixed };
}

/** Lines matching every filter except `skip` (so facet counts show what each choice would give). */
function apply(f: Filters, skip?: keyof Filters) {
  const words = norm(f.q).split(/\s+/).filter(Boolean);
  const band = PRICE_BANDS.find((b) => b.id === f.p);
  return lines.filter((l) => {
    // fragrances by default; t=all shows make-up, care and accessories too; a kind filter decides by itself
    if (skip !== "t" && !f.k && f.t !== "all" && !words.length && !f.b && !l.isFragrance) return false;
    if (skip !== "k" && f.k && !l.kinds.includes(f.k as Line["kind"])) return false;
    if (skip !== "b" && f.b && l.brandSlug !== f.b) return false;
    if (skip !== "f" && f.f && !l.families.includes(f.f as Line["families"][number])) return false;
    if (skip !== "g" && f.g && l.gender !== f.g) return false;
    if (skip !== "oc" && f.oc && !l.occasions.includes(f.oc as Line["occasions"][number])) return false;
    if (skip !== "se" && f.se && !l.seasons.includes(f.se)) return false;
    if (skip !== "i" && f.i && l.intensity !== f.i) return false;
    if (skip !== "p" && band && !(l.maxPrice >= band.min && l.minPrice < band.max)) return false;
    if (skip !== "pre" && f.pre && !l.variants.some((v) => v.preorder)) return false;
    if (skip !== "now" && f.now && !l.readyNow) return false;
    if (f.note && !hasNote(l, f.note)) return false;
    if (words.length) {
      const hay = norm(`${l.brand ?? ""} ${l.fullName} ${l.title} ${l.conc ?? ""} ${l.familyText ?? ""} ${l.notes ? [...l.notes.top, ...l.notes.heart, ...l.notes.base].join(" ") : ""}`);
      if (!words.every((w) => hay.includes(w))) return false;
    }
    return true;
  });
}

function sortLines(list: Line[], sort: string) {
  const s = [...list];
  if (sort === "new") s.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  else if (sort === "price-asc") s.sort((a, b) => a.minPrice - b.minPrice);
  else if (sort === "price-desc") s.sort((a, b) => b.maxPrice - a.maxPrice);
  else if (sort === "name") s.sort((a, b) => `${a.brand}${a.title}`.localeCompare(`${b.brand}${b.title}`));
  else s.sort(byPopularity);
  // sold out last whatever the order
  return s.sort((a, b) => Number(b.available) - Number(a.available));
}

export function Catalog({ sp, base, fixed = {}, hide = [] }: { sp: Params; base: string; fixed?: Partial<Filters>; hide?: (keyof Filters)[] }) {
  const f = readFilters(sp, fixed);
  const found = sortLines(apply(f), f.sort);
  const pages = Math.max(1, Math.ceil(found.length / PER_PAGE));
  const page = Math.min(f.page, pages);
  const shown = found.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const href = (patch: Partial<Record<keyof Filters, string | null>>) => {
    const q = new URLSearchParams();
    for (const k of KEYS) {
      if (k in fixed) continue;
      const v = k in patch ? patch[k] : f[k];
      if (v) q.set(k, v);
    }
    if ("page" in patch && patch.page) q.set("page", patch.page);
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };
  const count = (key: keyof Filters, test: (l: Line) => boolean) => apply(f, key).filter(test).length;

  type Opt = { id: string; name: string; n: number };
  type Group = { key: keyof Filters; title: string; opts: Opt[] };
  const all: Group[] = [
    { key: "k", title: "Төрөл", opts: KINDS.filter((k) => k.id !== "other").map((k) => ({ id: k.id, name: k.name, n: count("k", (l) => l.kinds.includes(k.id)) })) },
    { key: "f", title: "Үнэрийн бүлэг", opts: FAMILIES.map((x) => ({ id: x.id, name: x.name, n: count("f", (l) => l.families.includes(x.id)) })) },
    { key: "b", title: "Брэнд", opts: brands.map((b) => ({ id: b.slug, name: b.name, n: count("b", (l) => l.brandSlug === b.slug) })) },
    { key: "g", title: "Хэнд", opts: GENDERS.map((x) => ({ id: x.id, name: x.name, n: count("g", (l) => l.gender === x.id) })) },
    { key: "p", title: "Үнэ", opts: PRICE_BANDS.map((x) => ({ id: x.id, name: x.name, n: count("p", (l) => l.maxPrice >= x.min && l.minPrice < x.max) })) },
    { key: "i", title: "Хүч", opts: INTENSITY.map((x) => ({ id: x.id, name: `${x.name} · ${x.line}`, n: count("i", (l) => l.intensity === x.id) })) },
    { key: "oc", title: "Хэзээ", opts: OCCASIONS.map((x) => ({ id: x.id, name: x.name, n: count("oc", (l) => l.occasions.includes(x.id)) })) },
    { key: "se", title: "Улирал", opts: SEASONS.map((x) => ({ id: x.id, name: x.name, n: count("se", (l) => l.seasons.includes(x.id)) })) },
  ];
  const groups = all.filter((g) => !hide.includes(g.key));

  const nameOf = (key: keyof Filters, id: string) => groups.find((g) => g.key === key)?.opts.find((o) => o.id === id)?.name ?? id;
  const active: { key: keyof Filters; label: string }[] = [];
  for (const g of groups) if (f[g.key]) active.push({ key: g.key, label: nameOf(g.key, String(f[g.key])) });
  if (f.q && !("q" in fixed)) active.push({ key: "q", label: `«${f.q}»` });
  if (f.note) active.push({ key: "note", label: `Нот: ${f.note}` });
  if (f.pre) active.push({ key: "pre", label: "Урьдчилсан захиалга" });
  if (f.now) active.push({ key: "now", label: "Бэлэн" });
  if (f.t === "all") active.push({ key: "t", label: "Бүх бүтээгдэхүүн" });

  const facets = (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        <Link href={href({ now: f.now ? null : "1", pre: null, page: null })} className="chip" aria-current={!!f.now}>
          Бэлэн
        </Link>
        <Link href={href({ pre: f.pre ? null : "1", now: null, page: null })} className="chip" aria-current={!!f.pre}>
          Урьдчилсан захиалга
        </Link>
        <Link href={href({ t: f.t === "all" ? null : "all", page: null })} className="chip" aria-current={f.t === "all"}>
          Будаг, арчилгаа ч бас
        </Link>
      </div>
      {groups.map((g) => {
        const opts = g.opts.filter((o) => o.n > 0 || f[g.key] === o.id);
        if (!opts.length) return null;
        const long = opts.length > 10;
        const list = (
          <ul className={`space-y-1 ${long ? "max-h-72 overflow-y-auto pr-2" : ""}`}>
            {opts.map((o) => {
              const on = f[g.key] === o.id;
              return (
                <li key={o.id}>
                  <Link href={href({ [g.key]: on ? null : o.id, page: null })} aria-current={on ? "true" : undefined} className="flex items-baseline justify-between gap-3 py-1 text-[14px] text-ink-2 hover:text-ink aria-[current=true]:font-semibold aria-[current=true]:text-ink">
                    <span className="flex items-baseline gap-2.5">
                      <span className={`inline-block h-2.5 w-2.5 shrink-0 border ${on ? "border-ink bg-ink" : "border-taupe"}`} aria-hidden />
                      {o.name}
                    </span>
                    <span className="text-[11.5px] text-taupe-2 tabular-nums">{o.n}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        );
        return (
          <details key={g.key} open={g.key !== "b" || !!f.b} className="group/f border-t border-line pt-4">
            <summary className="eyebrow flex cursor-pointer list-none items-center justify-between text-ink">
              {g.title}
              <span className="text-[16px] font-normal transition group-open/f:rotate-45">+</span>
            </summary>
            <div className="mt-3">{list}</div>
          </details>
        );
      })}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[250px_1fr] lg:gap-14">
      <aside className="hidden lg:block" aria-label="Шүүлтүүр">
        {facets}
      </aside>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <p className="text-[13.5px] text-ink-2">
            <b className="font-semibold text-ink tabular-nums">{found.length}</b> бүтээгдэхүүн
          </p>
          <div className="flex items-center gap-2">
            <details className="relative lg:hidden">
              <summary className="chip cursor-pointer list-none">Шүүлтүүр{active.length ? ` (${active.length})` : ""}</summary>
              <div className="fixed inset-x-0 bottom-0 z-50 max-h-[78dvh] overflow-y-auto border-t border-line bg-ivory p-6 shadow-2xl">{facets}</div>
            </details>
            <details className="relative">
              <summary className="chip cursor-pointer list-none">{SORTS.find((s) => s.id === f.sort)?.name ?? SORTS[0].name}</summary>
              <ul className="absolute right-0 z-30 mt-2 w-56 border border-line bg-paper py-2 shadow-xl">
                {SORTS.map((s) => (
                  <li key={s.id}>
                    <Link href={href({ sort: s.id === "popular" ? null : s.id, page: null })} className="block px-4 py-2 text-[14px] hover:bg-beige-2" aria-current={(f.sort || "popular") === s.id ? "true" : undefined}>
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </div>
        {active.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {active.map((a) => (
              <Link key={a.key} href={href({ [a.key]: null, page: null })} className="chip bg-beige-2" aria-label={`${a.label}: шүүлтүүр арилгах`}>
                {a.label} <CloseIcon size={13} />
              </Link>
            ))}
            <Link href={base} className="ml-1 text-[13px] text-taupe-2 underline underline-offset-4 hover:text-ink">
              Бүгдийг арилгах
            </Link>
          </div>
        )}
        {shown.length ? (
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 xl:grid-cols-4 md:gap-x-6">
            {shown.map((l, i) => (
              <li key={l.slug}>
                <ProductCard line={l} priority={i < 4} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-12 bg-paper px-6 py-16 text-center">
            <p className="serif text-[30px]">Илэрц олдсонгүй</p>
            <p className="mt-2 text-ink-2">Шүүлтүүрээ цөөлөөд үзээрэй.</p>
            <Link href={base} className="btn btn-line mt-6">
              Бүгдийг харах
            </Link>
          </div>
        )}
        {pages > 1 && (
          <nav className="mt-14 flex flex-wrap items-center justify-center gap-1.5" aria-label="Хуудас">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link key={n} href={href({ page: n === 1 ? null : String(n) })} aria-current={n === page ? "page" : undefined} className="grid h-10 min-w-10 place-items-center border border-line px-2 text-[13.5px] tabular-nums aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-ivory">
                {n}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
