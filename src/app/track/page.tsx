import type { Metadata } from "next";
import { TrackForm } from "@/components/track-form";
import { business, ORDER_STATUSES } from "@/content/business";

export const metadata: Metadata = { title: "Захиалга шалгах", robots: { index: false } };

export default function TrackPage() {
  return (
    <div className="wrap grid gap-14 pt-12 pb-24 md:pt-16 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <h1 className="serif text-[48px] md:text-[72px]">Захиалга шалгах</h1>
        <p className="lede mt-4 max-w-lg">Захиалгын дугаараа оруулбал төлбөрийн төлөвийг шалгана. Хүргэлтийн явцыг бид утсаар мэдэгдэнэ.</p>
        <div className="mt-10">
          <TrackForm />
        </div>
      </div>
      <aside className="bg-beige-2 p-8">
        <p className="eyebrow text-gold-ink">Захиалгын төлөв</p>
        <ul className="mt-5 space-y-4">
          {ORDER_STATUSES.map((s) => (
            <li key={s.id}>
              <p className="font-semibold">{s.name}</p>
              <p className="text-[13.5px] text-ink-2">{s.note}</p>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-[13.5px] text-ink-2">
          Лавлах: <a href={`tel:${business.phone.tel}`} className="underline">{business.phone.display}</a>
        </p>
      </aside>
    </div>
  );
}
