import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { ProductView } from "@/components/product-view";
import { Reveal } from "@/components/reveal";
import { business } from "@/content/business";
import { cover, getLine, img, lines, soldOut, type Line } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { familyName, intensityName, kindName, occasionName, seasonName } from "@/lib/labels";
import { absoluteUrl } from "@/lib/site-url";

export const generateStaticParams = () => lines.map((l) => ({ slug: l.slug }));
export const dynamicParams = false;

const name = (l: Line) => [l.brand, l.title].filter(Boolean).join(" ");

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const l = getLine((await params).slug);
  if (!l) return {};
  const pic = cover(l);
  const notes = l.notes ? ` Эхлэл: ${l.notes.top.join(", ")}. Зүрх: ${l.notes.heart.join(", ")}. Суурь: ${l.notes.base.join(", ")}.` : "";
  return {
    title: name(l),
    description: `${name(l)} ${l.variants.map((v) => v.label).join(", ")} · ${formatPrice(l.minPrice)}-аас.${notes}`.slice(0, 300),
    alternates: { canonical: `/p/${l.slug}` },
    openGraph: { images: pic ? [{ url: img(pic) }] : undefined },
  };
}

/** Other fragrances to try: same family first, then same house, ready ones before pre-orders. */
function related(l: Line) {
  const score = (o: Line) => o.families.filter((f) => l.families.includes(f)).length * 3 + (o.brand === l.brand ? 2 : 0) + (o.gender === l.gender ? 1 : 0) + (o.readyNow ? 1 : 0);
  return lines
    .filter((o) => o.slug !== l.slug && o.available && o.isFragrance === l.isFragrance)
    .map((o) => ({ o, s: score(o) }))
    .filter((x) => x.s > 1)
    .sort((a, b) => b.s - a.s || b.o.orders - a.o.orders)
    .slice(0, 4)
    .map((x) => x.o);
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const l = getLine((await params).slug);
  if (!l) notFound();
  const subtitle = [kindName(l.kind), l.conc, l.gender === "women" ? "Эмэгтэй" : l.gender === "men" ? "Эрэгтэй" : null].filter(Boolean).join(" · ");
  const more = related(l);
  const pic = cover(l);
  const tiers = l.notes
    ? ([
        ["Эхлэл", "Top", "Эхний 15 минут", l.notes.top],
        ["Зүрх", "Heart", "Дараагийн хэдэн цаг", l.notes.heart],
        ["Суурь", "Base", "Арьсан дээр үлдэх", l.notes.base],
      ] as const)
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: name(l),
    brand: l.brand ? { "@type": "Brand", name: l.brand } : undefined,
    image: pic ? absoluteUrl(img(pic)) : undefined,
    description: l.description?.slice(0, 500),
    offers: l.variants.map((v) => ({
      "@type": "Offer",
      sku: `TL-${v.id}`,
      name: v.label,
      price: v.price,
      priceCurrency: "MNT",
      availability: soldOut(v) ? "https://schema.org/OutOfStock" : v.preorder ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
      url: absoluteUrl(`/p/${l.slug}`),
    })),
  };

  return (
    <div className="pb-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="wrap pt-8 md:pt-12">
        <nav className="mb-8 text-[12px] tracking-[0.08em] text-taupe-2" aria-label="Зам">
          <Link href="/" className="hover:text-ink">
            Нүүр
          </Link>{" "}
          /{" "}
          <Link href={l.isFragrance ? "/fragrances" : "/fragrances?t=all"} className="hover:text-ink">
            {l.isFragrance ? "Үнэртэй ус" : "Бүтээгдэхүүн"}
          </Link>
          {l.brand && l.brandSlug && (
            <>
              {" "}
              /{" "}
              <Link href={`/brands/${l.brandSlug}`} className="hover:text-ink">
                {l.brand}
              </Link>
            </>
          )}
        </nav>

        <ProductView
          slug={l.slug}
          brand={l.brand}
          brandSlug={l.brandSlug}
          title={l.title}
          subtitle={subtitle}
          variants={l.variants.map((v) => ({ id: v.id, label: v.label, price: v.price, compareAt: v.compareAt, stock: v.stock, preorder: v.preorder, images: v.images }))}
        >
          {(l.families.length > 0 || l.intensity || l.seasons.length > 0 || l.occasions.length > 0) && (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-b border-line py-7 text-[14px]">
              {l.familyText && (
                <div>
                  <dt className="eyebrow text-taupe-2">Үнэрийн бүлэг</dt>
                  <dd className="mt-1.5">
                    {l.families.length
                      ? l.families.map((f, i) => (
                          <span key={f}>
                            {i > 0 && ", "}
                            <Link href={`/fragrances?f=${f}`} className="link-u">
                              {familyName(f)}
                            </Link>
                          </span>
                        ))
                      : l.familyText}
                  </dd>
                </div>
              )}
              {l.intensity && (
                <div>
                  <dt className="eyebrow text-taupe-2">Хүч</dt>
                  <dd className="mt-1.5">
                    {intensityName(l.intensity)} · {l.conc}
                  </dd>
                </div>
              )}
              {l.seasons.length > 0 && (
                <div>
                  <dt className="eyebrow text-taupe-2">Улирал</dt>
                  <dd className="mt-1.5">{l.seasons.length === 4 ? "Бүх улирал" : l.seasons.map(seasonName).join(", ")}</dd>
                </div>
              )}
              {l.occasions.length > 0 && (
                <div>
                  <dt className="eyebrow text-taupe-2">Хэзээ</dt>
                  <dd className="mt-1.5">{l.occasions.map(occasionName).join(", ")}</dd>
                </div>
              )}
            </dl>
          )}

          {tiers && (
            <section className="border-b border-line py-8" aria-labelledby="notes">
              <h2 id="notes" className="eyebrow text-gold-ink">
                Үнэрийн нот
              </h2>
              <ol className="mt-5 space-y-0">
                {tiers.map(([mn, en, when, notes], i) => (
                  <li key={en} className="grid grid-cols-[86px_1fr] gap-4 border-t border-line/70 py-4 first:border-t-0">
                    <div>
                      <p className="serif text-[24px] leading-none">{mn}</p>
                      <p className="mt-1 text-[10.5px] tracking-[0.18em] text-taupe-2 uppercase">
                        {en} · {when}
                      </p>
                    </div>
                    <ul className="flex flex-wrap gap-1.5 self-center">
                      {notes.length ? (
                        notes.map((n) => (
                          <li key={n}>
                            <Link href={`/fragrances?note=${encodeURIComponent(n)}`} className={`inline-block border border-line px-3 py-1 text-[13.5px] transition hover:border-ink ${i === 0 ? "bg-paper" : i === 1 ? "bg-beige-2" : "bg-beige"}`}>
                              {n}
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li className="text-taupe-2">—</li>
                      )}
                    </ul>
                  </li>
                ))}
              </ol>
              <p className="mt-2 text-[12px] text-taupe-2">Нотыг tryLuxé-ийн бүтээгдэхүүний тайлбараас авав.</p>
            </section>
          )}

          {l.description && (
            <section className="border-b border-line py-8" aria-labelledby="about">
              <h2 id="about" className="eyebrow text-gold-ink">
                Тайлбар
              </h2>
              <div className="prose-tl mt-4 text-[15px] leading-[1.8] text-ink-2">
                {l.description.split("\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}

          <section className="py-8" aria-labelledby="delivery">
            <h2 id="delivery" className="eyebrow text-gold-ink">
              Хүргэлт, төлбөр
            </h2>
            <ul className="mt-4 space-y-2.5 text-[14px] text-ink-2">
              <li>Улаанбаатар хот дотор {formatPrice(business.cityFee)}; {formatPrice(business.freeFrom)}-өөс дээш захиалгад үнэгүй.</li>
              <li>{business.rules.delivery}</li>
              <li>{business.rules.payment}</li>
              <li>{business.rules.returns}</li>
            </ul>
          </section>
        </ProductView>
      </div>

      {more.length > 0 && (
        <section className="wrap mt-20 border-t border-line pt-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="serif text-[38px] md:text-[52px]">
              Мөн <em>туршиж үзээрэй</em>
            </h2>
            <Link href={l.families[0] ? `/fragrances?f=${l.families[0]}` : "/fragrances"} className="link-arrow">
              {l.families[0] ? `${familyName(l.families[0])} үнэрүүд` : "Бүгд"} →
            </Link>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {more.map((o, i) => (
              <Reveal as="li" key={o.slug} delay={i * 80}>
                <ProductCard line={o} />
              </Reveal>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
