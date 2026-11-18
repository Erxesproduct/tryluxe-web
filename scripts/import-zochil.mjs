// node scripts/import-zochil.mjs <data.json> [--no-images]
//
// Builds the website catalog from a scrape of tryluxe.mn (Zochil shop 29401):
//   src/data/catalog.json   fragrance lines with their sizes (each Zochil product = one size / SKU)
//   src/data/lite.json      slim records for client components (cart, quiz, gift finder, search)
//   public/images/p/*.webp  photos, 1000 px and 480 px thumbnails
//
// Nothing is invented: names, prices, stock, photos, notes and families come from the shop's own product data.
// Notes / family / seasons / occasions are only filled when the description states them ("Эхлэл: … Зүрх: … Суурь: …").
// Problems (missing price or photo, same name twice, brand guessed from the name) are listed in import-report.json.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const src = process.argv[2];
if (!src) throw new Error("usage: node scripts/import-zochil.mjs <data.json> [--no-images]");
const withImages = !process.argv.includes("--no-images");
const root = process.cwd();
const cache = path.join(path.dirname(path.resolve(src)), "img-cache");
const outImg = path.join(root, "public", "images", "p");
mkdirSync(cache, { recursive: true });
mkdirSync(outImg, { recursive: true });
mkdirSync(path.join(root, "src", "data"), { recursive: true });

const data = JSON.parse(readFileSync(src, "utf8"));
const report = { missing: [], duplicateNames: [], inferredBrands: [], unknownBrand: [], skipped: [] };

// ---------- categories → kind / gender / pre-order ----------
const CAT = {
  miniRoot: 250096, miniPerfume: 250097, miniWomen: 250134, miniMen: 250133, miniMakeup: 250108, miniSkin: 250109, miniBody: 250110, miniVial: 351606,
  petit: 353708, vial: 351623, set: 288049, accessory: 250749, bag: 250105, full: 250100, fullPerfume: 250132, fullSkin: 250102, fullFace: 250752, fullBody: 250751,
  wrap: 285543, pre: 250098, prePerfume: 250099, preMen: 250115, preWomen: 250116, preMakeup: 250112, preSkin: 250113, preBody: 250114,
};
const preMakeupSubs = [250120, 250121, 250119, 250118, 250117, 250122];
const preSkinSubs = [250124, 250130, 250131, 250127, 250126, 250125, 250123, 250128, 250129];

function kindOf(ids, name) {
  const has = (...x) => x.some((i) => ids.includes(i));
  if (has(CAT.wrap)) return "wrap";
  if (has(CAT.bag)) return "bag";
  if (has(CAT.accessory)) return "accessory";
  if (has(CAT.set)) return "set";
  if (has(CAT.petit)) return "petit";
  if (has(CAT.vial, CAT.miniVial)) return "vial";
  if (has(CAT.miniMakeup, CAT.preMakeup, ...preMakeupSubs)) return "makeup";
  if (has(CAT.miniSkin, CAT.preSkin, CAT.fullFace, ...preSkinSubs)) return "skincare";
  if (has(CAT.miniBody, CAT.preBody, CAT.fullBody)) return "body";
  if (has(CAT.fullSkin)) return "skincare";
  if (has(CAT.miniPerfume, CAT.miniWomen, CAT.miniMen)) return "mini";
  if (has(CAT.fullPerfume, CAT.prePerfume, CAT.preMen, CAT.preWomen)) return "full";
  if (has(CAT.miniRoot)) return /set|discovery/i.test(name) ? "set" : "mini";
  if (has(CAT.full)) return "full";
  return "other";
}
const genderOf = (ids) => (ids.some((i) => i === CAT.miniWomen || i === CAT.preWomen) ? "women" : ids.some((i) => i === CAT.miniMen || i === CAT.preMen) ? "men" : null);

