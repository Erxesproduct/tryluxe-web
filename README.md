# tryluxe-web

Storefront for **tryLuxé** (tryluxe.mn, Zochil shop 29401), *Discover the Luxury & Try the Experience*: original
minis, vial testers, discovery sets and full-size fragrances from 85 brands. Next.js 16 (App Router), Tailwind 4,
static product pages, orders and QPay through erxes 3.0.

- 853 Zochil products grouped into 727 product pages: sizes of one fragrance (1.5 ml vial, 10 ml mini, full bottle)
  are one page with a size selector, each size with its own Zochil price, stock and photos
- Notes (top / heart / base), family, seasons and occasions only where the shop's description states them (348 pages)
- «Maison Ivoire» look: warm ivory, deep black, champagne gold, soft beige, warm taupe; Cormorant Garamond + Manrope;
  cinematic hero with three real bottles, text reveal, slow light, scroll cue; respects reduced motion
- Signature-scent quiz (5 steps), gift finder (4 questions), notes explorer, fragrance wardrobe, discovery shelf
- Catalog: search, brand / family / price / gender / intensity / occasion / season filters, sort, wishlist, Quick View
- Cart and checkout: Ulaanbaatar 7,000₮ (free from 1,000,000₮), district / khoroo / address validation, pre-order
  notice, eBarimt person or company; QPay invoice created in erxes, status checked on `/order/<reference>`

```bash
npm install
npm run dev            # http://localhost:3000
npm run lint && npm run typecheck && npm run build
npm run test:order -- http://localhost:3000          # order + payment API checks (nothing is sent)
npm run test:order -- https://<url> --send           # + one test order and invoice (needs erxes env vars; no charge)

node scripts/import-zochil.mjs <data.json>           # rebuild src/data + photos from a tryluxe.mn scrape
node scripts/export-erxes.mjs                        # docs/erxes/*.csv for the erxes product import
node scripts/make-brand-images.mjs                   # icons, og.jpg, hero cut-outs
```

## Order and payment flow

1. `/api/orders` validates the cart against `src/data/catalog.json` (prices and stock never come from the browser).
2. The order goes to erxes as a form submission (`widgetsSaveLead`) so staff see it (Sales card).
3. Only then a QPay invoice is created in erxes (`generateInvoiceUrl`, erxes payment plugin). The customer pays on the
   erxes payment page and returns to `/order/<reference>`.
4. `/order/<reference>` asks `/api/payments/check` → erxes `invoicesCheck`, which marks the invoice paid exactly once.
5. eBarimt receipts are issued by erxes after payment. The website never creates or shows a receipt of its own.

Until the erxes variables are set, `/api/orders` answers `503 not_configured` and the checkout asks the customer to
order by phone. Environment variables: `.env.example` (never commit values). erxes admin steps and open questions:
[`docs/erxes/MANUAL-STEPS.md`](docs/erxes/MANUAL-STEPS.md).
