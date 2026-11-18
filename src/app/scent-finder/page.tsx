import type { Metadata } from "next";
import { ScentQuiz } from "@/components/scent-quiz";

export const metadata: Metadata = {
  title: "Өөрийн үнэрийг олох",
  description: "5 асуултад хариулаад өөрт тохирох үнэртэй усаа tryLuxé-ийн цуглуулгаас олоорой: сэтгэл төлөв, үнэрийн бүлэг, хэрэглэх үе, хүч, төсөв.",
  alternates: { canonical: "/scent-finder" },
};

export default function ScentFinderPage() {
  return (
    <div className="wrap max-w-5xl pt-12 pb-24 md:pt-20">
      <p className="eyebrow text-gold-ink">Find Your Signature Scent</p>
      <h1 className="serif mt-4 text-[48px] md:text-[80px]">
        Таны <em>гарын үсэг</em> болох үнэр
      </h1>
      <p className="lede mt-5 max-w-xl">Таван асуулт. Хариулт бүрийг манай цуглуулгын бодит бүтээгдэхүүний нот, бүлэг, хүчтэй тулгаж санал болгоно.</p>
      <div className="mt-12">
        <ScentQuiz />
      </div>
    </div>
  );
}
