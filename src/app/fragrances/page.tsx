import type { Metadata } from "next";
import Link from "next/link";
import { Catalog, readFilters, type Params } from "@/components/catalog";
import { getBrand } from "@/lib/catalog";
import { FAMILIES, KINDS } from "@/lib/labels";

export const metadata: Metadata = {
  title: "Үнэртэй ус",
  description: "Dior, Chanel, Jo Malone, KAYALI, Diptyque, Tom Ford, MFK зэрэг брэндийн оригинал мини, vial тестер, бүтэн хэмжээний үнэртэй ус. Брэнд, үнэрийн бүлэг, үнээр шүүнэ.",
  alternates: { canonical: "/fragrances" },
};

export default async function FragrancesPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const f = readFilters(sp);
  const family = FAMILIES.find((x) => x.id === f.f);
  const kind = KINDS.find((x) => x.id === f.k);
  const title = f.q ? `«${f.q}»` : family ? family.name : kind ? kind.plural : f.t === "all" ? "Бүх бүтээгдэхүүн" : f.pre ? "Урьдчилсан захиалга" : "Үнэртэй ус";
  const lede = family
    ? `${family.line}. Тайлбарт нь «${family.name.toLowerCase()}» гэж бичигдсэн үнэрүүд.`
    : f.pre
      ? "Брэндийн бутик, duty free-ээс 7–9 хоногт захиалж авчирна. Захиалга 100% төлбөрийн дараа баталгаажна."
      : "Эхлээд мини эсвэл vial-аар туршаад, дурласан үнэрээ том хэмжээгээр нь аваарай.";
  return (
    <div className="wrap pt-10 pb-24 md:pt-14">
      <nav className="text-[12px] tracking-[0.08em] text-taupe-2" aria-label="Зам">
        <Link href="/" className="hover:text-ink">
          Нүүр
        </Link>{" "}
        / <span className="text-ink">Үнэртэй ус</span>
        {f.b && <> / {getBrand(f.b)?.name}</>}
      </nav>
      <header className="mt-6 mb-10 grid gap-4 md:grid-cols-[1.2fr_1fr] md:items-end">
        <h1 className="serif text-[48px] md:text-[76px]">{title}</h1>
        <p className="lede max-w-md md:justify-self-end">{lede}</p>
      </header>
      <Catalog sp={sp} base="/fragrances" />
    </div>
  );
}
