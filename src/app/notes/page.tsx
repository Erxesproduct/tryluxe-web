import type { Metadata } from "next";
import Link from "next/link";
import { fragrances, noteIndex } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Үнэрийн нот",
  description: "Эхлэл, зүрх, суурь нот: tryLuxé-ийн үнэртэй усны тайлбарт бичигдсэн бүх нотыг судалж, дуртай нотоороо үнэрээ олоорой.",
  alternates: { canonical: "/notes" },
};

const TIERS = [
  { id: "top", mn: "Эхлэл", en: "Top notes", line: "Шүршсэн даруйд мэдрэгдэх, хамгийн түрүүнд алга болох нот: цитрус, жимс, ногоон." },
  { id: "heart", mn: "Зүрх", en: "Heart notes", line: "Хэдэн цагийн турш үнэрийн гол дүрийг бүтээх нот: цэцэг, халуун ногоо." },
  { id: "base", mn: "Суурь", en: "Base notes", line: "Арьсан дээр хамгийн удаан үлдэх гүн нот: мод, ваниль, амбер, мускус." },
] as const;

export default function NotesPage() {
  const idx = noteIndex();
  const written = fragrances.filter((l) => l.notes).length;
  return (
    <div className="wrap pt-12 pb-24 md:pt-20">
      <p className="eyebrow text-gold-ink">Fragrance Notes Explorer</p>
      <h1 className="serif mt-4 max-w-4xl text-[48px] md:text-[80px]">
        Үнэр бүр <em>гурван давхар</em> түүхтэй
      </h1>
      <p className="lede mt-5 max-w-2xl">
        Доорх нот бүр манай {written} үнэртэй усны тайлбарт бичигдсэн. Нот дээр дарахад тэр нотыг агуулсан үнэрүүд гарна. Тоо нь хэдэн үнэрт байгааг заана.
      </p>
      <div className="mt-14 space-y-16">
        {TIERS.map((t, ti) => {
          const list = idx[t.id];
          const max = list[0]?.count ?? 1;
          return (
            <section key={t.id} aria-labelledby={`t-${t.id}`} className="grid gap-8 border-t border-line pt-8 md:grid-cols-[280px_1fr] md:gap-14">
              <div>
                <p className="serif text-[72px] leading-none text-gold">{String(ti + 1).padStart(2, "0")}</p>
                <h2 id={`t-${t.id}`} className="serif mt-3 text-[38px]">
                  {t.mn} <span className="text-[18px] text-taupe-2 italic">{t.en}</span>
                </h2>
                <p className="mt-3 text-[14px] text-ink-2">{t.line}</p>
              </div>
              <ul className="flex flex-wrap items-baseline gap-x-2 gap-y-2.5">
                {list.slice(0, 60).map(({ note, count }) => (
                  <li key={note}>
                    <Link
                      href={`/fragrances?note=${encodeURIComponent(note)}`}
                      className="inline-flex items-baseline gap-1.5 border border-line bg-paper px-3 py-1.5 transition hover:border-ink hover:bg-ivory"
                      style={{ fontSize: `${13 + Math.round((count / max) * 9)}px` }}
                    >
                      {note}
                      <span className="text-[11px] text-taupe-2 tabular-nums">{count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
