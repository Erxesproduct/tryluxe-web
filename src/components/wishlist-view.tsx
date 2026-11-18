"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { getLiteLine, thumbSrc } from "@/lib/lite";
import { useWishlist, wishlist } from "@/lib/wishlist";
import { CloseIcon, HeartIcon } from "./icons";

export function WishlistView() {
  const saved = useWishlist()
    .map(getLiteLine)
    .filter((l): l is NonNullable<typeof l> => !!l);
  if (!saved.length)
    return (
      <div className="mx-auto max-w-lg bg-paper px-8 py-16 text-center">
        <HeartIcon size={30} className="mx-auto text-gold-ink" />
        <p className="serif mt-5 text-[34px]">Хадгалсан зүйл алга</p>
        <p className="mt-2 text-ink-2">Таалагдсан үнэрийнхээ зүрхэн дээр дарж хадгалаарай. Энэ төхөөрөмж дээр хадгалагдана.</p>
        <Link href="/fragrances" className="btn btn-ink mt-8">
          Үнэртэй ус үзэх
        </Link>
      </div>
    );
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 md:gap-x-6">
      {saved.map((l) => (
        <li key={l.s} className="group relative">
          <Link href={`/p/${l.s}`} className="stage relative block aspect-[4/5]">
            {l.t && <Image src={thumbSrc(l.t)!} alt={`${l.b ?? ""} ${l.n}`} fill sizes="(min-width: 1024px) 23vw, 48vw" className="object-contain p-[9%]" />}
          </Link>
          <button type="button" onClick={() => wishlist.remove(l.s)} className="absolute top-2.5 right-2.5 grid h-9 w-9 place-items-center rounded-full bg-ivory/90" aria-label={`${l.n}: хасах`}>
            <CloseIcon size={16} />
          </button>
          <p className="eyebrow mt-4 text-taupe-2">{l.b}</p>
          <Link href={`/p/${l.s}`} className="serif mt-1 block text-[20px] leading-tight hover:text-gold-ink">
            {l.n}
          </Link>
          <p className="mt-2 text-[14px] tabular-nums">
            {l.p !== l.q ? `${formatPrice(l.p)}-аас` : formatPrice(l.p)} {!l.a && <span className="text-taupe-2">· Дууссан</span>}
          </p>
        </li>
      ))}
    </ul>
  );
}