// ---------- brands ----------
const clean = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const brandsById = new Map(data.brands.map((b) => [b.id, clean(b.name)]));
const OTHER = "Бусад";
// Display names for the shop's brand list, and names the shop uses that are not in that list (seen in product names).
const ALIASES = {
  "Yves Saint Laurent": "YSL", YSL: "YSL", "Dolce&Gabanna": "Dolce & Gabbana", "Dolce&Gabbana": "Dolce & Gabbana", "Dolce & Gabbana": "Dolce & Gabbana", "D&G": "Dolce & Gabbana",
  Chloe: "Chloé", "Chloé": "Chloé", Kayali: "KAYALI", Givenchy: "GIVENCHY", "Miu Miu": "MIU MIU", Hermes: "Hermès", "Hermès": "Hermès", Lancome: "Lancôme", "Lancôme": "Lancôme",
  "Maison Margiela": "Maison Margiela REPLICA", Replica: "Maison Margiela REPLICA", "Estée Lauder": "Estee Lauder", "Van Cleef & Arpels": "Maison Van Cleef & Arpels", "Van Cleef": "Maison Van Cleef & Arpels",
  "Tiffany": "Tiffany & Co.", "Kilian Paris": "Kilian", "By Kilian": "Kilian", "MFK": "Maison Francis Kurkdjian", "PDM": "Parfums de Marly", "Nest": "NEST New York", Armani: "Giorgio Armani",
  "Jo Malone London": "Jo Malone", "Marc Jacob": "Marc Jacobs", "Louis Vuitton": "Louis Vuitton", LV: "Louis Vuitton",
};
const EXTRA_BRANDS = [
  "Clean Reserve", "MAC", "Kylie Cosmetics", "Jung Saem Mool", "Loewe", "Ellis Brooklyn", "Sephora", "Hourglass", "Color Wow", "Anastasia Beverly Hills", "Glossier", "Dae", "Summer Fridays",
  "Rhode", "Benefit", "Clinique", "Shiseido", "Sulwhasoo", "Drunk Elephant", "Tatcha", "Olaplex", "Dyson", "Phlur", "Glow Recipe", "Kiehl's", "Bobbi Brown", "Huda Beauty", "Too Faced",
  "Urban Decay", "Tarte", "Laura Mercier", "Guerlain", "Narciso Rodriguez", "Paco Rabanne", "Rabanne", "Mugler", "Viktor&Rolf", "Viktor & Rolf", "Maison Crivelli", "Initio", "Xerjoff", "Amouage",
  "Le Labo", "Escentric Molecules", "Juliette Has a Gun", "Ariana Grande", "Billie Eilish", "Moschino", "Ralph Lauren", "Hugo Boss", "Boss", "Calvin Klein", "Azzaro", "Jimmy Choo", "Michael Kors",
  "Kenzo", "Issey Miyake", "Elizabeth Arden", "Montale", "Mancera", "Acqua di Parma", "Penhaligon's", "Frederic Malle", "Serge Lutens", "Memo Paris", "Vilhelm Parfumerie", "Goldfield & Banks",
  "Anna Sui", "Lattafa", "Armaf", "Cerave", "Dr. Jart+", "Banila Co", "Innisfree", "Charlotte Tilbury", "Supergoop", "Fresh", "Summer Fridays", "Medicube", "Anua", "Beauty of Joseon", "Torriden",
  "The 7 Virtues", "Westman Atelier", "Juicy Couture", "Dedcool", "LoveShackFancy", "Commodity", "Moroccanoil", "Haus Labs", "Kerastase", "Patrick Ta", "Emporio Armani", "Lanvin", "Balenciaga", "tryLuxé",
];
ALIASES["M.A.C"] = "MAC";
// brand named inside the product name, not at its start ("My Burberry EDP")
const CONTAINS = [["Burberry", /\bBurberry\b/i]];
const known = [...new Set([...data.brands.map((b) => clean(b.name)).filter((n) => n && n !== OTHER), ...Object.keys(ALIASES), ...EXTRA_BRANDS])].sort((a, b) => b.length - a.length);
const canon = (n) => ALIASES[n] ?? n;
const startsWithWord = (name, b) => name.toLowerCase().startsWith(b.toLowerCase()) && !/[a-z0-9]/i.test(name[b.length] ?? " ");

