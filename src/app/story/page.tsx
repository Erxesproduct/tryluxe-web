import type { Metadata } from "next";
import Link from "next/link";
import { business } from "@/content/business";
import { brands, lines } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Бидний түүх",
  description: "tryLuxé: Discover the Luxury & Try the Experience. Оригинал бүтээгдэхүүн, хүргэлт, төлбөр, түгээмэл асуулт.",
  alternates: { canonical: "/story" },
};

export default function StoryPage() {
  const skus = lines.reduce((n, l) => n + l.variants.length, 0);
  return (
    <div className="pb-24">
      <section className="wrap grid gap-10 pt-14 md:pt-24 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
        <div>
          <p className="eyebrow text-gold-ink">Our Story</p>
          <h1 className="serif mt-5 text-[52px] leading-[0.98] md:text-[96px]">
            Discover the Luxury <em className="text-gold-ink">&amp; Try the Experience</em>
          </h1>
        </div>
        <div className="lede self-end">
          <p>
            Тансаг үнэртэй усыг бүтэн савтай нь авахаасаа өмнө туршиж болдог байх ёстой. tryLuxé дэлхийн {brands.length} брэндийн {skus} бүтээгдэхүүнийг мини, vial тестер, бүтэн хэмжээгээр нь
            Улаанбаатарт хүргэдэг.
          </p>
          <p className="mt-4">{business.faq[0].a}</p>
        </div>
      </section>

      <section className="wrap mt-20 grid gap-px bg-line md:grid-cols-3">
        {[
          ["01", "Эхлээд турш", "Мини, vial-аар хэдэн өдөр арьсан дээрээ мэдэр. Үнэр хүн бүрийн арьсан дээр өөр."],
          ["02", "Дараа нь дурла", "Таалагдсан үнэрээ бэлэн бүтэн савтай нь, эсвэл урьдчилсан захиалгаар duty free нөхцөлөөр ав."],
          ["03", "Баталгаат эх сурвалж", "Брэндийн бутик, duty free, албан ёсны борлуулагчаас. Бүх бүтээгдэхүүн оригинал."],
        ].map(([n, t, d]) => (
          <div key={n} className="bg-ivory p-8 md:p-10">
            <p className="serif text-[56px] leading-none text-gold">{n}</p>
            <h2 className="serif mt-5 text-[30px]">{t}</h2>
            <p className="mt-3 text-[14.5px] text-ink-2">{d}</p>
          </div>
        ))}
      </section>

      <section id="delivery" className="wrap mt-24 grid scroll-mt-28 gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
        <h2 className="serif text-[40px] md:text-[56px]">
          Хүргэлт, <em>төлбөр</em>
        </h2>
        <dl className="divide-y divide-line border-y border-line">
          {[
            ["Хүргэлт", `Улаанбаатар хот дотор ${formatPrice(business.cityFee)}. ${formatPrice(business.freeFrom)}-өөс дээш захиалгад үнэгүй.`],
            ["Хугацаа", business.rules.delivery],
            ["Орон нутаг", business.rules.countryside],
            ["Төлбөр", `${business.rules.payment} QPay-ээр төлнө.`],
            ["И-баримт", business.rules.ebarimt],
            ["Буцаалт", business.rules.returns],
          ].map(([t, d]) => (
            <div key={t} className="grid gap-2 py-5 sm:grid-cols-[160px_1fr]">
              <dt className="eyebrow pt-1 text-gold-ink">{t}</dt>
              <dd className="text-[15px] text-ink-2">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="faq" className="wrap mt-24 grid scroll-mt-28 gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
        <h2 className="serif text-[40px] md:text-[56px]">
          Түгээмэл <em>асуулт</em>
        </h2>
        <div className="border-t border-line">
          {business.faq.map((f) => (
            <details key={f.q} className="group border-b border-line">
              <summary className="serif flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[22px] md:text-[24px]">
                {f.q}
                <span className="text-[22px] text-gold-ink transition group-open:rotate-45">+</span>
              </summary>
              <p className="pb-6 text-[15px] text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="wrap mt-24 bg-ink px-8 py-14 text-center text-ivory md:py-20">
        <p className="eyebrow text-gold">Холбоо барих</p>
        <p className="serif mt-4 text-[36px] md:text-[52px]">
          <a href={`tel:${business.phone.tel}`} className="hover:text-gold-2">
            {business.phone.display}
          </a>
        </p>
        <p className="mt-2 text-ivory/70">
          <a href={`mailto:${business.email}`} className="hover:text-gold-2">
            {business.email}
          </a>
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <a href={business.instagram} target="_blank" rel="noreferrer" className="btn btn-light">
            Instagram
          </a>
          <a href={business.facebook} target="_blank" rel="noreferrer" className="btn btn-light">
            Facebook
          </a>
          <Link href="/fragrances" className="btn btn-gold">
            Дэлгүүр
          </Link>
        </div>
      </section>
    </div>
  );
}
