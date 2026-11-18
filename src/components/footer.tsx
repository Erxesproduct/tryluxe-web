import Link from "next/link";
import { business } from "@/content/business";
import { formatPrice } from "@/lib/format";
import { FacebookIcon, InstagramIcon, MailIcon, PhoneIcon } from "./icons";
import { Newsletter } from "./newsletter";
import { Wordmark } from "./wordmark";

const COLS = [
  {
    title: "Дэлгүүр",
    links: [
      ["/fragrances?k=full", "Бүтэн хэмжээ"],
      ["/fragrances?k=mini", "Мини үнэртэй ус"],
      ["/discovery", "Discovery, vial тестер"],
      ["/brands", "Брэндүүд"],
      ["/fragrances?pre=1", "Урьдчилсан захиалга"],
      ["/fragrances?t=all", "Будаг, арчилгаа"],
    ],
  },
  {
    title: "Сонгоход туслах",
    links: [
      ["/scent-finder", "Өөрийн үнэрийг олох"],
      ["/gift-finder", "Бэлэг сонгох"],
      ["/notes", "Нот судлах"],
      ["/#wardrobe", "Үнэрийн шүүгээ"],
    ],
  },
  {
    title: "Үйлчилгээ",
    links: [
      ["/story#delivery", "Хүргэлт, төлбөр"],
      ["/story#faq", "Түгээмэл асуулт"],
      ["/track", "Захиалга шалгах"],
      ["/wishlist", "Хадгалсан"],
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-auto bg-ink text-ivory">
      <section className="border-b border-ivory/10">
        <div className="wrap grid gap-10 py-16 md:grid-cols-[1.1fr_1fr] md:items-end md:py-20">
          <div>
            <p className="eyebrow text-gold">Newsletter</p>
            <h2 className="serif mt-4 text-[40px] md:text-[56px]">
              Шинэ ирэлтийг <em className="text-gold-2">хамгийн түрүүнд</em>
            </h2>
            <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-ivory/70">Шинээр ирсэн мини, discovery багц, урьдчилсан захиалгын мэдээг имэйлээр.</p>
          </div>
          <Newsletter dark />
        </div>
      </section>
      <div className="wrap grid gap-12 py-14 md:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <Wordmark className="text-[40px] text-ivory" />
          <p className="mt-3 text-[13px] tracking-[0.08em] text-gold-2 italic">{business.tagline}</p>
          <ul className="mt-7 space-y-2.5 text-[14px] text-ivory/80">
            <li>
              <a href={`tel:${business.phone.tel}`} className="inline-flex items-center gap-2.5 hover:text-gold-2">
                <PhoneIcon size={16} /> {business.phone.display}
              </a>
            </li>
            <li>
              <a href={`mailto:${business.email}`} className="inline-flex items-center gap-2.5 hover:text-gold-2">
                <MailIcon size={16} /> {business.email}
              </a>
            </li>
          </ul>
          <div className="mt-6 flex gap-2">
            <a href={business.instagram} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center border border-ivory/25 transition hover:border-gold hover:text-gold" aria-label="Instagram">
              <InstagramIcon size={18} />
            </a>
            <a href={business.facebook} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center border border-ivory/25 transition hover:border-gold hover:text-gold" aria-label="Facebook">
              <FacebookIcon size={18} />
            </a>
          </div>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="eyebrow text-gold">{c.title}</p>
            <ul className="mt-5 space-y-2.5 text-[14px] text-ivory/80">
              {c.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="link-u hover:text-ivory">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-ivory/10">
        <div className="wrap flex flex-col gap-2 py-6 text-[12px] text-ivory/55 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} tryLuxé · Бүх бүтээгдэхүүн оригинал, баталгаат эх сурвалжаас</p>
          <p>
            QPay · Улаанбаатарт {formatPrice(business.cityFee)}, {formatPrice(business.freeFrom)}-өөс дээш үнэгүй
          </p>
        </div>
      </div>
    </footer>
  );
}
