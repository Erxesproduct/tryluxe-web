import type { Metadata } from "next";
import Link from "next/link";
import { business } from "@/content/business";

export const metadata: Metadata = { title: "Миний бүртгэл", robots: { index: false } };

/** There are no customer accounts yet (erxes Client Portal login is not set up): say so and offer what works. */
export default function AccountPage() {
  return (
    <div className="wrap max-w-3xl pt-12 pb-24 md:pt-16">
      <h1 className="serif text-[48px] md:text-[72px]">Миний бүртгэл</h1>
      <p className="lede mt-5">Хэрэглэгчийн бүртгэл удахгүй нээгдэнэ. Одоогоор бүртгэлгүйгээр захиалж, QPay-ээр төлнө. Хадгалсан бараа, захиалгын түүх энэ төхөөрөмж дээр хадгалагдана.</p>
      <ul className="mt-10 grid gap-3 sm:grid-cols-3">
        {[
          ["/wishlist", "Хадгалсан", "Таалагдсан үнэрүүд"],
          ["/track", "Захиалга", "Төлбөрийн төлөв шалгах"],
          ["/cart", "Сагс", "Захиалга үргэлжлүүлэх"],
        ].map(([href, t, d]) => (
          <li key={href}>
            <Link href={href} className="block border border-line bg-paper p-6 transition hover:border-ink">
              <span className="serif block text-[26px]">{t}</span>
              <span className="text-[13.5px] text-ink-2">{d}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-10 text-[14px] text-ink-2">
        Асуух зүйл байвал: <a href={`tel:${business.phone.tel}`} className="underline">{business.phone.display}</a> · <a href={`mailto:${business.email}`} className="underline">{business.email}</a>
      </p>
    </div>
  );
}
