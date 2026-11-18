"use client";

import { useState } from "react";
import { business } from "@/content/business";
import { ArrowIcon } from "./icons";

/** Email sign-up → /api/newsletter → erxes form. Says plainly when the form is not connected yet. */
export function Newsletter({ dark = false }: { dark?: boolean }) {
  const [state, setState] = useState<"idle" | "busy" | "ok" | "off" | "bad" | "error">("idle");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("busy");
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: f.get("email"), website: f.get("website") }) });
      const json = await res.json().catch(() => null);
      setState(res.ok && json?.ok ? "ok" : json?.error === "not_configured" ? "off" : res.status === 422 ? "bad" : "error");
    } catch {
      setState("error");
    }
  }
  const msg = {
    ok: "Баярлалаа. Шинэ ирэлт, discovery багцын мэдээг танд илгээнэ.",
    off: `Имэйл бүртгэл удахгүй нээгдэнэ. Тэр болтол шинэ мэдээг Instagram-аас (${business.instagram.replace("https://www.instagram.com/", "@").replace(/\/$/, "")}) аваарай.`,
    bad: "Имэйл хаягаа зөв бичнэ үү.",
    error: "Алдаа гарлаа. Дахин оролдоно уу.",
  } as const;
  return (
    <form onSubmit={submit} noValidate className="w-full">
      <div className={`flex items-center border-b ${dark ? "border-ivory/50" : "border-ink"}`}>
        <label htmlFor="nl-email" className="sr-only">
          Имэйл хаяг
        </label>
        <input id="nl-email" name="email" type="email" autoComplete="email" required placeholder="Имэйл хаяг" className={`min-w-0 flex-1 bg-transparent py-3.5 text-[16px] outline-none ${dark ? "placeholder:text-ivory/50" : "placeholder:text-taupe-2"}`} />
        <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <button type="submit" disabled={state === "busy"} className="link-arrow py-3.5 pl-4" aria-label="Бүртгүүлэх">
          Бүртгүүлэх <ArrowIcon size={16} />
        </button>
      </div>
      <p role="status" className={`mt-3 min-h-[1.5em] text-[13.5px] ${dark ? "text-ivory/75" : "text-ink-2"}`}>
        {state in msg ? msg[state as keyof typeof msg] : ""}
      </p>
    </form>
  );
}