function brandOf(p) {
  const name = clean(p.name);
  const listed = p.brand_id ? brandsById.get(p.brand_id) : null;
  if (listed && listed !== OTHER) return { brand: canon(listed), inferred: false };
  const hit = known.find((b) => startsWithWord(name, b));
  if (hit) {
    report.inferredBrands.push({ id: p.id, name, brand: canon(hit), listedAs: listed ?? null });
    return { brand: canon(hit), inferred: true };
  }
  const inside = CONTAINS.find(([, re]) => re.test(name));
  if (inside) {
    report.inferredBrands.push({ id: p.id, name, brand: inside[0], listedAs: listed ?? null });
    return { brand: inside[0], inferred: true };
  }
  report.unknownBrand.push({ id: p.id, name, listedAs: listed ?? null });
  return { brand: null, inferred: false };
}

// ---------- names: size, concentration ----------
const SIZE_RE = /\s*[-–]?\s*((?:\d+\s*[xх×]\s*)?\d+(?:[.,]\d+)?\s*(?:ml|мл|g|гр|oz|pcs|ш))\s*$/i;
function splitName(raw) {
  const name = clean(raw);
  const m = name.match(SIZE_RE);
  if (!m) return { base: name.replace(/\s*[-–]\s*$/, ""), size: null };
  const size = m[1].replace(/\s+/g, "").replace(/ML$/i, "ml").replace(/мл$/i, "ml").replace(/гр$/i, "g").replace(/х|×/gi, "x").replace(",", ".").replace(/PCS$/i, "pcs");
  return { base: name.slice(0, m.index).replace(/\s*[-–]\s*$/, "").trim(), size };
}
const CONC = [
  [/\bextrait de parfum\b|\bextrait\b/i, "Extrait de Parfum", "intense"],
  [/\belixir\b/i, "Elixir", "intense"],
  [/\babsolu\b/i, "Absolu", "intense"],
  [/\bparfum intense\b|\bedp intense\b|\bintense\b/i, "Intense", "intense"],
  [/\bcologne intense\b/i, "Cologne Intense", "strong"],
  [/\bsolid perfume\b/i, "Solid Perfume", "moderate"],
  [/\b(perfume|hair|body) mist\b/i, null, "light"],
  [/\bh2eau\b/i, "H2Eau", "light"],
  [/\bedp\b|\beau de parfum\b/i, "EDP", "strong"],
  [/\bparfum\b/i, "Parfum", "intense"],
  [/\bedt\b|\beau de toilette\b/i, "EDT", "moderate"],
  [/\bedc\b|\bcologne\b/i, "Cologne", "light"],
];
function concOf(base) {
  if (/cologne intense/i.test(base)) return { conc: "Cologne Intense", intensity: "strong" };
  for (const [re, label, intensity] of CONC) {
    const m = base.match(re);
    if (m) return { conc: label ?? m[0].replace(/\b\w/g, (c) => c.toUpperCase()), intensity };
  }
  return { conc: null, intensity: null };
}

// ---------- descriptions: prose + verified notes ----------
const htmlToText = (h) =>
  String(h ?? "")
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
const LABELS = ["Эхлэл", "Зүрх", "Суурь", "Үнэрийн бүлэг", "Тохиромжтой"];
function field(flat, label) {
  const others = LABELS.filter((l) => l !== label).join("|");
  const m = flat.match(new RegExp(`${label}\\s*:\\s*(.*?)\\s*(?=(?:${others})\\s*:|$)`, "s"));
  return m ? m[1].trim().replace(/[.;,\s]+$/, "") : null;
}
const list = (s) => (s ? s.split(/\s*[,;]\s*|\s+ба\s+|\s+болон\s+/).map((x) => x.trim().replace(/\.$/, "")).filter(Boolean) : []);
const lowerFirst = (s) => (/^[A-ZА-ЯӨҮЁ][a-zа-яөүё]/.test(s) ? s[0].toLowerCase() + s.slice(1) : s);

