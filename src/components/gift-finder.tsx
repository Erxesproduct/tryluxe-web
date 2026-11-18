"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import { FAMILIES, OCCASIONS } from "@/lib/labels";
import { liteLines, thumbSrc } from "@/lib/lite";
import { BUDGETS, recommend, type BudgetId } from "@/lib/recommend";
import { GiftIcon } from "./icons";
import { PickCard } from "./pick-card";

export const WHO = [
  { id: "her", name: "Түүнд (эмэгтэй)", gender: "women" },
  { id: "him", name: "Түүнд (эрэгтэй)", gender: "men" },
  { id: "anyone", name: "Хэнд ч тохирох", gender: null },
  { id: "me", name: "Өөртөө", gender: null },
] as const;
const WHEN = [
  { id: "birthday", name: "Төрсөн өдөр", occ: ["everyday", "special"] },
  { id: "love", name: "Хайртай хүндээ", occ: ["date", "evening"] },
  { id: "thanks", name: "Талархал, хамт олон", occ: ["office", "everyday"] },
  { id: "holiday", name: "Шинэ жил, баяр", occ: ["special", "evening"] },
] as const;
const STYLE = [
  { id: "classic", name: "Сонгодог цэцэглэг", families: ["floral", "musk"] },
  { id: "fresh", name: "Сэргэг, цэвэрхэн", families: ["fresh", "fruity"] },
  { id: "sweet", name: "Амтлаг, дулаан", families: ["gourmand", "amber"] },
  { id: "bold", name: "Гүн, модлог", families: ["woody", "amber"] },
] as const;

const NAMES: Record<string, string> = Object.fromEntries([...FAMILIES.map((f) => [f.id, f.name]), ...OCCASIONS.map((o) => [o.id, o.name.toLowerCase()])]);

type Sel = { who: string; when: string; style: string; budget: BudgetId };

export function GiftFinder({ initialWho }: { initialWho?: string }) {
  const [sel, setSel] = useState<Partial<Sel>>(WHO.some((w) => w.id === initialWho) ? { who: initialWho } : {});
  const ready = !!(sel.who && sel.when && sel.style && sel.budget);
  const picks = useMemo(() => {
    if (!ready) return [];
    const who = WHO.find((w) => w.id === sel.who)!;
    return recommend(
      {
        gender: who.gender,
        occasions: [...WHEN.find((w) => w.id === sel.when)!.occ],
        families: [...STYLE.find((s) => s.id === sel.style)!.families],
        budget: sel.budget,
        preferKinds: ["set", "full"],
      },
      6,
      NAMES,
    );
  }, [ready, sel]);
  // real gift bags / boxes the shop sells
  const wraps = liteLines.filter((l) => l.k === "wrap" && l.a);

  const groups: { key: keyof Sel; title: string; opts: readonly { id: string; name: string; line?: string }[] }[] = [
    { key: "who", title: "Хэнд?", opts: WHO },
    { key: "when", title: "Ямар үеэр?", opts: WHEN },
    { key: "style", title: "Ямар хэв маяг?", opts: STYLE },
    { key: "budget", title: "Төсөв", opts: BUDGETS },
  ];
  return (
    <div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {groups.map((g, gi) => (
          <fieldset key={g.key}>
            <legend className="eyebrow text-gold-ink">
              {String(gi + 1).padStart(2, "0")} · {g.title}
            </legend>
            <div className="mt-4 flex flex-col gap-2" role="radiogroup" aria-label={g.title}>
              {g.opts.map((o) => (
                <button key={o.id} type="button" role="radio" aria-checked={sel[g.key] === o.id} onClick={() => setSel((s) => ({ ...s, [g.key]: o.id }))} className="chip min-h-[46px] justify-between text-left text-[14px]">
                  {o.name}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
      {!ready && <p className="mt-8 text-[13.5px] text-taupe-2">Дөрвөн асуултад хариулахад бэлгийн санал гарч ирнэ ({Object.keys(sel).length}/4).</p>}
      {ready && (
        <section className="mt-14 border-t border-line pt-10" aria-live="polite">
          <h2 className="serif text-[36px] md:text-[48px]">
            Бэлгийн <em>санал</em>
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
            {picks.map((p, i) => (
              <li key={p.line.s} className="flex">
                <PickCard pick={p} index={i} />
              </li>
            ))}
          </ul>
          {wraps.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center gap-6 bg-beige-2 p-6">
              <GiftIcon size={28} className="text-gold-ink" />
              <p className="min-w-0 flex-1 text-[14.5px]">Бэлгээ tryLuxé-ийн уут, хайрцагт хийлгэх үү?</p>
              {wraps.map((w) => (
                <Link key={w.s} href={`/p/${w.s}`} className="flex items-center gap-3 bg-paper p-2 pr-4 hover:outline hover:outline-ink">
                  <span className="stage relative h-14 w-14">{w.t && <Image src={thumbSrc(w.t)!} alt="" fill sizes="56px" className="object-contain p-1" />}</span>
                  <span className="text-[13.5px]">
                    {w.n}
                    <span className="block text-taupe-2 tabular-nums">{formatPrice(w.p)}</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
