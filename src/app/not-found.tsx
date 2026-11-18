import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap py-28 text-center">
      <p className="eyebrow text-gold-ink">404</p>
      <h1 className="serif mt-4 text-[52px] md:text-[80px]">
        Энэ хуудас <em>алга</em>
      </h1>
      <p className="lede mx-auto mt-4 max-w-md">Хайсан хуудас олдсонгүй. Үнэрийн цуглуулгаас хайгаад үзээрэй.</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/fragrances" className="btn btn-ink">
          Үнэртэй ус
        </Link>
        <Link href="/" className="btn btn-line">
          Нүүр
        </Link>
      </div>
    </div>
  );
}