// fragrance families: the shop's own words, grouped into seven filter families
const FAMILY_OF = [
  ["floral", /цэцэг|сарнай|floral|aldehyd/i],
  ["fruity", /жимс|халуун орны|fruity/i],
  ["gourmand", /gourmand|ваниль|амтлаг|кофе|чихэр/i],
  ["amber", /amber|дулаан|spicy|халуун ногоо|oriental/i],
  ["woody", /модлог|woody|leather|арьс|утаа|chypre|oud/i],
  ["fresh", /цитрус|сэргэг|ногоон|далай|aquatic|aromatic|лаванда|fougere|citrus|fresh/i],
  ["musk", /musk|powder|пудр/i],
];
const SEASONS = [["spring", /хавар/i], ["summer", /зун/i], ["autumn", /намар/i], ["winter", /өвөл/i]];
const OCCASIONS = [
  ["everyday", /өдөр тутам|өдрийн цаг/i],
  ["office", /оффис|ажил/i],
  ["evening", /орой/i],
  ["date", /болзоо|романтик/i],
  ["special", /онцгой|үдэшлэг|баяр|ёслол/i],
  ["vacation", /амралт|аялал/i],
];

function parseDescription(html) {
  const text = htmlToText(html);
  const flat = text.replace(/\n/g, " ");
  const top = list(field(flat, "Эхлэл")).map(lowerFirst);
  const heart = list(field(flat, "Зүрх")).map(lowerFirst);
  const base = list(field(flat, "Суурь")).map(lowerFirst);
  const familyText = field(flat, "Үнэрийн бүлэг");
  const fit = field(flat, "Тохиромжтой");
  const [seasonPart, occasionPart] = fit ? (fit.includes(";") ? fit.split(";") : [fit, fit]) : [null, null];
  const families = familyText ? FAMILY_OF.filter(([, re]) => re.test(familyText)).map(([k]) => k) : [];
  const seasons = seasonPart ? (/бүх улирал/i.test(seasonPart) ? SEASONS.map(([k]) => k) : SEASONS.filter(([, re]) => re.test(seasonPart)).map(([k]) => k)) : [];
  const occasions = occasionPart ? OCCASIONS.filter(([, re]) => re.test(occasionPart)).map(([k]) => k) : [];
  // prose: everything before the first structured label
  const cut = text.search(/(Эхлэл|Үнэрийн бүлэг|Тохиромжтой)\s*:/);
  // the shop starts most descriptions with the brand and product name on their own lines: drop those
  const paras = (cut >= 0 ? text.slice(0, cut) : text).split("\n").map((x) => x.trim()).filter(Boolean);
  while (paras.length > 1 && paras[0].split(/\s+/).length <= 8 && !/[.!?。]/.test(paras[0])) paras.shift();
  const prose = paras.join("\n");
  return {
    prose,
    notes: top.length || heart.length || base.length ? { top, heart, base } : null,
    familyText: familyText || null,
    families,
    seasons,
    occasions,
    fitText: fit || null,
  };
}

// ---------- slugs ----------
const TRANSLIT = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", ө: "u", п: "p", р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" };
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[а-яёөү]/g, (c) => TRANSLIT[c] ?? "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

// ---------- products → SKUs ----------
const parseImages = (p) => {
  let arr = [];
  try {
    arr = typeof p.images === "string" ? JSON.parse(p.images) : (p.images ?? []);
  } catch {}
  const urls = arr.map((x) => (typeof x === "string" ? x : x?.url)).filter(Boolean);
  if (p.image && !urls.includes(p.image)) urls.unshift(p.image);
  return [...new Set(urls)].slice(0, 5);
};

