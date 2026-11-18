import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/hero";
import { ArrowIcon, GiftIcon } from "@/components/icons";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { ScentQuiz } from "@/components/scent-quiz";
import { business } from "@/content/business";
import { brands, byPopularity, cover, fragrances, img, leadVariant, lines, thumb, type Line } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { FAMILIES } from "@/lib/labels";

export const metadata = { alternates: { canonical: "/" } };
// re-rendered daily so «Seasonal Favorites» follows the season
export const revalidate = 86400;

/** Current season in Ulaanbaatar for «Seasonal Favorites» (name, and its genitive for «…-ын дуртай»). */
function season(d = new Date()) {
  const m = d.getMonth();
  return m <= 1 || m === 11
    ? { id: "winter", name: "Өвөл", of: "Өвлийн" }
    : m <= 4
      ? { id: "spring", name: "Хавар", of: "Хаврын" }
      : m <= 7
        ? { id: "summer", name: "Зун", of: "Зуны" }
        : { id: "autumn", name: "Намар", of: "Намрын" };
}

function topNotes(list: Line[], n: number) {
  const m = new Map<string, number>();
  for (const l of list) if (l.notes) for (const x of [...l.notes.top, ...l.notes.heart, ...l.notes.base]) m.set(x, (m.get(x) ?? 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1]).slice(0, n).map(([x]) => x);
}

