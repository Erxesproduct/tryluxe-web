import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { byPopularity, lines, type Line } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Discovery багц, мини, vial",
  description: "Discover First. Fall in Love Later. Оригинал vial тестер, мини үнэртэй ус, discovery болон бэлгийн багц: бүтэн сав авахаасаа өмнө туршаад үзээрэй.",
  alternates: { canonical: "/discovery" },
};

const ready = (l: Line) => l.available;
const SHELVES = [
  { id: "sets", title: "Discovery ба бэлгийн багц", line: "Нэг хайрцагт хэд хэдэн үнэр, эсвэл үнэр ба арчилгааны хослол.", pick: (l: Line) => l.kinds.includes("set") },
  { id: "vials", title: "Vial тестер", line: "1–2 мл-ийн оригинал тестер: үнэрийг арьсан дээрээ хэдэн өдөр туршихад хангалттай.", pick: (l: Line) => l.kinds.includes("vial") },
  { id: "minis", title: "Мини үнэртэй ус", line: "Брэндийн өөрийн мини сав: цүнхэнд багтана, аялалд тохиромжтой.", pick: (l: Line) => l.kinds.includes("mini") },
  { id: "petit", title: "PETIT by tryLuxé", line: "tryLuxé-ийн өөрийн жижиг хэмжээний цуглуулга.", pick: (l: Line) => l.kinds.includes("petit") },
] as const;

export default function DiscoveryPage() {
  const shelves = SHELVES.map((s) => {
    const all = lines.filter((l) => s.pick(l) && ready(l)).sort(byPopularity);
    return { ...s, all, from: all.length ? Math.min(...all.map((l) => l.minPrice)) : 0 };
  }).filter((s) => s.all.length);
  return (
    <div className="pb-24">
      <section className="bg-beige-2">
        <div className="wrap grid gap-8 py-16 md:grid-cols-[1.4fr_1fr] md:items-end md:py-24">
          <div>
            <p className="eyebrow text-gold-ink">Mini Perfumes & Discovery Sets</p>
            <h1 className="serif mt-5 text-[52px] leading-[0.98] md:text-[96px]">
              Discover First.
              <br />
              <em className="text-gold-ink">Fall in Love Later.</em>
            </h1>
          </div>
          <div>
            <p className="lede">Эхлээд туршаад, дараа нь дурла. Бүтэн сав худалдаж авахаасаа өмнө үнэрийг арьсан дээрээ, өөрийн өдөр тутмын хэмнэлд мэдэр.</p>
            <nav className="mt-8 flex flex-wrap gap-2" aria-label="Тавиурууд">
              {shelves.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="chip">
                  {s.title} <span className="text-taupe-2">{s.all.length}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>
      </section>
      {shelves.map((s, si) => (
        <section key={s.id} id={s.id} className="wrap scroll-mt-28 pt-16 md:pt-24">
          <div className="grid gap-4 border-b border-line pb-6 md:grid-cols-[auto_1fr_auto] md:items-end md:gap-10">
            <p className="serif text-[64px] leading-none text-gold md:text-[88px]">{String(si + 1).padStart(2, "0")}</p>
            <div>
              <h2 className="serif text-[34px] md:text-[48px]">{s.title}</h2>
              <p className="mt-2 max-w-xl text-[14.5px] text-ink-2">{s.line}</p>
            </div>
            <p className="text-[13px] text-taupe-2">
              {s.all.length} бүтээгдэхүүн · {formatPrice(s.from)}-аас
            </p>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 md:gap-x-6">
            {s.all.slice(0, 10).map((l, i) => (
              <Reveal as="li" key={l.slug} delay={(i % 5) * 60}>
                <ProductCard line={l} sizes="(min-width: 1024px) 18vw, (min-width: 640px) 31vw, 48vw" />
              </Reveal>
            ))}
          </ul>
          {s.all.length > 10 && (
            <Link href={`/fragrances?k=${s.id === "sets" ? "set" : s.id === "vials" ? "vial" : s.id === "minis" ? "mini" : "petit"}&t=all`} className="btn btn-line mt-10">
              Бүх {s.all.length}-ийг харах
            </Link>
          )}
        </section>
      ))}
    </div>
  );
}
