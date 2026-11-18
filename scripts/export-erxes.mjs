// node scripts/export-erxes.mjs → docs/erxes/tryluxe-{categories,products,delivery}.csv
// Files for erxes Products & Services import (Settings → Import). Every row comes from src/data/catalog.json.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const c = JSON.parse(readFileSync(path.join(root, "src/data/catalog.json"), "utf8"));
const out = path.join(root, "docs/erxes");
mkdirSync(out, { recursive: true });

const cell = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = (rows) => "﻿" + rows.map((r) => r.map(cell).join(",")).join("\n") + "\n";

const KINDS = {
  full: ["TL-FULL", "Бүтэн хэмжээ"],
  mini: ["TL-MINI", "Мини үнэртэй ус"],
  vial: ["TL-VIAL", "Vial тестер"],
  petit: ["TL-PETIT", "PETIT by tryLuxé"],
  set: ["TL-SET", "Бэлгийн багц"],
  makeup: ["TL-MAKEUP", "Нүүр будаг"],
  skincare: ["TL-SKIN", "Арьс арчилгаа"],
  body: ["TL-BODY", "Бие арчилгаа"],
  accessory: ["TL-ACC", "Pouch, аксессуар"],
  bag: ["TL-BAG", "Мини цүнх"],
  wrap: ["TL-WRAP", "Бэлгийн уут, хайрцаг"],
  other: ["TL-OTHER", "Бусад"],
};
writeFileSync(
  path.join(out, "tryluxe-categories.csv"),
  csv([["code", "name", "parent code"], ["TL", "tryLuxé", ""], ...Object.values(KINDS).map(([code, name]) => [code, name, "TL"]), ["TL-DELIVERY", "Хүргэлт", "TL"]]),
);

const rows = [["code", "name", "category code", "type", "unit price", "brand", "size", "concentration", "stock (Zochil)", "pre-order", "zochil product id", "zochil sku", "image (website path)"]];
for (const l of c.lines)
  for (const v of l.variants)
    rows.push([
      `TL-${v.id}`,
      [l.brand, l.title, v.label].filter(Boolean).join(" ").slice(0, 200),
      KINDS[v.kind]?.[0] ?? "TL-OTHER",
      "product",
      v.price,
      l.brand ?? "",
      v.size ?? "",
      v.conc ?? "",
      v.preorder ? "" : (v.stock ?? ""),
      v.preorder ? "yes" : "no",
      v.id,
      v.zochilSku ?? "",
      v.images[0] ? `/images/p/${v.images[0]}.webp` : "",
    ]);
writeFileSync(path.join(out, "tryluxe-products.csv"), csv(rows));

const d = c.shop.delivery;
writeFileSync(
  path.join(out, "tryluxe-delivery.csv"),
  csv([["code", "name", "category code", "type", "unit price", "free from (order total)", "source"], ...d.map((x) => [`TL-DELIVERY-${x.id}`, x.title, "TL-DELIVERY", "service", x.price, x.freeFrom ?? "", `Zochil delivery option ${x.id}`])]),
);
console.log(`categories ${Object.keys(KINDS).length + 2}, products ${rows.length - 1}, delivery ${d.length}`);
