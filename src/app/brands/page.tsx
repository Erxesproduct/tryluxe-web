import type { Metadata } from "next";
import Link from "next/link";
import { brands } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Брэндүүд",
  description: "tryLuxé дээрх бүх брэнд: Dior, Chanel, Jo Malone, YSL, KAYALI, Diptyque, Tom Ford, Maison Francis Kurkdjian, Byredo, Creed болон бусад.",
  alternates: { canonical: "/brands" },
};

export default function BrandsPage() {
  const groups = new Map<string, typeof brands>();
  for (const b of [...brands].sort((a, z) => a.name.localeCompare(z.name, "en", { sensitivity: "base" }))) {
    const letter = /[a-z]/i.test(b.name[0]) ? b.name[0].toUpperCase() : "#";
    groups.set(letter, [...(groups.get(letter) ?? []), b]);
  }
  const top = brands.slice(0, 8);
  return (
    <div className="pb-24">
      <section className="wrap pt-12 md:pt-16">
        <p className="eyebrow text-gold-ink">Брэндүүд</p>
        <h1 className="serif mt-4 max-w-3xl text-[48px] md:text-[80px]">
          {brands.length} брэнд, <em>нэг дор</em>
        </h1>
        <ul className="mt-12 grid grid-cols-2 border-t border-l border-line md:grid-cols-4">
          {top.map((b) => (
            <li key={b.slug} className="border-r border-b border-line">
              <Link href={`/brands/${b.slug}`} className="group flex aspect-[5/3] flex-col justify-between p-5 transition hover:bg-paper md:p-7">
                <span className="text-[11px] tracking-[0.14em] text-taupe-2 tabular-nums">{b.skus} бүтээгдэхүүн</span>
                <span className="serif text-[26px] leading-tight transition group-hover:translate-x-1 md:text-[34px]">{b.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <section className="wrap mt-16">
        <nav className="flex flex-wrap gap-1.5" aria-label="Үсгээр">
          {[...groups.keys()].map((k) => (
            <a key={k} href={`#l-${k}`} className="grid h-9 w-9 place-items-center border border-line text-[13px] hover:border-ink">
              {k}
            </a>
          ))}
        </nav>
        <div className="mt-10 columns-1 gap-12 sm:columns-2 lg:columns-4">
          {[...groups].map(([k, list]) => (
            <div key={k} id={`l-${k}`} className="mb-10 break-inside-avoid scroll-mt-32">
              <p className="serif text-[40px] text-gold">{k}</p>
              <ul className="mt-2 space-y-1.5">
                {list.map((b) => (
                  <li key={b.slug} className="flex items-baseline justify-between gap-3 border-b border-line/70 pb-1.5">
                    <Link href={`/brands/${b.slug}`} className="link-u text-[15px]">
                      {b.name}
                    </Link>
                    <span className="text-[11.5px] text-taupe-2 tabular-nums">{b.skus}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
