"use client";

import { useState } from "react";
import { useWishlist, wishlist } from "@/lib/wishlist";
import { EyeIcon, HeartIcon } from "./icons";
import { QuickView } from "./quick-view";

export function WishButton({ slug, name, className = "" }: { slug: string; name: string; className?: string }) {
  const saved = useWishlist().includes(slug);
  return (
    <button
      type="button"
      onClick={() => wishlist.toggle(slug)}
      aria-pressed={saved}
      aria-label={saved ? `${name}: хадгалснаас хасах` : `${name}: хадгалах`}
      className={`grid h-9 w-9 place-items-center rounded-full bg-ivory/90 transition hover:bg-ivory ${saved ? "text-wine" : "text-ink"} ${className}`}
    >
      <HeartIcon size={17} filled={saved} />
    </button>
  );
}

/** Heart (top right) and Quick View (slides up on hover, always visible on touch screens). */
export function CardActions({ slug, name }: { slug: string; name: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <WishButton slug={slug} name={name} className="absolute top-2.5 right-2.5" />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute inset-x-3 bottom-3 flex h-10 items-center justify-center gap-2 bg-ink/90 text-[10.5px] font-semibold tracking-[0.18em] text-ivory uppercase transition duration-500 hover:bg-ink md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-visible:translate-y-0 md:focus-visible:opacity-100"
        aria-label={`${name}: хурдан харах`}
      >
        <EyeIcon size={15} /> Хурдан харах
      </button>
      {open && <QuickView slug={slug} onClose={() => setOpen(false)} />}
    </>
  );
}