const skus = [];
for (const p of data.products) {
  if (p.status && p.status !== "enabled") {
    report.skipped.push({ id: p.id, name: p.name, reason: `status ${p.status}` });
    continue;
  }
  const price = Math.round(Number(p.price));
  const sale = p.sale_price ? Math.round(Number(p.sale_price)) : null;
  const images = parseImages(p);
  const name = clean(p.name);
  if (!name || !price || price <= 0) {
    report.skipped.push({ id: p.id, name, reason: "no name or price" });
    continue;
  }
  if (!images.length) report.missing.push({ id: p.id, name, field: "image" });
  const { brand, inferred } = brandOf(p);
  const { base, size } = splitName(name);
  const ids = p.category_ids ?? [];
  const desc = parseDescription(p.description);
  const preorder = ids.includes(CAT.pre);
  skus.push({
    id: p.id,
    zochilCategory: p.category_id,
    name,
    base,
    size,
    brand,
    brandInferred: inferred,
    ...concOf(base),
    kind: kindOf(ids, name),
    gender: genderOf(ids),
    preorder,
    // Zochil price is what the customer pays; sale_price (when set) is the current discounted price
    price: sale && sale < price ? sale : price,
    compareAt: sale && sale < price ? price : null,
    stock: preorder ? null : Number.isFinite(p.stock) ? p.stock : null,
    images,
    desc,
    featured: !!p.featured,
    orders: Number(p.order_verified_count) || 0,
    createdAt: p.created_at,
    categoryIds: ids,
    zochilSku: clean(p.sku) || null,
  });
}

// same name listed more than once (usually a colour shown only in the photo)
const byName = new Map();
for (const s of skus) byName.set(s.name.toLowerCase(), [...(byName.get(s.name.toLowerCase()) ?? []), s.id]);
for (const [, ids] of byName) if (ids.length > 1) report.duplicateNames.push({ name: skus.find((s) => s.id === ids[0]).name, ids });

// ---------- SKUs → lines (one product page, sizes as variants) ----------
/** Name without the brand at its start ("Yves Saint Laurent Libre EDP" → "Libre EDP"). */
function titleOf(base, brand) {
  if (!brand) return base;
  const prefix = [brand, ...Object.entries(ALIASES).filter(([, v]) => v === brand).map(([k]) => k)].sort((a, b) => b.length - a.length).find((b) => startsWithWord(base, b));
  return prefix ? base.slice(prefix.length).replace(/^[\s\-–:]+/, "") || base : base;
}
const lines = new Map();
for (const s of skus) {
  // "YSL Libre EDP" and "Yves Saint Laurent Libre EDP" are the same fragrance
  const key = `${s.brand ?? "?"}|${slugify(titleOf(s.base, s.brand))}|${s.kind === "wrap" || s.kind === "accessory" || s.kind === "bag" ? s.id : ""}`;
  if (!lines.has(key)) lines.set(key, []);
  lines.get(key).push(s);
}

