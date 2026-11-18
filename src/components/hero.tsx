import Image from "next/image";
import Link from "next/link";
import hero from "@/data/hero.json";
import { getLine } from "@/lib/catalog";
import { ArrowIcon } from "./icons";

/**
 * Three real bottles from the catalog, staged like a still life (cut-outs of the shop's own photos, see
 * scripts/make-brand-images.mjs). White studio backgrounds melt into the ivory with multiply.
 */
const STILL_LIFE = [
  { slug: "diptyque-orpheon-edp", file: "691200-0", style: { left: "4%", bottom: "13%", height: "50%" }, float: "float-b", delay: "0.55s", z: "" },
  { slug: "ysl-libre-edp", file: "689276-0", style: { left: "33%", bottom: "17%", height: "72%" }, float: "float-a", delay: "0.25s", z: "z-10" },
  { slug: "chanel-bleu-de-chanel-edp", file: "689268-0", style: { right: "2%", bottom: "9%", height: "52%" }, float: "float-c", delay: "0.85s", z: "" },
] as const;

export function Hero() {
  const bottles = STILL_LIFE.map((b) => {
    const l = getLine(b.slug);
    const dim = (hero as Record<string, { w: number; h: number }>)[b.file];
    return l && dim ? { ...b, l, dim } : null;
  }).filter((b): b is NonNullable<typeof b> => !!b);

  return (
    <section className="relative isolate overflow-hidden bg-ivory" aria-labelledby="hero-title">
      {/* slow light: champagne glow drifting across warm paper */}
      <div className="hero-zoom absolute inset-0 -z-10" aria-hidden>
        <div className="hero-glow absolute -top-[20%] right-[-10%] h-[95%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(198,167,125,0.5),rgba(198,167,125,0)_70%)]" />
        <div className="absolute bottom-[-30%] left-[-15%] h-[80%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgba(234,226,215,0.95),rgba(234,226,215,0)_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-beige/70 to-transparent" />
      </div>

      <div className="wrap grid min-h-[calc(100svh-104px)] items-center gap-4 py-10 lg:grid-cols-[1.15fr_1fr] lg:py-8">
        <div className="relative z-10">
          <p className="eyebrow fade-up text-gold-ink" style={{ "--d": "0.1s" } as React.CSSProperties}>
            tryLuxé · Discover the Luxury
          </p>
          <h1 id="hero-title" className="serif mt-6 text-[clamp(52px,7.3vw,112px)] leading-[0.95] tracking-[-0.02em]">
            <span className="rise-line">
              <span style={{ "--d": "0.2s" } as React.CSSProperties}>Your Scent.</span>
            </span>
            <span className="rise-line">
              <span className="text-gold-ink italic" style={{ "--d": "0.45s" } as React.CSSProperties}>
                Your Signature.
              </span>
            </span>
          </h1>
          <div className="fade-up mt-8 max-w-md" style={{ "--d": "0.9s" } as React.CSSProperties}>
            <p className="text-[17px] leading-relaxed text-ink">Онцгой үнэрүүдийг нээ. Дусал бүрд тансаг мэдрэмж.</p>
            <p className="mt-1 text-[13px] tracking-[0.04em] text-taupe-2 italic">Discover extraordinary fragrances. Experience luxury in every drop.</p>
          </div>
          <div className="fade-up mt-10 flex flex-wrap gap-3" style={{ "--d": "1.1s" } as React.CSSProperties}>
            <Link href="/fragrances" className="btn btn-ink">
              Цуглуулга үзэх <ArrowIcon size={15} />
            </Link>
            <Link href="/scent-finder" className="btn btn-line">
              Үнэрээ олох
            </Link>
          </div>
        </div>

        <div className="relative mx-auto aspect-[1/0.9] w-full max-w-[620px] lg:aspect-[1/1.05]">
          {/* plinth and soft shadow */}
          <div className="absolute inset-x-[2%] bottom-[5%] h-[10%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(23,23,23,0.18),transparent)]" aria-hidden />
          <div className="absolute inset-x-[10%] bottom-[9%] h-px bg-gradient-to-r from-transparent via-gold to-transparent" aria-hidden />
          {bottles.map((b) => (
            <Link
              key={b.slug}
              href={`/p/${b.l.slug}`}
              className={`multiply group absolute ${b.z} ${b.float}`}
              style={{ ...b.style, aspectRatio: `${b.dim.w} / ${b.dim.h}` }}
              aria-label={`${b.l.brand} ${b.l.title}`}
            >
              <span className="fade-up absolute inset-0" style={{ "--d": b.delay } as React.CSSProperties}>
                <Image src={`/images/hero/${b.file}.webp`} alt={`${b.l.brand} ${b.l.title}`} width={b.dim.w} height={b.dim.h} priority sizes="(min-width: 1024px) 18vw, 34vw" className="h-full w-full object-contain transition duration-700 group-hover:-translate-y-2" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      <a href="#brands" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex" aria-label="Доош гүйлгэх">
        <span className="eyebrow text-[9.5px] text-taupe-2">Scroll</span>
        <span className="scroll-cue" />
      </a>
    </section>
  );
}
