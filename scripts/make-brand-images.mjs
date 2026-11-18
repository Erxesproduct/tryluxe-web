// node scripts/make-brand-images.mjs → src/app/icon.png, src/app/apple-icon.png, public/og.jpg
// The icon is the «tL» monogram; the share image stages three real catalog bottles on ivory (same as the hero).
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const IVORY = "#f7f4ef";
const INK = "#171717";
const GOLD = "#c6a77d";

const monogram = (size, bg, fg) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${bg}"/>
  <rect x="6" y="6" width="88" height="88" fill="none" stroke="${GOLD}" stroke-width="1.2"/>
  <text x="50" y="66" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="52" fill="${fg}"><tspan font-style="italic" font-weight="300">t</tspan><tspan>L</tspan></text>
</svg>`);

await sharp(monogram(512, INK, IVORY)).resize(64, 64).png().toFile(path.join(root, "src/app/icon.png"));
await sharp(monogram(512, INK, IVORY)).resize(180, 180).png().toFile(path.join(root, "src/app/apple-icon.png"));

const W = 1200;
const H = 630;
const bottles = [
  { file: "691200-0", h: 330, left: 640, top: 250 },
  { file: "689276-0", h: 430, left: 790, top: 150 },
  { file: "689268-0", h: 350, left: 960, top: 240 },
];
const layers = [];
for (const b of bottles) {
  const buf = await sharp(path.join(root, "public/images/p", `${b.file}.webp`)).resize({ height: b.h }).toBuffer();
  layers.push({ input: buf, left: b.left, top: b.top, blend: "multiply" });
}
const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><radialGradient id="g" cx="0.78" cy="0.25" r="0.6"><stop offset="0" stop-color="${GOLD}" stop-opacity="0.45"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></radialGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <text x="70" y="120" font-family="Georgia, serif" font-size="44" fill="${INK}"><tspan font-style="italic">try</tspan>Luxé</text>
  <text x="70" y="300" font-family="Georgia, serif" font-size="78" fill="${INK}">Your Scent.</text>
  <text x="70" y="390" font-family="Georgia, serif" font-size="78" font-style="italic" fill="${INK}">Your Signature.</text>
  <text x="72" y="470" font-family="Arial, sans-serif" font-size="22" letter-spacing="3" fill="#7a6e61">МИНИ · VIAL · DISCOVERY · БҮТЭН ХЭМЖЭЭ</text>
  <rect x="70" y="520" width="120" height="1.5" fill="${GOLD}"/>
</svg>`);
await sharp({ create: { width: W, height: H, channels: 3, background: IVORY } })
  .composite([{ input: text }, ...layers])
  .jpeg({ quality: 86 })
  .toFile(path.join(root, "public/og.jpg"));
// hero cut-outs: the same catalog photos with the white studio margin trimmed, so the bottles can be staged by height
mkdirSync(path.join(root, "public/images/hero"), { recursive: true });
const hero = {};
for (const b of bottles) {
  const out = path.join(root, "public/images/hero", `${b.file}.webp`);
  const info = await sharp(path.join(root, "public/images/p", `${b.file}.webp`))
    .trim({ background: "#ffffff", threshold: 18 })
    .extend({ top: 6, bottom: 6, left: 6, right: 6, background: "#ffffff" })
    .webp({ quality: 84 })
    .toFile(out);
  hero[b.file] = { w: info.width, h: info.height };
}
writeFileSync(path.join(root, "src/data/hero.json"), JSON.stringify(hero));
console.log("icon.png, apple-icon.png, og.jpg, hero cut-outs written", hero);
