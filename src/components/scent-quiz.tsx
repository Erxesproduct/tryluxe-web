"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FAMILIES, INTENSITY, OCCASIONS } from "@/lib/labels";
import { BUDGETS, recommend, type BudgetId } from "@/lib/recommend";
import { ArrowIcon } from "./icons";
import { PickCard } from "./pick-card";

const MOODS = [
  { id: "romantic", name: "Романтик, зөөлөн", line: "Цэцэг, зөөлөн мускус", families: ["floral", "musk", "fruity"] },
  { id: "confident", name: "Итгэлтэй, тод", line: "Амбер, мод, гүн үнэр", families: ["amber", "woody"] },
  { id: "fresh", name: "Сэргэг, чөлөөтэй", line: "Цитрус, ногоон, далай", families: ["fresh", "fruity"] },
  { id: "cozy", name: "Дулаан, тухтай", line: "Ваниль, амтлаг, амбер", families: ["gourmand", "amber"] },
  { id: "mysterious", name: "Нууцлаг, дэгжин", line: "Мод, арьс, утаа", families: ["woody", "amber", "musk"] },
] as const;

const OCC = [
  { id: "everyday", name: "Өдөр тутам", occ: ["everyday"] },
  { id: "office", name: "Оффис, ажил", occ: ["office", "everyday"] },
  { id: "evening", name: "Орой, болзоо", occ: ["evening", "date"] },
  { id: "special", name: "Онцгой арга хэмжээ", occ: ["special", "evening"] },
  { id: "vacation", name: "Амралт, аялал", occ: ["vacation", "everyday"] },
] as const;

const NAMES: Record<string, string> = Object.fromEntries([...FAMILIES.map((f) => [f.id, f.name]), ...OCCASIONS.map((o) => [o.id, o.name.toLowerCase()]), ...INTENSITY.map((i) => [i.id, `${i.name.toLowerCase()} хүч`])]);

type Answers = { mood?: string; family?: string; occasion?: string; intensity?: string; budget?: BudgetId };
const STEPS = ["Сэтгэл төлөв", "Үнэрийн бүлэг", "Хэзээ", "Хүч", "Төсөв"] as const;

export function ScentQuiz({ dark = false }: { dark?: boolean }) {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>({});
  const done = step >= STEPS.length;
  const picks = useMemo(() => {
    if (!done) return [];
    const mood = MOODS.find((m) => m.id === a.mood);
    const occ = OCC.find((o) => o.id === a.occasion);
    return recommend(
      {
        families: a.family && a.family !== "any" ? [a.family] : [],
        moodFamilies: mood ? [...mood.families] : [],
        occasions: occ ? [...occ.occ] : [],
        intensity: a.intensity && a.intensity !== "any" ? a.intensity : null,
        budget: a.budget ?? "any",
      },
      6,
      NAMES,
    );
  }, [done, a]);

  const choose = (key: keyof Answers, value: string) => {
    setA((x) => ({ ...x, [key]: value }));
    setStep((s) => s + 1);
  };
  const opt = `group flex w-full items-start justify-between gap-4 border px-5 py-4 text-left transition ${dark ? "border-ivory/20 hover:border-gold hover:bg-ivory/5" : "border-line bg-paper hover:border-ink"}`;
  const sub = dark ? "text-ivory/60" : "text-taupe-2";
  const option = (k: keyof Answers, id: string, name: string, line?: string) => (
    <li key={id}>
      <button type="button" className={opt} onClick={() => choose(k, id)} aria-pressed={a[k] === id}>
        <span>
          <span className="serif block text-[22px] leading-tight">{name}</span>
          {line && <span className={`mt-0.5 block text-[12.5px] ${sub}`}>{line}</span>}
        </span>
        <ArrowIcon size={16} className="mt-1.5 shrink-0 opacity-40 transition group-hover:translate-x-1 group-hover:opacity-100" />
      </button>
    </li>
  );

  return (
    <div>
      {/* progress */}
      <div className="flex items-center gap-3" aria-label="Явц">
        <ol className="flex flex-1 gap-1.5">
          {STEPS.map((s, i) => (
            <li key={s} className={`h-[3px] flex-1 transition-colors duration-500 ${i < step ? "bg-gold" : dark ? "bg-ivory/15" : "bg-line"}`}>
              <span className="sr-only">
                {s}: {i < step ? "хариулсан" : "хариулаагүй"}
              </span>
            </li>
          ))}
        </ol>
        <span className={`text-[12px] tabular-nums ${sub}`}>{done ? "Бэлэн" : `${step + 1} / ${STEPS.length}`}</span>
      </div>

      {!done && (
        <div key={step} className="pop-in mt-8">
          <p className={`eyebrow ${dark ? "text-gold" : "text-gold-ink"}`}>
            {String(step + 1).padStart(2, "0")} · {STEPS[step]}
          </p>
          <h3 className="serif mt-3 text-[32px] leading-tight md:text-[40px]">
            {["Өнөөдөр та ямар хүн бэ?", "Аль бүлгийн үнэр татдаг вэ?", "Голчлон хэзээ хэрэглэх вэ?", "Үнэр хэр тод мэдрэгдэх вэ?", "Төсөв хэд вэ?"][step]}
          </h3>
          <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
            {step === 0 && MOODS.map((m) => option("mood", m.id, m.name, m.line))}
            {step === 1 && (
              <>
                {FAMILIES.map((f) => option("family", f.id, f.name, f.line))}
                {option("family", "any", "Мэдэхгүй байна", "Сэтгэл төлөвөөр минь сонго")}
              </>
            )}
            {step === 2 && OCC.map((o) => option("occasion", o.id, o.name))}
            {step === 3 && (
              <>
                {INTENSITY.map((i) => option("intensity", i.id, i.name, i.line))}
                {option("intensity", "any", "Хамаагүй")}
              </>
            )}
            {step === 4 && BUDGETS.map((b) => option("budget", b.id, b.name, b.line))}
          </ul>
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => s - 1)} className={`mt-6 text-[13px] underline underline-offset-4 ${sub}`}>
              ← Өмнөх асуулт
            </button>
          )}
        </div>
      )}

      {done && (
        <div className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h3 className="serif text-[34px] leading-tight md:text-[44px]">
              Таны <em>гарын үсэг</em> байж магадгүй {picks.length} үнэр
            </h3>
            <button
              type="button"
              onClick={() => {
                setA({});
                setStep(0);
              }}
              className={`text-[13px] underline underline-offset-4 ${sub}`}
            >
              Дахин эхлэх
            </button>
          </div>
          {picks.length ? (
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
              {picks.map((p, i) => (
                <li key={p.line.s} className="flex">
                  <PickCard pick={p} index={i} dark={dark} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6">
              Тохирох үнэр олдсонгүй.{" "}
              <Link href="/fragrances" className="underline">
                Бүх үнэрийг харах
              </Link>
            </p>
          )}
          <p className={`mt-8 text-[12.5px] ${sub}`}>Санал болголтыг бүтээгдэхүүний тайлбар дахь нот, бүлэг, тохирох цаг болон савны төрлөөр (EDT, EDP, Parfum) тооцов. Эхлээд мини эсвэл vial-аар туршихыг зөвлөе.</p>
        </div>
      )}
    </div>
  );
}