export default function Home() {
  const ready = fragrances.filter((l) => l.available);
  // «Best-selling»: most verified orders on Zochil (order_verified_count), ready to ship
  const best = [...ready].filter((l) => l.readyNow && l.orders > 0).sort((a, b) => b.orders - a.orders);
  const [lead, ...rest] = best;
  const discovery = lines.filter((l) => l.available && (l.kinds.includes("vial") || l.kinds.includes("set") || l.kinds.includes("mini"))).sort(byPopularity);
  const sets = lines.filter((l) => l.available && l.kinds.includes("set")).sort(byPopularity);
  const now = season();
  const wardrobe = [
    { id: "everyday", title: "Everyday Elegance", mn: "Өдөр тутмын дэгжин байдал", line: "Өглөөнөөс орой хүртэл зөөлөн дагах үнэр.", href: "/fragrances?oc=everyday", pick: (l: Line) => l.occasions.includes("everyday") },
    { id: "office", title: "Office Confidence", mn: "Оффисын итгэл", line: "Хурал, уулзалтад зохимжтой, хэмжээтэй үнэр.", href: "/fragrances?oc=office", pick: (l: Line) => l.occasions.includes("office") },
    { id: "romance", title: "Romantic Evenings", mn: "Романтик орой", line: "Болзоо, оройн зоогт: дулаан, ойр мэдрэгдэх.", href: "/fragrances?oc=date", pick: (l: Line) => l.occasions.includes("date") || l.occasions.includes("evening") },
    { id: "special", title: "Special Occasions", mn: "Онцгой үйл явдал", line: "Ёслол, үдэшлэгт: дурсамжинд үлдэх үнэр.", href: "/fragrances?oc=special", pick: (l: Line) => l.occasions.includes("special") },
    { id: "season", title: "Seasonal Favorites", mn: `${now.of} дуртай`, line: `Тайлбартаа «${now.name.toLowerCase()}» гэж бичигдсэн үнэрүүд.`, href: `/fragrances?se=${now.id}`, pick: (l: Line) => l.seasons.includes(now.id) && l.seasons.length < 4 },
  ].map((w) => {
    const list = ready.filter(w.pick).sort(byPopularity);
    return { ...w, count: list.length, pic: list[0] ? cover(list[0]) : null, top: list[0] };
  });
  const families = FAMILIES.map((f) => {
    const list = ready.filter((l) => l.families.includes(f.id));
    return { ...f, count: list.length, notes: topNotes(list, 3) };
  });
  const brandRibbon = brands.filter((b) => b.fragrances > 0).slice(0, 22);
  const featuredBrands = brands.filter((b) => b.fragrances > 0).slice(0, 6).map((b) => {
    const l = ready.filter((x) => x.brandSlug === b.slug).sort(byPopularity)[0];
    return { ...b, pic: l ? cover(l) : null };
  });
  const totalSkus = lines.reduce((n, l) => n + l.variants.length, 0);

  return (
    <>
      {/* 1 · Hero */}
      <Hero />

      {/* 2 · Featured luxury brands: black band, a slow ribbon of names, then a strip of houses */}
      <section id="brands" className="scroll-mt-24 bg-ink py-16 text-ivory md:py-24" aria-labelledby="brands-title">
        <div className="wrap flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-gold">Featured Luxury Brands</p>
            <h2 id="brands-title" className="serif mt-4 text-[40px] md:text-[64px]">
              {brands.length} брэнд, <em className="text-gold-2">нэг дор</em>
            </h2>
          </div>
          <Link href="/brands" className="link-arrow text-gold-2">
            Бүх брэнд <ArrowIcon size={15} />
          </Link>
        </div>
        <div className="marquee-wrap mt-12 overflow-hidden border-y border-ivory/10 py-6" aria-hidden>
          <div className="marquee">
            {[0, 1].map((k) => (
              <ul key={k} className="flex shrink-0 items-center">
                {brandRibbon.map((b) => (
                  <li key={b.slug} className="serif flex items-center px-7 text-[30px] whitespace-nowrap text-ivory/85 italic md:text-[40px]">
                    {b.name}
                    <span className="ml-14 text-[12px] text-gold not-italic">✦</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
        <ul className="wrap mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {featuredBrands.map((b, i) => (
            <Reveal as="li" key={b.slug} delay={i * 70}>
              <Link href={`/brands/${b.slug}`} className="group block">
                <span className="relative block aspect-[3/4] overflow-hidden bg-ivory">
                  {b.pic && <Image src={thumb(b.pic)} alt="" fill sizes="(min-width: 1024px) 15vw, 45vw" className="object-contain p-[14%] transition duration-1000 group-hover:scale-105" />}
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-4 pt-12">
                    <span className="serif block text-[22px] leading-tight text-ivory">{b.name}</span>
                    <span className="text-[11px] tracking-[0.14em] text-gold-2">{b.skus} бүтээгдэхүүн</span>
                  </span>
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* 3 · Best-selling: one fragrance large, the rest as a quiet column */}
      {lead && (
        <section className="wrap py-20 md:py-28" aria-labelledby="best-title">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="eyebrow text-gold-ink">Best-Selling Fragrances</p>
              <h2 id="best-title" className="serif mt-4 text-[40px] md:text-[64px]">
                Хамгийн их <em>захиалагдсан</em>
              </h2>
            </div>
            <p className="max-w-xs text-[12.5px] text-taupe-2">Zochil дэлгүүр дээрх баталгаажсан захиалгын тоогоор эрэмбэлэв.</p>
          </div>
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <Reveal>
              <Link href={`/p/${lead.slug}`} className="group grid h-full bg-beige-2 sm:grid-cols-[1.1fr_1fr]">
                <span className="stage relative aspect-[4/5] sm:aspect-auto">
                  {cover(lead) && <Image src={img(cover(lead)!)} alt={`${lead.brand} ${lead.title}`} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-contain p-[10%]" />}
                  <span className="serif absolute top-4 left-5 text-[64px] leading-none text-gold">01</span>
                </span>
                <span className="flex flex-col p-7 md:p-9">
                  <span className="eyebrow text-taupe-2">{lead.brand}</span>
                  <span className="serif mt-3 text-[36px] leading-[1.02]">{lead.title}</span>
                  {lead.notes && (
                    <span className="mt-6 space-y-2 text-[13px] text-ink-2">
                      <span className="block">
                        <b className="eyebrow mr-2 text-gold-ink">Эхлэл</b>
                        {lead.notes.top.join(", ")}
                      </span>
                      <span className="block">
                        <b className="eyebrow mr-2 text-gold-ink">Зүрх</b>
                        {lead.notes.heart.join(", ")}
                      </span>
                      <span className="block">
                        <b className="eyebrow mr-2 text-gold-ink">Суурь</b>
                        {lead.notes.base.join(", ")}
                      </span>
                    </span>
                  )}
                  <span className="mt-auto pt-8 text-[14px]">
                    {lead.variants.map((v) => v.label).join(" · ")}
                    <span className="mt-1 block serif text-[26px]">{formatPrice(leadVariant(lead).price)}-аас</span>
                  </span>
                  <span className="link-arrow mt-6">
                    Дэлгэрэнгүй <ArrowIcon size={15} />
                  </span>
                </span>
              </Link>
            </Reveal>
            <ol className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6">
              {rest.slice(0, 4).map((l, i) => (
                <Reveal as="li" key={l.slug} delay={i * 80}>
                  <ProductCard line={l} sizes="(min-width: 1024px) 22vw, 48vw" />
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* 4 · Find your signature scent: the quiz itself, on beige, with a tall title column */}
      <section className="bg-beige py-20 md:py-28" aria-labelledby="quiz-title">
        <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.6fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow text-gold-ink">Find Your Signature Scent</p>
            <h2 id="quiz-title" className="serif mt-4 text-[44px] leading-[0.98] md:text-[72px]">
              Таван асуулт.
              <br />
              <em>Нэг үнэр.</em>
            </h2>
            <p className="lede mt-6 max-w-sm">Сэтгэл төлөв, дуртай бүлэг, хэрэглэх үе, хүч, төсөв. Хариултаар тань манай цуглуулгаас үнэр санал болгоно.</p>
          </div>
          <div className="bg-ivory p-6 md:p-10">
            <ScentQuiz />
          </div>
        </div>
      </section>

      {/* 5 · Shop by fragrance family: seven tall tinted columns */}
      <section className="py-20 md:py-28" aria-labelledby="family-title">
        <div className="wrap">
          <p className="eyebrow text-gold-ink">Shop by Fragrance Family</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <h2 id="family-title" className="serif text-[40px] md:text-[64px]">
              Үнэрийн <em>бүлгүүд</em>
            </h2>
            <Link href="/notes" className="link-arrow">
              Нот судлах <ArrowIcon size={15} />
            </Link>
          </div>
        </div>
        <div className="wrap">
        <ul className="no-scrollbar -mx-4 mt-12 flex snap-x gap-2 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-7 md:overflow-visible md:px-0">
          {families.map((f, i) => (
            <Reveal as="li" key={f.id} delay={i * 60} className="w-[64vw] shrink-0 snap-start sm:w-[40vw] md:w-auto">
              <Link href={`/fragrances?f=${f.id}`} className="group flex aspect-[2/3.4] flex-col justify-between p-5 transition duration-700 hover:-translate-y-1.5" style={{ background: f.tone }}>
                <span className="text-[11px] tracking-[0.14em] text-ink-2 tabular-nums">{String(i + 1).padStart(2, "0")} · {f.count}</span>
                <span>
                  <span className="serif block text-[30px] leading-[1.02] md:text-[26px] xl:text-[30px]">{f.name}</span>
                  <span className="mt-1 block text-[11px] tracking-[0.14em] text-ink-2 uppercase">{f.en}</span>
                  {f.notes.length > 0 && <span className="mt-4 block border-t border-ink/15 pt-3 text-[12.5px] leading-snug text-ink-2">{f.notes.join(" · ")}</span>}
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
        </div>
      </section>

      {/* 6 · Mini perfumes & discovery sets: big statement left, horizontal shelf right */}
      <section className="overflow-hidden bg-paper py-20 md:py-28" aria-labelledby="disc-title">
        <div className="wrap grid gap-12 lg:grid-cols-[0.75fr_2fr] lg:gap-14">
          <div>
            <p className="eyebrow text-gold-ink">Mini Perfumes & Discovery Sets</p>
            <h2 id="disc-title" className="serif mt-4 text-[44px] leading-[0.98] md:text-[64px]">
              Discover First. <em className="text-gold-ink">Fall in Love Later.</em>
            </h2>
            <p className="lede mt-6">Эхлээд мини эсвэл vial-аар туршаад, дурласан үнэрээ бүтэн савтай нь аваарай.</p>
            <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6">
              <div>
                <dt className="text-[11px] tracking-[0.14em] text-taupe-2 uppercase">Мини, vial</dt>
                <dd className="serif mt-1 text-[34px] tabular-nums">{discovery.length}</dd>
              </div>
              <div>
                <dt className="text-[11px] tracking-[0.14em] text-taupe-2 uppercase">Эхлэх үнэ</dt>
                <dd className="serif mt-1 text-[34px] tabular-nums">{formatPrice(Math.min(...discovery.map((l) => l.minPrice)))}</dd>
              </div>
            </dl>
            <Link href="/discovery" className="btn btn-ink mt-8">
              Discovery тавиур <ArrowIcon size={15} />
            </Link>
          </div>
          <ul className="no-scrollbar -mr-4 flex snap-x gap-4 overflow-x-auto pr-4 pb-2 md:-mr-11 md:gap-6 md:pr-11">
            {[...sets.slice(0, 3), ...discovery.filter((l) => !l.kinds.includes("set")).slice(0, 7)].map((l) => (
              <li key={l.slug} className="w-[58vw] shrink-0 snap-start sm:w-[36vw] lg:w-[17vw]">
                <ProductCard line={l} tall sizes="(min-width: 1024px) 17vw, 58vw" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 7 · Luxury gift finder: dark, centred, four doors */}
      <section className="relative isolate overflow-hidden bg-ink py-20 text-ivory md:py-28" aria-labelledby="gift-title">
        <div className="absolute top-1/2 left-1/2 -z-10 h-[140%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(198,167,125,0.22),transparent)]" aria-hidden />
        <div className="wrap text-center">
          <GiftIcon size={30} className="mx-auto text-gold" />
          <p className="eyebrow mt-6 text-gold">Luxury Gift Finder</p>
          <h2 id="gift-title" className="serif mx-auto mt-4 max-w-3xl text-[44px] leading-[1] md:text-[76px]">
            Хэнд бэлэг <em className="text-gold-2">барих</em> вэ?
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[15px] text-ivory/70">Хэнд, ямар үеэр, ямар хэв маяг, төсөв: дөрвөн сонголтоор бэлгээ олоорой.</p>
          <ul className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["her", "Түүнд", "эмэгтэй"],
              ["him", "Түүнд", "эрэгтэй"],
              ["anyone", "Хэнд ч", "unisex"],
              ["me", "Өөртөө", "яагаад болохгүй гэж"],
            ].map(([id, a, b]) => (
              <li key={id}>
                <Link href={`/gift-finder?who=${id}`} className="group flex aspect-[4/3] flex-col items-center justify-center border border-ivory/20 transition duration-500 hover:border-gold hover:bg-ivory/5">
                  <span className="serif text-[30px]">{a}</span>
                  <span className="mt-1 text-[11px] tracking-[0.16em] text-gold-2 uppercase">{b}</span>
                </Link>
              </li>
            ))}
          </ul>
          {sets.length > 0 && (
            <p className="mt-10 text-[13.5px] text-ivory/60">
              Бэлэн бэлгийн багц: {sets.length} ·{" "}
              <Link href="/fragrances?k=set" className="underline underline-offset-4 hover:text-gold-2">
                харах
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* 8 · The fragrance wardrobe: an editorial index, a photo follows the row you point at */}
      <section id="wardrobe" className="wrap scroll-mt-24 py-20 md:py-28" aria-labelledby="wardrobe-title">
        <div className="grid gap-4 md:grid-cols-[1fr_1fr] md:items-end">
          <div>
            <p className="eyebrow text-gold-ink">The Fragrance Wardrobe</p>
            <h2 id="wardrobe-title" className="serif mt-4 text-[40px] md:text-[64px]">
              Үнэрийн <em>шүүгээ</em>
            </h2>
          </div>
          <p className="lede max-w-md md:justify-self-end">Хувцас шиг, үнэр ч үе үеэрээ өөр. Тайлбартаа тухайн үед тохиромжтой гэж бичигдсэн үнэрүүд.</p>
        </div>
        <ol className="mt-12 border-t border-ink">
          {wardrobe.map((w, i) => (
            <li key={w.id} className="group relative border-b border-line">
              <Link href={w.href} className="grid grid-cols-[44px_1fr_auto] items-center gap-4 py-6 md:grid-cols-[80px_1.2fr_1fr_120px_40px] md:gap-8 md:py-8">
                <span className="serif text-[22px] text-gold md:text-[28px]">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="serif block text-[28px] leading-tight transition duration-500 group-hover:translate-x-2 md:text-[42px]">{w.title}</span>
                  <span className="text-[13px] text-taupe-2">{w.mn}</span>
                </span>
                <span className="hidden text-[14px] text-ink-2 md:block">{w.line}</span>
                <span className="text-[12px] tracking-[0.1em] text-taupe-2 tabular-nums md:text-right">{w.count} үнэр</span>
                <ArrowIcon size={18} className="hidden transition duration-500 group-hover:translate-x-1.5 md:block" />
              </Link>
              {w.pic && (
                <span className="pointer-events-none absolute top-1/2 right-[12%] z-10 hidden h-44 w-36 -translate-y-1/2 rotate-3 bg-white opacity-0 shadow-2xl transition duration-500 group-hover:rotate-0 group-hover:opacity-100 lg:block" aria-hidden>
                  <Image src={thumb(w.pic)} alt="" fill sizes="144px" className="object-contain p-3" />
                </span>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* 9 · Brand story: split, words left, facts right */}
      <section className="bg-beige-2" aria-labelledby="story-title">
        <div className="wrap grid gap-14 py-20 md:py-28 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
          <div>
            <p className="eyebrow text-gold-ink">Our Story</p>
            <h2 id="story-title" className="serif mt-4 text-[44px] leading-[1] md:text-[72px]">
              Discover the Luxury
              <br />
              <em>&amp; Try the Experience</em>
            </h2>
            <p className="lede mt-8 max-w-xl">
              tryLuxé нэг энгийн санаанаас эхэлсэн: тансаг үнэртэй усыг бүтэн савтай нь авахаасаа өмнө туршиж болдог байх ёстой. Тиймээс бид дэлхийн брэндүүдийн оригинал мини, vial-ыг
              Улаанбаатарт бэлэн байлгаж, бүтэн савыг брэндийн бутик, duty free-ээс захиалж авчирдаг.
            </p>
            <Link href="/story" className="link-arrow mt-8">
              Бидний түүх <ArrowIcon size={15} />
            </Link>
          </div>
          <dl className="grid grid-cols-2 content-start gap-px bg-line">
            {[
              [String(brands.length), "брэнд"],
              [String(totalSkus), "бүтээгдэхүүн"],
              ["24–48", "цагт бэлэн бараа"],
              ["7–9", "хоногт урьдчилсан захиалга"],
            ].map(([n, t]) => (
              <div key={t} className="bg-beige-2 p-6 md:p-8">
                <dt className="sr-only">{t}</dt>
                <dd>
                  <span className="serif block text-[48px] leading-none tabular-nums md:text-[60px]">{n}</span>
                  <span className="mt-2 block text-[12px] tracking-[0.12em] text-taupe-2 uppercase">{t}</span>
                </dd>
              </div>
            ))}
            <div className="col-span-2 bg-ink p-6 text-[13.5px] leading-relaxed text-ivory/80 md:p-8">{business.faq[0].a}</div>
          </dl>
        </div>
      </section>
      {/* 10 · Newsletter & footer: in the layout */}
    </>
  );
}
