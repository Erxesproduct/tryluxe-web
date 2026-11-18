"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cart, maxQty } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { familyName, intensityName, kindName } from "@/lib/labels";
import { getLiteLine, isSoldOut, largeSrc, variantsOf } from "@/lib/lite";
import { ArrowIcon, CheckIcon, CloseIcon } from "./icons";
import { WishButton } from "./card-actions";

export function QuickView({ slug, onClose }: { slug: string; onClose: () => void }) {
  const line = getLiteLine(slug);
  const variants = variantsOf(slug);
  const first = variants.find((v) => !v.r && !isSoldOut(v)) ?? variants.find((v) => !isSoldOut(v)) ?? variants[0];
  const [id, setId] = useState(first?.i);
  const [added, setAdded] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  if (!line || !first) return null;
  const v = variants.find((x) => x.i === id) ?? first;
  const out = isSoldOut(v);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="pop-in m-auto max-h-[92dvh] w-[min(940px,94vw)] overflow-y-auto bg-ivory p-0 text-ink"
      aria-label={`${line.b ?? ""} ${line.n}`}
    >
      <div className="grid md:grid-cols-[1fr_1.05fr]">
        <div className="stage relative aspect-square md:aspect-auto md:min-h-[520px]">
          {v.t && <Image src={largeSrc(v.t)!} alt={`${line.b ?? ""} ${line.n} ${v.z}`} fill sizes="(min-width: 768px) 460px, 94vw" className="object-contain p-[10%]" />}
        </div>
        <div className="relative flex flex-col p-6 md:p-10">
          <button type="button" onClick={onClose} className="absolute top-3 right-3 grid h-10 w-10 place-items-center" aria-label="Хаах" autoFocus>
            <CloseIcon size={20} />
          </button>
          <p className="eyebrow text-taupe-2">{line.b ?? kindName(line.k)}</p>
          <h2 className="serif mt-2 pr-10 text-[34px] leading-[1.05]">{line.n}</h2>
          {(line.f.length > 0 || line.i) && (
            <p className="mt-3 text-[12.5px] tracking-[0.06em] text-taupe-2">{[line.f.map(familyName).join(", "), line.i && `${intensityName(line.i)} (${line.c})`].filter(Boolean).join(" · ")}</p>
          )}
          {line.nt && (
            <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-line py-4 text-[13px]">
              {(["Эхлэл", "Зүрх", "Суурь"] as const).map((t, i) => (
                <div key={t}>
                  <dt className="eyebrow text-gold-ink">{t}</dt>
                  <dd className="mt-1.5 leading-snug text-ink-2">{line.nt![i].join(", ") || "—"}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="label mt-6">Хэмжээ</p>
          <div className="mt-2.5 flex flex-wrap gap-2" role="radiogroup" aria-label="Хэмжээ">
            {variants.map((x) => (
              <button key={x.i} type="button" role="radio" aria-checked={x.i === v.i} onClick={() => (setId(x.i), setAdded(false))} className={`chip ${isSoldOut(x) ? "text-taupe line-through" : ""}`}>
                {x.z}
              </button>
            ))}
          </div>
          <p className="mt-6 flex items-baseline gap-3">
            <span className="serif text-[32px] tabular-nums">{formatPrice(v.p)}</span>
            {v.o && <s className="text-taupe-2">{formatPrice(v.o)}</s>}
          </p>
          <p className="mt-1 text-[13px] text-ink-2">{out ? "Энэ хэмжээ дууссан" : v.r ? "Урьдчилсан захиалга · 7–9 хоногт ирнэ" : v.k != null && v.k <= 3 ? `Бэлэн · сүүлийн ${v.k}` : "Бэлэн · 24–48 цагт хүргэнэ"}</p>
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              disabled={out || maxQty(v.i) <= 0}
              onClick={() => {
                cart.add(v.i);
                setAdded(true);
              }}
              className="btn btn-ink flex-1"
            >
              {added ? (
                <>
                  <CheckIcon size={16} /> Сагсанд нэмлээ
                </>
              ) : v.r ? (
                "Урьдчилан захиалах"
              ) : (
                "Сагсанд нэмэх"
              )}
            </button>
            <WishButton slug={line.s} name={line.n} className="h-[50px] w-[50px] rounded-none border border-line" />
          </div>
          <div className="mt-auto flex flex-wrap gap-x-6 gap-y-2 pt-7">
            <Link href={`/p/${line.s}`} className="link-arrow" onClick={onClose}>
              Дэлгэрэнгүй <ArrowIcon size={15} />
            </Link>
            {added && (
              <Link href="/cart" className="link-arrow text-gold-ink" onClick={onClose}>
                Сагс руу <ArrowIcon size={15} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
