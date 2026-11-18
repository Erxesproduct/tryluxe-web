import Image from "next/image";
import Link from "next/link";
import { business } from "@/content/business";
import { brands, cover, fragrances, thumb } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { FAMILIES } from "@/lib/labels";
import { HeaderShell } from "./header-shell";
import { HeaderTools, MobileMenu } from "./header-tools";
import { ChevronIcon } from "./icons";
import { Wordmark } from "./wordmark";

export const NAV = [
  { href: "/", label: "Нүүр" },
  { href: "/fragrances", label: "Үнэртэй ус", mega: "fragrances" },
  { href: "/brands", label: "Брэндүүд", mega: "brands" },
  { href: "/discovery", label: "Discovery багц" },
  { href: "/gift-finder", label: "Бэлэг сонгох" },
  { href: "/story", label: "Бидний түүх" },
] as const;

const EXTRA = [
  { href: "/scent-finder", label: "Өөрийн үнэрийг олох (5 асуулт)" },
  { href: "/notes", label: "Үнэрийн нот" },
  { href: "/wishlist", label: "Хадгалсан" },
  { href: "/track", label: "Захиалга шалгах" },
  { href: "/account", label: "Миний бүртгэл" },
];

function FragrancePanel() {
  // the fragrance with the most verified orders on Zochil
  const spotlight = [...fragrances].filter((l) => l.readyNow).sort((x, y) => y.orders - x.orders)[0];
  const pic = spotlight ? cover(spotlight) : null;
  const col = "eyebrow mb-4 text-taupe-2";
  const a = "link-u text-[14.5px]";
  return (
    <div className="wrap grid grid-cols-[1fr_1fr_1fr_1.1fr] gap-10 py-10">
      <div>
        <p className={col}>Төрөл</p>
        <ul className="space-y-2.5">
          <li><Link className={a} href="/fragrances?k=full">Бүтэн хэмжээ</Link></li>
          <li><Link className={a} href="/fragrances?k=mini">Мини үнэртэй ус</Link></li>
          <li><Link className={a} href="/fragrances?k=vial">Vial тестер</Link></li>
          <li><Link className={a} href="/discovery">Discovery, бэлгийн багц</Link></li>
          <li><Link className={a} href="/fragrances?pre=1">Урьдчилсан захиалга</Link></li>
          <li><Link className={a} href="/fragrances?t=all">Бүх бүтээгдэхүүн (будаг, арчилгаа)</Link></li>
        </ul>
      </div>
      <div>
        <p className={col}>Үнэрийн бүлэг</p>
        <ul className="space-y-2.5">
          {FAMILIES.map((f) => (
            <li key={f.id}>
              <Link className={a} href={`/fragrances?f=${f.id}`}>
                {f.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className={col}>Хэнд</p>
        <ul className="space-y-2.5">
          <li><Link className={a} href="/fragrances?g=women">Эмэгтэй</Link></li>
          <li><Link className={a} href="/fragrances?g=men">Эрэгтэй</Link></li>
        </ul>
        <p className={`${col} mt-8`}>Туслах</p>
        <ul className="space-y-2.5">
          <li><Link className={a} href="/scent-finder">Өөрийн үнэрийг олох</Link></li>
          <li><Link className={a} href="/notes">Нот судлах</Link></li>
        </ul>
      </div>
      {spotlight && pic && (
        <Link href={`/p/${spotlight.slug}`} className="group grid grid-cols-[120px_1fr] items-center gap-5 bg-paper p-5">
          <span className="stage relative aspect-square">
            <Image src={thumb(pic)} alt="" fill sizes="120px" className="object-contain p-2" />
          </span>
          <span>
            <span className="eyebrow block text-gold-ink">Хамгийн их захиалагдсан</span>
            <span className="serif mt-2 block text-[24px] leading-tight">{spotlight.brand} {spotlight.title}</span>
            <span className="mt-1 block text-[13px] text-ink-2">{formatPrice(spotlight.minPrice)}-аас</span>
          </span>
        </Link>
      )}
    </div>
  );
}

function BrandPanel() {
  const top = brands.filter((b) => b.fragrances > 0).slice(0, 24);
  return (
    <div className="wrap py-10">
      <ul className="grid grid-cols-4 gap-x-10 gap-y-2.5">
        {top.map((b) => (
          <li key={b.slug} className="flex items-baseline justify-between gap-3 border-b border-line/70 pb-2">
            <Link href={`/brands/${b.slug}`} className="serif text-[19px] hover:text-gold-ink">
              {b.name}
            </Link>
            <span className="text-[11.5px] text-taupe-2 tabular-nums">{b.skus}</span>
          </li>
        ))}
      </ul>
      <Link href="/brands" className="link-arrow mt-7">
        Бүх {brands.length} брэнд →
      </Link>
    </div>
  );
}

export function Header() {
  return (
    <HeaderShell>
      <div className="bg-ink text-ivory">
        <p className="wrap py-2 text-center text-[11px] tracking-[0.1em] sm:text-[11.5px] sm:tracking-[0.12em]">
          <span className="hidden sm:inline">Улаанбаатарт {formatPrice(business.cityFee)} · {formatPrice(business.freeFrom)}-өөс дээш захиалгад хүргэлт үнэгүй</span>
          <span className="sm:hidden">УБ-т хүргэлт {formatPrice(business.cityFee)} · {formatPrice(business.freeFrom)}-өөс үнэгүй</span>
        </p>
      </div>
      <div className="wrap flex h-[68px] items-center gap-3 lg:h-[78px]">
        <div className="flex flex-1 items-center gap-1 lg:hidden">
          <MobileMenu links={NAV.map(({ href, label }) => ({ href, label }))} extra={EXTRA} />
        </div>
        <Link href="/" className="shrink-0 text-[30px] lg:text-[34px]" aria-label="tryLuxé, нүүр хуудас">
          <Wordmark />
        </Link>
        <nav className="hidden flex-1 justify-center lg:flex" aria-label="Үндсэн цэс">
          <ul className="flex items-center gap-7 xl:gap-9">
            {NAV.map((n) => (
              <li key={n.href} className={"mega" in n ? "mega-item" : ""}>
                <Link href={n.href} className="inline-flex h-[78px] items-center gap-1 text-[12px] font-semibold tracking-[0.16em] uppercase transition hover:text-gold-ink">
                  {n.label}
                  {"mega" in n && <ChevronIcon size={13} className="opacity-60" />}
                </Link>
                {"mega" in n && (
                  <div className="mega absolute inset-x-0 top-full border-t border-line bg-ivory shadow-[0_30px_50px_-30px_rgba(23,23,23,0.25)]">
                    {n.mega === "fragrances" ? <FragrancePanel /> : <BrandPanel />}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-1 justify-end lg:flex-none">
          <HeaderTools />
        </div>
      </div>
    </HeaderShell>
  );
}
