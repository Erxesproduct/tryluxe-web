"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { cartCount, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { kindName } from "@/lib/labels";
import { liteLines, thumbSrc } from "@/lib/lite";
import { useWishlist } from "@/lib/wishlist";
import { ArrowIcon, BasketIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from "./icons";
import { Wordmark } from "./wordmark";

const Badge = ({ n }: { n: number }) =>
  n > 0 ? <span className="absolute -top-1 -right-1.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-ink px-1 text-[10px] leading-none font-semibold text-ivory tabular-nums">{n}</span> : null;

export function HeaderTools() {
  const items = useCart();
  const saved = useWishlist();
  const [searchOpen, setSearchOpen] = useState(false);
  const [bump, setBump] = useState(false);
  useEffect(() => {
    const on = () => {
      setBump(true);
      window.setTimeout(() => setBump(false), 700);
    };
    window.addEventListener("tryluxe:added", on);
    return () => window.removeEventListener("tryluxe:added", on);
  }, []);
  const n = cartCount(items);
  const icon = "relative grid h-10 w-10 place-items-center transition hover:text-gold-ink";
  return (
    <div className="flex items-center gap-0.5 md:gap-1.5">
      <button type="button" onClick={() => setSearchOpen(true)} className={icon} aria-label="Хайх">
        <SearchIcon size={20} />
      </button>
      <Link href="/account" className={`${icon} hidden sm:grid`} aria-label="Миний бүртгэл">
        <UserIcon size={20} />
      </Link>
      <Link href="/wishlist" className={icon} aria-label={`Хадгалсан (${saved.length})`}>
        <HeartIcon size={20} />
        <Badge n={saved.length} />
      </Link>
      <Link href="/cart" className={`${icon} ${bump ? "scale-110 text-gold-ink" : ""}`} aria-label={`Сагс (${n})`}>
        <BasketIcon size={21} />
        <Badge n={n} />
      </Link>
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </div>
  );
}

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");
}

export function searchLines(q: string, limit = 8) {
  const words = norm(q).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return liteLines
    .map((l) => {
      const hay = norm(`${l.b ?? ""} ${l.n} ${l.c ?? ""} ${l.nt ? l.nt.flat().join(" ") : ""} ${kindName(l.k)}`);
      if (!words.every((w) => hay.includes(w))) return null;
      const head = norm(`${l.b ?? ""} ${l.n}`);
      return { l, score: (head.startsWith(words[0]) ? 4 : 0) + (words.every((w) => head.includes(w)) ? 3 : 0) + l.a + l.r };
    })
    .filter((x): x is NonNullable<typeof x> => !!x)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.l);
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchLines(q), [q]);
  useEffect(() => {
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  const popular = ["Dior", "Jo Malone", "KAYALI", "ваниль", "сарнай", "Discovery"];
  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal aria-label="Хайлт">
      <div className="sheet-in max-h-dvh overflow-y-auto bg-ivory" onClick={(e) => e.stopPropagation()}>
        <div className="wrap py-6 md:py-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) {
                router.push(`/fragrances?q=${encodeURIComponent(q.trim())}`);
                onClose();
              }
            }}
            className="flex items-center gap-4 border-b border-ink pb-3"
          >
            <SearchIcon size={22} />
            <input
              ref={input}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Брэнд, үнэр, нот… (жишээ нь: ваниль)"
              className="serif min-w-0 flex-1 bg-transparent text-[26px] outline-none placeholder:text-taupe md:text-[38px]"
              aria-label="Хайх үг"
            />
            <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center" aria-label="Хаах">
              <CloseIcon size={22} />
            </button>
          </form>
          {!q && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="eyebrow mr-2 text-taupe-2">Түгээмэл</span>
              {popular.map((p) => (
                <button key={p} type="button" onClick={() => setQ(p)} className="chip">
                  {p}
                </button>
              ))}
            </div>
          )}
          {q && !results.length && <p className="mt-8 text-ink-2">«{q}» гэсэн бүтээгдэхүүн олдсонгүй.</p>}
          {results.length > 0 && (
            <ul className="mt-6 grid gap-x-8 sm:grid-cols-2">
              {results.map((l) => (
                <li key={l.s}>
                  <Link href={`/p/${l.s}`} onClick={onClose} className="group flex items-center gap-4 border-b border-line py-3">
                    <span className="stage relative h-16 w-16 shrink-0">{l.t && <Image src={thumbSrc(l.t)!} alt="" fill sizes="64px" className="object-contain p-1" />}</span>
                    <span className="min-w-0 flex-1">
                      <span className="eyebrow block text-taupe-2">{l.b}</span>
                      <span className="serif block truncate text-[19px] group-hover:text-gold-ink">{l.n}</span>
                    </span>
                    <span className="text-[13.5px] tabular-nums">{formatPrice(l.p)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {q && results.length > 0 && (
            <Link href={`/fragrances?q=${encodeURIComponent(q)}`} onClick={onClose} className="link-arrow mt-6">
              Бүх илэрц <ArrowIcon size={16} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

type NavLink = { href: string; label: string };
export function MobileMenu({ links, extra }: { links: NavLink[]; extra: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [prev, setPrev] = useState(pathname);
  if (prev !== pathname) {
    setPrev(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center lg:hidden" aria-label="Цэс нээх" aria-expanded={open}>
        <MenuIcon size={22} />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-ink/40 lg:hidden" onClick={() => setOpen(false)}>
          <nav className="sheet-in flex h-dvh w-[86%] max-w-sm flex-col overflow-y-auto bg-ivory px-6 py-5" onClick={(e) => e.stopPropagation()} aria-label="Үндсэн цэс">
            <div className="flex items-center justify-between">
              <Wordmark className="text-[30px]" />
              <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center" aria-label="Цэс хаах">
                <CloseIcon size={22} />
              </button>
            </div>
            <ul className="mt-8 border-t border-line">
              {links.map((l) => (
                <li key={l.href} className="border-b border-line">
                  <Link href={l.href} aria-current={pathname === l.href ? "page" : undefined} className="serif flex items-center justify-between py-4 text-[26px] aria-[current=page]:text-gold-ink">
                    {l.label}
                    <ArrowIcon size={16} className="text-taupe" />
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-6 space-y-3 text-[15px] text-ink-2">
              {extra.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-u">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
