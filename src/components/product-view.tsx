"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cart, maxQty } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { CheckIcon, MinusIcon, PlusIcon } from "./icons";
import { WishButton } from "./card-actions";

export type ViewVariant = { id: number; label: string; price: number; compareAt: number | null; stock: number | null; preorder: boolean; images: string[] };

const soldOut = (v: ViewVariant) => !v.preorder && v.stock === 0;
const large = (n: string) => `/images/p/${n}.webp`;
const small = (n: string) => `/images/p/${n}-t.webp`;

function status(v: ViewVariant) {
  if (soldOut(v)) return { text: "Энэ хэмжээ дууссан", tone: "text-taupe-2" };
  if (v.preorder) return { text: "Урьдчилсан захиалга · захиалга баталгаажсанаас 7–9 хоногт хүргэнэ", tone: "text-ink" };
  if (v.stock != null && v.stock <= 3) return { text: `Бэлэн · сүүлийн ${v.stock} ширхэг · 24–48 цагт хүргэнэ`, tone: "text-wine" };
  return { text: "Бэлэн · 24–48 цагт хүргэнэ", tone: "text-ink" };
}

/** Gallery + size picker + add to cart. Photos follow the chosen size. The server-rendered details come in as children. */
export function ProductView({ slug, brand, brandSlug, title, subtitle, variants, children }: { slug: string; brand: string | null; brandSlug: string | null; title: string; subtitle: string | null; variants: ViewVariant[]; children: React.ReactNode }) {
  const initial = variants.find((v) => !v.preorder && !soldOut(v)) ?? variants.find((v) => !soldOut(v)) ?? variants[0];
  const [id, setId] = useState(initial.id);
  const [shot, setShot] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);
  const v = variants.find((x) => x.id === id) ?? initial;
  const photos = v.images.length ? v.images : (variants.find((x) => x.images.length)?.images ?? []);
  const cap = maxQty(v.id);
  const st = status(v);

  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    // shown once the main add-to-cart block has scrolled above the viewport
    const update = () => setShowBar(el.getBoundingClientRect().bottom < 0);
    const io = new IntersectionObserver(update, { threshold: 0 });
    io.observe(el);
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", update);
    };
  }, []);

  const pick = (x: ViewVariant) => {
    setId(x.id);
    setShot(0);
    setQty(1);
    setAdded(false);
  };
  const add = () => {
    cart.add(v.id, qty);
    setAdded(true);
  };
  const cta = v.preorder ? "Урьдчилан захиалах" : "Сагсанд нэмэх";

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="grid gap-3 md:grid-cols-[76px_1fr]">
            <div className="stage relative aspect-square md:order-2">
              {photos[shot] && <Image key={photos[shot]} src={large(photos[shot])} alt={`${brand ?? ""} ${title} ${v.label}`} fill priority sizes="(min-width: 1024px) 52vw, 100vw" className="pop-in object-contain p-[8%]" />}
            </div>
            {photos.length > 1 && (
              <ul className="no-scrollbar flex gap-2 overflow-x-auto md:order-1 md:flex-col" aria-label="Зургууд">
                {photos.map((p, i) => (
                  <li key={p} className="shrink-0">
                    <button type="button" onClick={() => setShot(i)} aria-label={`Зураг ${i + 1}`} aria-current={i === shot} className="stage relative block h-[72px] w-[72px] border border-transparent aria-[current=true]:border-ink">
                      <Image src={small(p)} alt="" fill sizes="72px" className="object-contain p-1.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          {brand && brandSlug && (
            <Link href={`/brands/${brandSlug}`} className="eyebrow text-gold-ink hover:text-ink">
              {brand}
            </Link>
          )}
          <h1 className="serif mt-3 text-[42px] leading-[1.02] md:text-[60px]">{title}</h1>
          {subtitle && <p className="mt-3 text-[13px] tracking-[0.06em] text-taupe-2">{subtitle}</p>}

          <div ref={buyRef} className="mt-8 border-y border-line py-7">
            <p className="flex items-baseline gap-3">
              <span className="serif text-[38px] tabular-nums">{formatPrice(v.price)}</span>
              {v.compareAt && (
                <>
                  <s className="text-taupe-2 tabular-nums">{formatPrice(v.compareAt)}</s>
                  <span className="bg-gold px-2 py-0.5 text-[11px] font-semibold">−{Math.round((1 - v.price / v.compareAt) * 100)}%</span>
                </>
              )}
            </p>
            <p className="label mt-6">Хэмжээ</p>
            <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Хэмжээ">
              {variants.map((x) => (
                <button key={x.id} type="button" role="radio" aria-checked={x.id === v.id} onClick={() => pick(x)} className={`chip min-h-[46px] flex-col items-start gap-0 px-4 leading-tight ${soldOut(x) ? "opacity-55" : ""}`}>
                  <span className="text-[14px] font-semibold">{x.label}</span>
                  <span className="text-[11.5px] opacity-75 tabular-nums">{soldOut(x) ? "Дууссан" : `${formatPrice(x.price)}${x.preorder ? " · захиалгаар" : ""}`}</span>
                </button>
              ))}
            </div>
            <p className={`mt-5 text-[13.5px] ${st.tone}`} role="status">
              {st.text}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <div className="flex h-[50px] items-center border border-line">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid h-full w-11 place-items-center" aria-label="Цөөлөх" disabled={qty <= 1}>
                  <MinusIcon size={14} />
                </button>
                <span className="w-8 text-center tabular-nums" aria-live="polite">
                  {qty}
                </span>
                <button type="button" onClick={() => setQty((q) => Math.min(cap, q + 1))} className="grid h-full w-11 place-items-center disabled:opacity-30" aria-label="Нэмэх" disabled={qty >= cap}>
                  <PlusIcon size={14} />
                </button>
              </div>
              <button type="button" onClick={add} disabled={cap <= 0} className="btn btn-ink min-w-[200px] flex-1">
                {added ? (
                  <>
                    <CheckIcon size={16} /> Сагсанд нэмлээ
                  </>
                ) : cap <= 0 ? (
                  "Дууссан"
                ) : (
                  cta
                )}
              </button>
              <WishButton slug={slug} name={`${brand ?? ""} ${title}`} className="h-[50px] w-[50px] rounded-none border border-line" />
            </div>
            {added && (
              <Link href="/cart" className="link-arrow mt-4 text-gold-ink">
                Сагс руу очих →
              </Link>
            )}
          </div>
          {children}
        </div>
      </div>

      {/* mobile: price + add to cart stay at hand once the main button scrolls away */}
      <div className={`fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ivory/95 px-4 py-3 backdrop-blur transition duration-500 lg:hidden ${showBar ? "translate-y-0" : "translate-y-full"}`} aria-hidden={!showBar}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold">
              {title} · {v.label}
            </p>
            <p className="text-[13px] text-ink-2 tabular-nums">{formatPrice(v.price)}</p>
          </div>
          <button type="button" onClick={add} disabled={cap <= 0} tabIndex={showBar ? 0 : -1} className="btn btn-ink h-12 px-5">
            {added ? "Нэмлээ ✓" : cap <= 0 ? "Дууссан" : v.preorder ? "Захиалах" : "Сагсанд"}
          </button>
        </div>
      </div>
    </>
  );
}

