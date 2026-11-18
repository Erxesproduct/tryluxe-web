# tryLuxé: erxes manual steps

Owner of every step below: **Terbish**, with tryLuxé for credentials and decisions.

These steps happen in the erxes 3.0 admin (and at QPay / ebarimt.mn), not in code. The website reads the results
through the environment variables in `.env.example`. Never commit their values; set them in
**Vercel → tryluxe-web → Settings → Environment Variables** and redeploy.

There is no erxes instance for tryLuxé yet ("erxes 3.0: NOT SET"). Create the workspace first.

| Task | Website | erxes / external (manual) |
| --- | --- | --- |
| [1.1] Products, categories, brands, prices, sizes | done: 853 products imported from Zochil | import the CSVs (section 1.1) |
| [1.2] QPay | done: invoice + status check through the erxes payment plugin | **blocked**: QPay merchant credentials, erxes payment method (1.2) |
| [1.3] eBarimt | done: person / company choice, registry number validated | **blocked**: PosAPI registration, TIN; receipts are issued by erxes (1.3) |
| [1.4] Delivery, statuses, address | done: Ulaanbaatar 7,000₮, free from 1,000,000₮; district / khoroo / address | delivery product, pipeline stages (1.4) |
| [1.5] Full journey test | validation verified (27 checks) | **blocked**: real order needs the env vars and 1.2 / 1.3 (1.5) |

---

## 1.1 Products, categories, brands, prices

Source: tryluxe.mn (Zochil shop 29401), read 2026-11-18: **853 products** (Zochil SKUs), 85 brands, MNT prices
8,000₮–1,836,000₮, 6 with a Zochil sale price, 1,203 photos.

- The website groups the sizes of one fragrance (vial, mini, full size) into one page with a size selector:
  **727 pages**. Each size keeps its own Zochil id, price, stock and photos.
- Kinds (from Zochil categories): mini 270, vial 152, full size 149, PETIT 6, sets 26, makeup 79, skincare 14,
  body 40, bags 75, accessories 32, gift wrap 2, other 8.
- **160 pre-order** products (Zochil category 250098, no stock count), **74 sold out**, 2,466 units in stock.
- Notes, family, season, occasion and intensity are shown **only where the Zochil description states them**
  (348 pages). Nothing is guessed.
- Brands: taken from the Zochil brand field; for 223 products without one, from the start of the product name.
  Those are listed in the import report to check.
- Duplicate checks: same Zochil id never imported twice; 25 products share a name with another (open question 1).

Files (made by `node scripts/export-erxes.mjs` from `src/data/catalog.json`):

- `docs/erxes/tryluxe-categories.csv`: 14 rows, parent `TL`, kinds `TL-FULL`, `TL-MINI`, `TL-VIAL`, …, `TL-DELIVERY`.
- `docs/erxes/tryluxe-products.csv`: 853 rows, code `TL-<zochilId>`, name (brand + title + size), category, unit
  price, brand, size, concentration, Zochil stock, pre-order, Zochil id / SKU, photo path on the website.

Steps:

1. **Products & services → Categories**: import `tryluxe-categories.csv` (parent first; already ordered).
2. **Settings → Import & Export → Import → Products**: upload `tryluxe-products.csv`. Map `code → Code`,
   `name → Name`, `category code → Category code`, `unit price → Unit price`, `type → Type`. Keep the codes: website
   orders name every line with its `TL-<zochilId>` code.
3. Brands: **Products & services → Brands** (or a product property «Брэнд»), filled from the `brand` column.
4. **Inventories → Remainders**: enter the Zochil stock column. Pre-order rows have no stock.
5. Photos: upload from `public/images/p/` (the path is in the CSV) if erxes should show them too.

## 1.2 Payment (QPay)

Zochil: QPay is the shop's payment method; the order is confirmed only after 100% payment of goods and delivery.

How the website uses erxes (verified in the erxes 3.0 source, payment plugin):

- `generateInvoiceUrl` (public) creates the invoice after the order is saved; the customer pays on the erxes payment
  page (`/gateway/pl:payment/widget/invoice/<id>`) and returns to `/order/<reference>`.
- `invoicesCheck` (public) is asked every 5 s on `/order/<reference>`; erxes claims a paid invoice only once.
- Shown statuses: paid → «Төлөгдсөн», pending → «Хүлээгдэж буй», failed / cancelled / rejected / expired → «Амжилтгүй»
  with a retry button.

Steps:

1. Get tryLuxé's QPay merchant credentials (`client_id`, `client_secret`, `invoice_code`); ask QPay / Zochil whether
   the existing merchant can be used outside Zochil.
2. **Settings → Payments → Add → QPay (v2)**: enter them. Make a 100₮ test invoice in erxes.
3. Copy the payment method's `_id` into Vercel as `ERXES_PAYMENT_IDS`.
4. **Not yet tested**: nothing on the website has been run against a real QPay merchant. Do not call the payment
   integration working until step 2 and section 1.5 pass with authorized credentials.