const KIND_ORDER = ["full", "mini", "vial", "petit", "set", "makeup", "skincare", "body", "accessory", "bag", "wrap", "other"];
const usedSlugs = new Set();
const out = [];
for (const group of lines.values()) {
  group.sort((a, b) => a.price - b.price || a.id - b.id);
  const lead = group.find((s) => s.desc.notes) ?? group.find((s) => s.desc.prose) ?? group[0];
  const brand = group[0].brand;
  const title = titleOf(group[0].base, brand);
  let slug = slugify(`${brand ?? ""} ${title}`) || String(group[0].id);
  if (usedSlugs.has(slug)) slug = `${slug}-${group[0].id}`;
  usedSlugs.add(slug);

  const labels = new Map();
  const variants = group.map((s) => {
    // no size in the name: Zochil lists full bottles (mostly pre-orders) without one
    let label = s.size ?? (s.preorder || s.kind === "full" ? "Бүтэн хэмжээ" : (s.conc ?? "Нэг хэмжээ"));
    const n = (labels.get(label) ?? 0) + 1;
    labels.set(label, n);
    return { id: s.id, label, n, size: s.size, conc: s.conc, price: s.price, compareAt: s.compareAt, stock: s.stock, preorder: s.preorder, kind: s.kind, images: s.images, zochilCategory: s.zochilCategory, zochilSku: s.zochilSku };
  });
  // same label twice → number them; the photo tells them apart
  for (const v of variants) if (labels.get(v.label) > 1) v.label = `${v.label} · №${v.n}`;
  for (const v of variants) delete v.n;

  const kinds = [...new Set(group.map((s) => s.kind))].sort((a, b) => KIND_ORDER.indexOf(a) - KIND_ORDER.indexOf(b));
  const conc = lead.conc ?? group.find((s) => s.conc)?.conc ?? null;
  const intensity = lead.intensity ?? group.find((s) => s.intensity)?.intensity ?? null;
  const d = lead.desc;
  const isFragrance = !!d.notes || ["full", "mini", "vial", "petit"].includes(kinds[0]) && !!conc;
  out.push({
    slug,
    title,
    fullName: group[0].base,
    brand,
    brandSlug: brand ? slugify(brand) : null,
    brandInferred: group.some((s) => s.brandInferred),
    kind: kinds[0],
    kinds,
    isFragrance,
    gender: group.find((s) => s.gender)?.gender ?? null,
    conc,
    intensity,
    notes: d.notes,
    familyText: d.familyText,
    families: d.families,
    seasons: d.seasons,
    occasions: d.occasions,
    fitText: d.fitText,
    description: d.prose || null,
    variants,
    minPrice: Math.min(...variants.map((v) => v.price)),
    maxPrice: Math.max(...variants.map((v) => v.price)),
    available: variants.some((v) => v.preorder || v.stock == null || v.stock > 0),
    readyNow: variants.some((v) => !v.preorder && (v.stock == null || v.stock > 0)),
    preorderOnly: variants.every((v) => v.preorder),
    onSale: variants.some((v) => v.compareAt),
    featured: group.some((s) => s.featured),
    orders: group.reduce((n, s) => n + s.orders, 0),
    createdAt: group.map((s) => s.createdAt).sort().at(-1),
  });
}

// ---------- photos ----------
const imgName = (id, i) => `${id}-${i}`;
async function fetchImage(url) {
  const file = path.join(cache, createHash("sha1").update(url).digest("hex").slice(0, 16));
  if (existsSync(file)) return readFileSync(file);
  for (let t = 0; t < 4; t++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
      if (!res.ok) throw new Error(String(res.status));
      const buf = Buffer.from(await res.arrayBuffer());
      writeFileSync(file, buf);
      return buf;
    } catch (e) {
      if (t === 3) throw e;
      await new Promise((r) => setTimeout(r, 1000 * (t + 1)));
    }
  }
}
const jobs = [];
for (const line of out) for (const v of line.variants) v.images.forEach((url, i) => jobs.push({ v, url, i }));
let done = 0;
const failed = [];
async function work(job) {
  const name = imgName(job.v.id, job.i);
  const large = path.join(outImg, `${name}.webp`);
  const thumb = path.join(outImg, `${name}-t.webp`);
  if (!withImages) return name;
  if (!existsSync(large) || !existsSync(thumb)) {
    const buf = await fetchImage(job.url);
    const img = sharp(buf, { failOn: "none" }).rotate();
    await img.clone().resize(1000, 1000, { fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toFile(large);
    await img.clone().resize(480, 480, { fit: "inside", withoutEnlargement: true }).webp({ quality: 76 }).toFile(thumb);
  }
  return name;
}
const queue = [...jobs];
await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const job = queue.shift();
      try {
        job.result = await work(job);
      } catch (e) {
        failed.push({ id: job.v.id, url: job.url, error: String(e) });
      }
      done++;
      if (done % 50 === 0) process.stdout.write(`photos ${done}/${jobs.length}\r`);
    }
  }),
);
for (const line of out) for (const v of line.variants) v.images = v.images.map((_, i) => jobs.find((j) => j.v === v && j.i === i)?.result).filter(Boolean);
report.failedImages = failed;
for (const line of out) for (const v of line.variants) if (!v.images.length) report.missing.push({ id: v.id, name: line.fullName, field: "photo (download failed)" });

