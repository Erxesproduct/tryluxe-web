"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { thumbSrc } from "@/lib/lite";
import type { Pick } from "@/lib/recommend";
import { ArrowIcon } from "./icons";

/** A recommended fragrance: image, brand, name, notes, price, details button. */
export function PickCard({ pick, index, dark = false }: { pick: Pick; index: number; dark?: boolean }) {
  const l = pick.line;
  const notes = l.nt ? [...l.nt[0], ...l.nt[1], ...l.nt[2]].slice(0, 5) : [];
  return (
    <article className="pop-in group flex flex-col" style={{ animationDelay: `${index * 90}ms` }}>
      <Link href={`/p/${l.s}`} className="stage relative block aspect-[4/5]">
        {l.t && <Image src={thumbSrc(l.t)!} alt={`${l.b ?? ""} ${l.n}`} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-contain p-[10%]" />}
        <span className="absolute top-3 left-3 bg-ink px-2 py-1 text-[10px] font-semibold tracking-[0.14em] text-ivory">№ {index + 1}</span>
      </Link>
      <p className={`eyebrow mt-4 ${dark ? "text-gold" : "text-taupe-2"}`}>{l.b}</p>
      <h3 className="serif mt-1 text-[21px] leading-tight">{l.n}</h3>
      {notes.length > 0 && <p className={`mt-2 text-[12.5px] leading-snug ${dark ? "text-ivory/65" : "text-ink-2"}`}>{notes.join(" · ")}</p>}
      {pick.reasons.length > 0 && <p className={`mt-2 text-[11.5px] tracking-[0.04em] ${dark ? "text-gold-2" : "text-gold-ink"}`}>Таарсан: {pick.reasons.join(", ")}</p>}
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span className="text-[14px] tabular-nums">
          {formatPrice(pick.price)} <span className={dark ? "text-ivory/55" : "text-taupe-2"}>· {pick.variantLabel}</span>
        </span>
        <Link href={`/p/${l.s}`} className="link-arrow text-[10.5px]" aria-label={`${l.b ?? ""} ${l.n}: дэлгэрэнгүй`}>
          Дэлгэрэнгүй <ArrowIcon size={14} />
        </Link>
      </div>
    </article>
  );
}
