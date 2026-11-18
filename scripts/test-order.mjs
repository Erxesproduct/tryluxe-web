/**
 * End-to-end check of the website order flow (cart → /api/orders → erxes form + erxes QPay invoice → /api/payments/check).
 *
 *   node scripts/test-order.mjs [baseUrl] [--send]
 *
 * Without --send it only runs the validation cases: nothing reaches erxes while erxes is not configured, and with
 * erxes configured the validation cases are rejected before anything is sent.
 * With --send it also places ONE test order, marked «ТЕСТ ЗАХИАЛГА: устгана уу», and checks its invoice status once.
 * Creating an invoice never charges anyone: QPay only charges when someone scans the QR and pays.
 * Exit code 1 if any check fails.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const base = (args.find((a) => !a.startsWith("--")) ?? "http://localhost:3000").replace(/\/$/, "");
const send = args.includes("--send");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(await readFile(path.join(root, "src", "data", "catalog.json"), "utf8"));
const V = catalog.lines.flatMap((l) => l.variants.map((v) => ({ ...v, line: l.slug })));
// Zochil rules (shop 29401): Ulaanbaatar 7,000₮, free from 1,000,000₮; QPay, paid 100% up front; no pick-up, no countryside option.
const city = catalog.shop.delivery.find((d) => !d.countryside);
const FEE = city.price;
const FREE = city.freeFrom;
const has = (v, n) => v.preorder || v.stock == null || v.stock >= n;

const ready = V.filter((v) => !v.preorder && v.stock != null && v.stock >= 3);
const cheap = [...ready].sort((a, b) => a.price - b.price)[0];
const mid = ready.find((v) => v.price >= 50000 && v.price <= 150000);
const pre = V.find((v) => v.preorder && v.price < FREE);
const big = V.find((v) => has(v, 1) && v.price >= FREE);
const scarce = V.find((v) => !v.preorder && v.stock != null && v.stock >= 1 && v.stock <= 3);
const soldout = V.find((v) => !v.preorder && v.stock === 0);
const item = (v, qty) => ({ id: v.id, qty });

const order = {
  name: "Тест Захиалагч",
  phone: "99112233",
  delivery: "city",
  district: "Сүхбаатар",
  khoroo: 1,
  address: "Тест хаяг, 1-р байр, 2-р орц, 34 тоот",
  payment: "qpay",
  receiptType: "person",
  note: "ТЕСТ ЗАХИАЛГА: устгана уу",
  items: [item(mid, 1), item(cheap, 1)],
};
const SUBTOTAL = mid.price + cheap.price;

async function post(url, body) {
  const res = await fetch(`${base}${url}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return { status: res.status, json: await res.json().catch(() => null) };
}

const valid = (r) => !r.json?.errors && (r.status === 200 || r.status === 503);
const rejects = (field) => (r) => r.status === 422 && !!r.json?.errors?.[field];
const total = (expected, fee) => (r) => valid(r) && r.json?.total === expected && (fee === undefined || r.json?.deliveryFee === fee);
const key = (n) => `test-${n}-${Date.now().toString(36)}-abcdef`;

const cases = [
  ["empty cart is rejected", { ...order, items: [] }, rejects("items")],
  ["unknown product is ignored (then empty)", { ...order, items: [{ id: 1, qty: 1 }] }, rejects("items")],
  ...(soldout ? [[`sold-out size is not orderable (TL-${soldout.id})`, { ...order, items: [item(soldout, 1)] }, rejects("items")]] : []),
  ...(scarce ? [[`more than the stock is rejected (TL-${scarce.id}: ${scarce.stock})`, { ...order, items: [item(scarce, scarce.stock + 1)] }, rejects("items")]] : []),
  [`one ${cheap.price}₮ item + ${FEE}₮ delivery`, { ...order, items: [item(cheap, 1)] }, total(cheap.price + FEE, FEE)],
  [`city ${SUBTOTAL}₮ + ${FEE}₮ delivery`, order, total(SUBTOTAL + FEE, FEE)],
  ...(big ? [[`from ${FREE}₮ delivery is free (TL-${big.id})`, { ...order, items: [item(big, 1)] }, total(big.price, 0)]] : []),
  ...(pre ? [[`pre-order (no stock count) is orderable and flagged (TL-${pre.id})`, { ...order, items: [item(pre, 2)] }, (r) => total(pre.price * 2 + FEE, FEE)(r) && r.json?.preorder === true]] : []),
  ["district is required", { ...order, district: "" }, rejects("district")],
  ["unknown district is rejected", { ...order, district: "Дархан" }, rejects("district")],
  ["khoroo must be 1–45", { ...order, khoroo: 99 }, rejects("khoroo")],
  ["address is required", { ...order, address: "" }, rejects("address")],
  ["QPay is accepted", order, valid],
  ["bank transfer is not offered", { ...order, payment: "transfer" }, rejects("payment")],
  ["unknown payment is rejected", { ...order, payment: "cash" }, rejects("payment")],
  ["company eBarimt needs a 7-digit registry number", { ...order, receiptType: "company", regNo: "12" }, rejects("regNo")],
  ["company eBarimt with a valid registry number passes", { ...order, receiptType: "company", regNo: "1234567" }, valid],
  ["bad phone is rejected", { ...order, phone: "123" }, rejects("phone")],
  ["+976 phone prefix is accepted", { ...order, phone: "+976 9911 2233" }, valid],
  ["bad email is rejected", { ...order, email: "not-an-email" }, rejects("email")],
  ["quantity over 10 is ignored", { ...order, items: [item(cheap, 11)] }, rejects("items")],
  ["the browser's price is ignored", { ...order, items: order.items.map((i) => ({ ...i, price: 1 })) }, total(SUBTOTAL + FEE)],
  ["the same checkout key gives the same reference", { ...order, key: "same-key-0123456789abcdef" }, (r) => valid(r) && /^TL-\d{6}-[0-9A-F]{6}$/.test(r.json?.reference ?? "")],
  ["honeypot is silently accepted", { ...order, website: "spam" }, (r) => r.status === 200 && r.json?.ok === true && r.json?.payment === null],
];

let failed = 0;
console.log(`Order API checks against ${base}\n`);
let lastRef = null;
for (const [label, body, check] of cases) {
  const r = await post("/api/orders", { key: key(cases.indexOf(cases.find((c) => c[0] === label))), ...body });
  const pass = check(r);
  if (!pass) failed++;
  if (label.startsWith("the same checkout key")) {
    const again = await post("/api/orders", { ...body });
    const same = again.json?.reference === r.json?.reference;
    if (!same) failed++;
    console.log(`${same ? "✓" : "✗"} retry with that key returns ${again.json?.reference}`);
  }
  lastRef = r.json?.reference ?? lastRef;
  console.log(`${pass ? "✓" : "✗"} ${label}  (${r.status}${r.json?.errors ? " " + Object.keys(r.json.errors).join(",") : ""}${r.json?.total != null ? " total " + r.json.total : ""})`);
}

// payment status endpoint
const bad = await post("/api/payments/check", { invoiceId: "../../etc" });
const badOk = bad.status === 400;
if (!badOk) failed++;
console.log(`${badOk ? "✓" : "✗"} payment check rejects a malformed invoice id (${bad.status})`);
const probe = await post("/api/payments/check", { invoiceId: "notAnInvoice123" });
const probeOk = probe.status === 503 ? probe.json?.error === "not_configured" : probe.status === 200 || probe.status === 502;
if (!probeOk) failed++;
console.log(`${probeOk ? "✓" : "✗"} payment check answers honestly (${probe.status} ${probe.json?.error ?? probe.json?.status})`);

if (send) {
  const r = await post("/api/orders", { key: key("send"), ...order });
  if (r.status === 200 && r.json?.ok) {
    console.log(`\n✓ test order recorded in erxes: ${r.json.reference}, total ${r.json.total}₮ (expected ${SUBTOTAL + FEE})`);
    if (r.json.total !== SUBTOTAL + FEE) {
      failed++;
      console.log("✗ unexpected total");
    }
    if (r.json.payment) {
      console.log(`✓ QPay invoice created in erxes: ${r.json.payment.invoiceId} (not paid; nobody is charged)`);
      const c = await post("/api/payments/check", { invoiceId: r.json.payment.invoiceId });
      console.log(`${c.status === 200 ? "✓" : "✗"} invoice status: ${c.json?.status ?? c.json?.error}`);
      if (c.status !== 200) failed++;
    } else console.log(`– no invoice: ${r.json.paymentError ?? "ERXES_PAYMENT_IDS not set"}`);
  } else if (r.status === 503 && r.json?.error === "not_configured") {
    console.log(`\n– test order NOT sent: erxes env vars are not set on ${base} (reference ${r.json.reference}). See .env.example.`);
  } else {
    failed++;
    console.log(`\n✗ test order failed: ${r.status} ${JSON.stringify(r.json)}`);
  }
}

console.log(failed ? `\n${failed} check(s) failed` : `\nall ${cases.length + 3} checks passed`);
process.exit(failed ? 1 : 0);
