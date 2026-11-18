"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { business, deliveryFee } from "@/content/business";
import { cart, cartSubtotal, hasPreorder, maxQty, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { getLiteVariant, thumbSrc } from "@/lib/lite";
import { localOrders } from "@/lib/local-orders";
import type { OrderErrors } from "@/lib/orders/schema";
import { BasketIcon, MinusIcon, PhoneIcon, PlusIcon, TrashIcon } from "./icons";

const DISTRICTS = ["Баянгол", "Баянзүрх", "Сонгинохайрхан", "Сүхбаатар", "Хан-Уул", "Чингэлтэй", "Налайх", "Багануур", "Багахангай"];

/** One idempotency key per checkout attempt, kept until the order goes through. */
function checkoutKey() {
  try {
    const k = sessionStorage.getItem("tryluxe.checkout-key");
    if (k) return k;
    const n = crypto.randomUUID();
    sessionStorage.setItem("tryluxe.checkout-key", n);
    return n;
  } catch {
    return crypto.randomUUID();
  }
}

export function Checkout() {
  const items = useCart();
  const router = useRouter();
  const [receiptType, setReceiptType] = useState<"person" | "company">("person");
  const [errors, setErrors] = useState<OrderErrors>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const lines = items.flatMap((i) => {
    const v = getLiteVariant(i.id);
    return v ? [{ ...i, v }] : [];
  });
  const subtotal = cartSubtotal(items);
  const fee = deliveryFee("city", subtotal);
  const total = subtotal + fee;
  const toFree = subtotal < business.freeFrom ? business.freeFrom - subtotal : 0;
  const pre = hasPreorder(items);

  if (!lines.length)
    return (
      <div className="mx-auto max-w-lg bg-paper px-8 py-16 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold text-gold-ink">
          <BasketIcon size={26} />
        </span>
        <p className="serif mt-6 text-[36px]">Сагс хоосон байна</p>
        <p className="mt-2 text-ink-2">Эхлээд мини эсвэл vial-аар туршаад үзээрэй.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/fragrances" className="btn btn-ink">
            Үнэртэй ус
          </Link>
          <Link href="/discovery" className="btn btn-line">
            Discovery
          </Link>
        </div>
      </div>
    );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setNotice(null);
    setErrors({});
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: checkoutKey(),
          name: f.get("name"),
          phone: f.get("phone"),
          email: f.get("email"),
          delivery: "city",
          district: f.get("district"),
          khoroo: Number(f.get("khoroo")),
          address: f.get("address") ?? "",
          payment: "qpay",
          receiptType,
          regNo: f.get("regNo") ?? "",
          note: f.get("note"),
          website: f.get("website"),
          items: items.map(({ id, qty }) => ({ id, qty })),
        }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        localOrders.save({
          reference: json.reference,
          createdAt: new Date().toISOString(),
          subtotal: json.subtotal,
          deliveryFee: json.deliveryFee,
          total: json.total,
          preorder: !!json.preorder,
          lines: lines.map((l) => ({ name: [l.v.b, l.v.n].filter(Boolean).join(" "), label: l.v.z, qty: l.qty, total: l.v.p * l.qty })),
          invoiceId: json.payment?.invoiceId ?? null,
          payUrl: json.payment?.url ?? null,
          status: json.payment ? "pending" : null,
        });
        try {
          sessionStorage.removeItem("tryluxe.checkout-key");
        } catch {}
        cart.clear();
        router.push(`/order/${json.reference}`);
        return;
      }
      if (res.status === 422 && json?.errors) {
        setErrors(json.errors);
        setNotice("Мэдээллээ шалгаад дахин оролдоно уу.");
      } else if (json?.error === "not_configured") {
        setNotice(`Онлайн захиалга одоогоор холбогдоогүй байна. Захиалгаа ${business.phone.display} дугаарт өгнө үү (лавлах код ${json.reference}, нийт ${formatPrice(json.total ?? total)}). Таны сагс хадгалагдсан.`);
      } else {
        setNotice(`Захиалга илгээхэд алдаа гарлаа. Дахин оролдох эсвэл ${business.phone.display} дугаарт залгана уу.`);
      }
    } catch {
      setNotice("Интернэт холболтоо шалгаад дахин оролдоно уу.");
    } finally {
      setBusy(false);
    }
  }

  const err = (k: keyof OrderErrors) =>
    errors[k] && (
      <p className="mt-1.5 text-[13.5px] normal-case tracking-normal text-wine" id={`e-${k}`}>
        {errors[k]}
      </p>
    );
  const step = (n: string, t: string) => (
    <h2 className="flex items-baseline gap-4 border-b border-line pb-4">
      <span className="serif text-[18px] text-gold-ink italic">{n}</span>
      <span className="serif text-[30px]">{t}</span>
    </h2>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[1.45fr_1fr] lg:gap-14">
      <div className="space-y-14">
        <section aria-label="Сагсны бараа">
          <ul className="divide-y divide-line border-y border-line">
            {lines.map(({ id, qty, v }) => (
              <li key={id} className="flex gap-5 py-5">
                <Link href={`/p/${v.s}`} className="stage relative h-24 w-24 shrink-0 md:h-28 md:w-28">
                  {v.t && <Image src={thumbSrc(v.t)!} alt="" fill sizes="112px" className="object-contain p-2" />}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="eyebrow text-taupe-2">{v.b}</span>
                  <Link href={`/p/${v.s}`} className="serif mt-0.5 line-clamp-2 text-[20px] leading-snug hover:text-gold-ink">
                    {v.n}
                  </Link>
                  <span className="mt-0.5 text-[12.5px] text-taupe-2">
                    {v.z} · {formatPrice(v.p)}
                    {v.r ? " · урьдчилсан захиалга (7–9 хоног)" : ""}
                  </span>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                    <div className="flex items-center border border-line">
                      <button type="button" onClick={() => cart.setQty(id, qty - 1)} className="grid h-9 w-9 place-items-center hover:bg-beige-2" aria-label="Цөөлөх">
                        <MinusIcon size={14} />
                      </button>
                      <span className="w-8 text-center text-[14px] tabular-nums">{qty}</span>
                      <button type="button" onClick={() => cart.setQty(id, qty + 1)} disabled={qty >= maxQty(id)} className="grid h-9 w-9 place-items-center hover:bg-beige-2 disabled:opacity-30" aria-label="Нэмэх">
                        <PlusIcon size={14} />
                      </button>
                    </div>
                    <span className="serif text-[21px] tabular-nums">{formatPrice(v.p * qty)}</span>
                    <button type="button" onClick={() => cart.setQty(id, 0)} className="grid h-9 w-9 place-items-center text-taupe-2 hover:text-wine" aria-label={`${v.n}: хасах`}>
                      <TrashIcon size={17} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {pre && <p className="mt-4 border-l-2 border-gold bg-beige-2 px-4 py-3 text-[14px]">{business.rules.preorder} Бэлэн бараатай хамт захиалбал бүгдийг нэг дор хүргэх эсэхийг бид утсаар тохирно.</p>}
        </section>

        <section>
          {step("I", "Захиалагч")}
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label className="label">
              Нэр
              <input name="name" autoComplete="name" required aria-invalid={!!errors.name} aria-describedby={errors.name ? "e-name" : undefined} className="field" />
              {err("name")}
            </label>
            <label className="label">
              Утас
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="99112233" required aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "e-phone" : undefined} className="field" />
              {err("phone")}
            </label>
            <label className="label sm:col-span-2">
              Имэйл <span className="font-normal normal-case tracking-normal text-taupe-2">(заавал биш)</span>
              <input name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} className="field" />
              {err("email")}
            </label>
          </div>
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        </section>

        <section>
          {step("II", "Хүргэлт")}
          <div className="mt-6 flex items-start justify-between gap-4 border border-ink bg-paper p-4">
            <span>
              <span className="block text-[15px] font-semibold">{business.delivery[0].name}</span>
              <span className="block text-[13.5px] text-ink-2">{business.delivery[0].note}</span>
            </span>
            <span className="serif text-[20px] text-gold-ink">{fee === 0 ? "Үнэгүй" : formatPrice(fee)}</span>
          </div>
          {toFree > 0 && <p className="mt-3 text-[13.5px] text-ink-2">Дахиад {formatPrice(toFree)}-ийн бараа нэмбэл хүргэлт үнэгүй.</p>}
          <div className="mt-6 grid gap-5 sm:grid-cols-[1.4fr_1fr]">
            <label className="label">
              Дүүрэг
              <select name="district" required defaultValue="" aria-invalid={!!errors.district} className="field">
                <option value="" disabled>
                  Сонгох
                </option>
                {DISTRICTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              {err("district")}
            </label>
            <label className="label">
              Хороо
              <input name="khoroo" type="number" inputMode="numeric" min={1} max={45} required aria-invalid={!!errors.khoroo} className="field" />
              {err("khoroo")}
            </label>
            <label className="label sm:col-span-2">
              Хаяг
              <textarea name="address" rows={2} required aria-invalid={!!errors.address} placeholder="Байр, орц, давхар, тоот, орцны код" className="field" />
              {err("address")}
            </label>
          </div>
          <p className="mt-3 text-[13px] text-taupe-2">{business.rules.countryside}</p>
        </section>

        <section>
          {step("III", "Төлбөр, и-баримт")}
          <div className="mt-6 flex items-start gap-3.5 border border-ink bg-paper p-4">
            <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-ink">
              <span className="h-2 w-2 rounded-full bg-ink" />
            </span>
            <span>
              <span className="block text-[15px] font-semibold">{business.payments[0].name}</span>
              <span className="block text-[13.5px] text-ink-2">{business.payments[0].note} Захиалга өгсний дараа төлбөрийн хуудас нээгдэнэ.</span>
            </span>
          </div>
          {err("payment")}
          <div className="mt-7 flex gap-2" role="radiogroup" aria-label="И-баримтын төрөл">
            {(
              [
                ["person", "Хувь хүн"],
                ["company", "Байгууллага"],
              ] as const
            ).map(([id, text]) => (
              <button key={id} type="button" role="radio" aria-checked={receiptType === id} onClick={() => setReceiptType(id)} className="chip">
                {text}
              </button>
            ))}
          </div>
          {receiptType === "company" ? (
            <label className="label mt-5">
              Байгууллагын регистр
              <input name="regNo" inputMode="numeric" maxLength={7} placeholder="1234567" aria-invalid={!!errors.regNo} className="field" />
              {err("regNo")}
            </label>
          ) : (
            <p className="mt-3 text-[13.5px] text-ink-2">И-баримтыг таны утасны дугаараар бүртгэнэ.</p>
          )}
          <label className="label mt-6">
            Нэмэлт тайлбар <span className="font-normal normal-case tracking-normal text-taupe-2">(бэлгийн мэндчилгээ, хүргэх цаг)</span>
            <textarea name="note" rows={2} className="field" />
          </label>
        </section>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="bg-ink p-7 text-ivory md:p-9">
          <p className="eyebrow text-gold">Төлөх дүн</p>
          <dl className="mt-6 space-y-3 text-[15px]">
            <div className="flex justify-between gap-4">
              <dt className="text-ivory/65">Барааны дүн</dt>
              <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ivory/65">Хүргэлт</dt>
              <dd className="tabular-nums">{fee === 0 ? "Үнэгүй" : formatPrice(fee)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t border-ivory/15 pt-4">
              <dt className="eyebrow text-ivory/80">Нийт</dt>
              <dd className="serif text-[40px] text-gold-2 tabular-nums">{formatPrice(total)}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[13px] leading-snug text-ivory/60">{business.rules.payment}</p>
          <p className="mt-2 text-[13px] leading-snug text-ivory/60">{business.rules.returns}</p>
          {notice && (
            <p role="alert" className="mt-5 bg-ivory px-4 py-3 text-[14px] text-ink">
              {notice}
            </p>
          )}
          {errors.items && <p className="mt-4 bg-wine px-4 py-2.5 text-[14px]">{errors.items}</p>}
          <button type="submit" disabled={busy} className="btn btn-gold mt-7 h-14 w-full">
            {busy ? "Илгээж байна…" : "Захиалах, QPay-ээр төлөх"}
          </button>
          <a href={`tel:${business.phone.tel}`} className="mt-5 inline-flex items-center gap-2 text-[14px] text-ivory/80 hover:text-gold-2">
            <PhoneIcon size={16} /> {business.phone.display}
          </a>
        </div>
      </aside>
    </form>
  );
}
