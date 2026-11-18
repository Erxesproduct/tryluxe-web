import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Catalog, type Params } from "@/components/catalog";
import { brands, getBrand, lines } from "@/lib/catalog";
import { familyName } from "@/lib/labels";

export const generateStaticParams = () => brands.map((b) => ({ slug: b.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const b = getBrand((await params).slug);
  if (!b) return {};
  return { title: `${b.name}`, description: `${b.name}: tryLuxé дээрх ${b.skus} бүтээгдэхүүн (мини, vial, бүтэн хэмжээ). Оригинал, баталгаат эх сурвалжаас.`, alternates: { canonical: `/brands/${b.slug}` } };
}

export default async function BrandPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<Params> }) {
  const { slug } = await params;
  const b = getBrand(slug);
  if (!b) notFound();
  const own = lines.filter((l) => l.brandSlug === slug);
  // the families this house is written up with most often (from the product descriptions)
  const fam = new Map<string, number>();
  for (const l of own) for (const f of l.families) fam.set(f, (fam.get(f) ?? 0) + 1);
  const topFam = [...fam].sort((a, z) => z[1] - a[1]).slice(0, 3).map(([f]) => familyName(f));
  const min = Math.min(...own.map((l) => l.minPrice));
  return (
    <div className="pb-24">
      <section className="bg-beige-2">
        <div className="wrap py-14 md:py-20">
          <nav className="text-[12px] tracking-[0.08em] text-taupe-2" aria-label="Зам">
            <Link href="/brands" className="hover:text-ink">
              Брэндүүд
            </Link>{" "}
            / <span className="text-ink">{b.name}</span>
          </nav>
          <h1 className="serif mt-6 text-[56px] md:text-[104px]">{b.name}</h1>
          <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-4 border-t border-line pt-6 text-[14px]">
            <div>
              <dt className="eyebrow text-taupe-2">Бүтээгдэхүүн</dt>
              <dd className="serif mt-1 text-[28px] tabular-nums">{b.skus}</dd>
            </div>
            <div>
              <dt className="eyebrow text-taupe-2">Эхлэх үнэ</dt>
              <dd className="serif mt-1 text-[28px] tabular-nums">{min.toLocaleString("en-US")}₮</dd>
            </div>
            {topFam.length > 0 && (
              <div>
                <dt className="eyebrow text-taupe-2">Түгээмэл бүлэг</dt>
                <dd className="serif mt-1 text-[28px]">{topFam.join(", ")}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>
      <div className="wrap mt-12">
        <Catalog sp={await searchParams} base={`/brands/${slug}`} fixed={{ b: slug }} hide={["b"]} />
      </div>
    </div>
  );
}
