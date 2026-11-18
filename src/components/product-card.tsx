import Image from "next/image";
import Link from "next/link";
import { cover, leadVariant, soldOut, thumb, type Line } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { kindName } from "@/lib/labels";
import { CardActions } from "./card-actions";

/** Availability in words, only from Zochil stock (pre-orders have none). */
export function availability(l: Line) {
  const now = l.variants.filter((v) => !v.preorder && !soldOut(v));
  if (now.length) {
    const counted = now.filter((v) => v.stock != null);
    const total = counted.reduce((n, v) => n + (v.stock ?? 0), 0);
    if (counted.length === now.length && total > 0 && total <= 2) return { tone: "low", text: `Сүүлийн ${total}` } as const;
    return { tone: "ok", text: "Бэлэн" } as const;
  }
  if (l.variants.some((v) => v.preorder)) return { tone: "pre", text: "Урьдчилсан захиалга" } as const;
  return { tone: "out", text: "Дууссан" } as const;
}

export function sizesText(l: Line) {
  const sizes = [...new Set(l.variants.map((v) => v.size ?? (v.preorder ? "Бүтэн" : null)).filter(Boolean))];
  const conc = l.conc && !["Нэг хэмжээ"].includes(l.conc) ? l.conc : null;
  return [sizes.slice(0, 3).join(" · ") + (sizes.length > 3 ? ` +${sizes.length - 3}` : ""), conc].filter(Boolean).join("  |  ");
}

export function ProductCard({ line, priority = false, sizes = "(min-width: 1024px) 23vw, (min-width: 640px) 31vw, 48vw", tall = false }: { line: Line; priority?: boolean; sizes?: string; tall?: boolean }) {
  const pic = cover(line);
  const lead = leadVariant(line);
  const av = availability(line);
  const many = line.variants.length > 1 && line.minPrice !== line.maxPrice;
  return (
    <article className="group relative flex flex-col">
      <div className={`stage ${tall ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
        <Link href={`/p/${line.slug}`} className="absolute inset-0" aria-label={`${line.brand ?? ""} ${line.title}`}>
          {pic && <Image src={thumb(pic)} alt={`${line.brand ?? ""} ${line.title}`} fill sizes={sizes} priority={priority} className="object-contain p-[9%]" />}
        </Link>
        <span
          className={`pointer-events-none absolute top-3 left-3 px-2 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase ${
            av.tone === "out" ? "bg-beige text-taupe-2" : av.tone === "pre" ? "bg-ink text-ivory" : av.tone === "low" ? "bg-wine text-ivory" : "bg-ivory/90 text-ink"
          }`}
        >
          {av.text}
        </span>
        {lead.compareAt && <span className="pointer-events-none absolute top-3 right-12 bg-gold px-2 py-1 text-[10px] font-semibold tracking-[0.14em] text-ink uppercase">−{Math.round((1 - lead.price / lead.compareAt) * 100)}%</span>}
        <CardActions slug={line.slug} name={`${line.brand ?? ""} ${line.title}`} />
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <p className="eyebrow text-taupe-2">{line.brand ?? kindName(line.kind)}</p>
        <h3 className="serif mt-1.5 text-[20px] leading-[1.15] md:text-[21px]">
          <Link href={`/p/${line.slug}`} className="hover:text-gold-ink">
            {line.title}
          </Link>
        </h3>
        <p className="mt-1.5 text-[12px] tracking-[0.04em] text-taupe-2">{sizesText(line)}</p>
        <p className="mt-auto pt-2.5 text-[14px] tabular-nums">
          {many && <span className="text-taupe-2">{formatPrice(line.minPrice)}-аас</span>}
          {!many && (
            <>
              {formatPrice(lead.price)}
              {lead.compareAt && <s className="ml-2 text-taupe-2">{formatPrice(lead.compareAt)}</s>}
            </>
          )}
        </p>
      </div>
    </article>
  );
}