// ---------- brands, notes ----------
const brandList = [...new Set(out.map((l) => l.brand).filter(Boolean))]
  .map((name) => {
    const ls = out.filter((l) => l.brand === name);
    const logo = data.brands.find((b) => canon(clean(b.name)) === name)?.image ?? null;
    return { slug: slugify(name), name, lines: ls.length, skus: ls.reduce((n, l) => n + l.variants.length, 0), fragrances: ls.filter((l) => l.isFragrance).length, logo };
  })
  .sort((a, b) => b.skus - a.skus || a.name.localeCompare(b.name));

out.sort((a, b) => Number(b.featured) - Number(a.featured) || b.orders - a.orders || String(b.createdAt).localeCompare(String(a.createdAt)));
const shop = data.shop;
const delivery = (shop.delivery_options ?? []).map((d) => ({ id: d.id, title: clean(d.delivery_title), price: Math.round(Number(d.delivery_price)), freeFrom: d.delivery_price_limit ? Math.round(Number(d.delivery_price_limit)) : null, countryside: !!d.delivery_is_countryside }));
const catalog = {
  source: { site: "https://tryluxe.mn", zochilShopId: shop.id, scrapedProducts: data.products.length, importedAt: new Date().toISOString().slice(0, 10) },
  shop: { phone: shop.phone, email: shop.email, instagram: shop.instagram_url, facebook: shop.facebook_url, paymentRule: clean(shop.payment_rule), deliveryRule: clean(shop.delivery_rule), terms: clean(shop.terms_of_service), hasQpay: !!shop.has_qpay, delivery },
  brands: brandList,
  lines: out,
};
writeFileSync(path.join(root, "src", "data", "catalog.json"), JSON.stringify(catalog));

// slim client data: v = variants (cart), l = lines (quiz, gift finder, search)
const lite = {
  v: out.flatMap((l) => l.variants.map((v) => ({ i: v.id, s: l.slug, n: l.title, b: l.brand, z: v.label, c: v.conc, p: v.price, o: v.compareAt, k: v.stock, r: v.preorder ? 1 : 0, t: v.images[0] ?? null }))),
  l: out.map((l) => ({
    s: l.slug, n: l.title, b: l.brand, k: l.kind, x: l.isFragrance ? 1 : 0, g: l.gender, i: l.intensity, c: l.conc, f: l.families, se: l.seasons, oc: l.occasions,
    nt: l.notes ? [l.notes.top.slice(0, 3), l.notes.heart.slice(0, 3), l.notes.base.slice(0, 3)] : null, p: l.minPrice, q: l.maxPrice, a: l.available ? 1 : 0, r: l.readyNow ? 1 : 0,
    t: l.variants[0].images[0] ?? null, vz: l.variants.length, sz: l.variants.map((v) => v.label).slice(0, 4),
  })),
};
writeFileSync(path.join(root, "src", "data", "lite.json"), JSON.stringify(lite));
writeFileSync(path.join(path.dirname(path.resolve(src)), "import-report.json"), JSON.stringify(report, null, 1));

const n = (f) => out.filter(f).length;
console.log(
  `\nskus ${skus.length} → lines ${out.length}; brands ${brandList.length}; with notes ${n((l) => l.notes)}; fragrances ${n((l) => l.isFragrance)}; preorder-only ${n((l) => l.preorderOnly)}; sold out ${n((l) => !l.available)}`,
);
console.log(`kinds`, Object.fromEntries(KIND_ORDER.map((k) => [k, n((l) => l.kind === k)])));
console.log(`report: missing ${report.missing.length}, duplicate names ${report.duplicateNames.length}, inferred brands ${report.inferredBrands.length}, unknown brand ${report.unknownBrand.length}, skipped ${report.skipped.length}, failed photos ${failed.length}`);
