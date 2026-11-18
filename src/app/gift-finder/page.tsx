import type { Metadata } from "next";
import { GiftFinder } from "@/components/gift-finder";

export const metadata: Metadata = {
  title: "Бэлэг сонгох",
  description: "Хэнд, ямар үеэр, ямар хэв маяг, төсөв: дөрвөн асуултаар тансаг үнэртэй ус, бэлгийн багцаас бэлгээ сонгоорой.",
  alternates: { canonical: "/gift-finder" },
};

export default async function GiftFinderPage({ searchParams }: { searchParams: Promise<{ who?: string }> }) {
  const { who } = await searchParams;
  return (
    <div className="wrap pt-12 pb-24 md:pt-20">
      <div className="grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-end">
        <div>
          <p className="eyebrow text-gold-ink">Luxury Gift Finder</p>
          <h1 className="serif mt-4 text-[48px] md:text-[80px]">
            Мартагдашгүй <em>бэлэг</em>
          </h1>
        </div>
        <p className="lede max-w-md">Хэнд, ямар үеэр, ямар хэв маяг, хэдэн төгрөг. Дөрвөн сонголтоор манай цуглуулгаас бэлэг санал болгоно.</p>
      </div>
      <div className="mt-14">
        <GiftFinder initialWho={who} />
      </div>
    </div>
  );
}