## 1.3 eBarimt

The website never makes a receipt. The checkout asks «Хувь хүн» or «Байгууллага» (7-digit registry number, checked on
the server) and writes it on the order. The eBarimt queries in erxes need admin rights, so the receipt is issued in
erxes by staff (or the POS) after payment.

1. Collect from tryLuxé: company TIN, district code (СБД), VAT status, product classification codes (perfume /
   cosmetics).
2. Register for **PosAPI 3.0** (ebarimt.mn) and install the PosAPI service.
3. **Settings → eBarimt**: PosAPI URL, TIN, district code, VAT switches; assign it to the website pipeline / POS.
4. For every paid order: issue the receipt once (check the order card first so it is never issued twice) and give the
   customer the lottery number by SMS / email.

## 1.4 Delivery and order statuses

Website (done), from Zochil shop 29401:

| Option | Fee | Rule |
| --- | --- | --- |
| Улаанбаатар хот дотор | 7,000₮, free from 1,000,000₮ | ready items 24–48 h after payment, pre-orders 7–9 days |

- Address: one of the 9 Ulaanbaatar districts, khoroo 1–45, street / building / door at least 8 characters, phone.
- Countryside and pick-up are **not offered** (open questions 3–4).

erxes:

1. Import `docs/erxes/tryluxe-delivery.csv` (service `TL-DELIVERY-1648`, 7,000₮). Staff set it to 0₮ from 1,000,000₮.
2. **Sales → Boards → «Онлайн захиалга» → pipeline «Вэбсайт»**, stages (the statuses on the website):
   Хүлээгдэж байна (pending) → Баталгаажсан (confirmed, 100% paid) → Бэлтгэж байна (preparing) →
   Хүргэлтэд гарсан (shipped) → Хүргэгдсэн (delivered), plus Цуцлагдсан (cancelled).
3. **Frontline → Forms → (order form) → Settings**: create a sales card in «Хүлээгдэж байна» for every submission.
   Staff move the card to «Баталгаажсан» when the erxes invoice shows paid.
4. Fees and the free limit are in `src/content/business.ts` (from Zochil). If they change, change them there and in the
   erxes delivery product.

## 1.5 Full journey test

**Verified on a local production build:** `npm run test:order -- http://localhost:3460` passes **27 checks**
(empty cart, unknown product, sold out, over stock, quantity limit, the browser's price ignored, totals, 7,000₮ fee,
free from 1,000,000₮, pre-order flag, district and khoroo, short address, phone, email, company registry, same
checkout key → same reference, payment check 400 / 503). Without erxes the order returns `503 not_configured` and the
checkout shows the phone number. `--send` was **not sent** (env vars not set). No payment was made.

Steps for the real test (with authorized credentials only):

1. **Frontline → Forms → Create** «Вэбсайт захиалга» with fields Нэр, Утас, Имэйл, Захиалга; copy the form id and the
   field ids into `ERXES_ORDER_FORM_ID` / `ERXES_ORDER_FIELD_IDS`. Same for a newsletter form
   (`ERXES_NEWSLETTER_FORM_ID`, `ERXES_NEWSLETTER_EMAIL_FIELD_ID`). Set `ERXES_API_URL`, `ERXES_PAYMENT_IDS`. Redeploy.
2. `npm run test:order -- https://tryluxe-web.vercel.app --send`: one order with the cheapest ready item + delivery.
3. Pay the invoice only with QPay's test merchant or with explicit authorization for a real charge; then check
   `/order/<reference>` shows «Төлөгдсөн», the card moved, issue the eBarimt, mark delivered, void the test order.

## Permissions (erxes)

- Staff who handle orders: Sales (cards), Forms (submissions), Payments (view invoices), eBarimt (issue).
- Only the owner: Settings → Payments, Settings → eBarimt, product import.
- The website uses only public erxes mutations; it needs no admin token.

---

## Open questions for tryLuxé

1. **25 shared names** (e.g. Laneige Lip Glowy Balm ×5, Dior bag charm ×15): real names per shade / variant?
2. **223 brands read from the product name**, a few under «Бусад»: confirm the brand list.
3. **Countryside delivery**: not offered on Zochil. Send by bus / post? Fee?
4. **Pick-up**: is there an address where customers can collect or test?
5. **Outer districts** (Багануур, Багахангай, Налайх): delivered at 7,000₮ too?
6. **Free delivery from 1,000,000₮**: still current?
7. **erxes-side invoice dedupe**: the website reuses the same reference on retry; should invoices also be tied to the
   Sales card (needs an erxes plugin that handles the paid callback)?
8. **Customer accounts** (order history, saved addresses): use erxes Client Portal?
9. **English version** of the site?
10. **Opening promotion** (10–15%): which products, which dates?
11. **Pre-order prices** change with exchange rates: is the website price final, or confirmed by phone?
12. **QPay merchant** outside Zochil, **TIN / PosAPI** for eBarimt.
13. **Domain**: point tryluxe.mn at the new site when ready.
