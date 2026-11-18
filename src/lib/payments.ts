import "server-only";

import { erxesGraphql, erxesUrl } from "@/lib/erxes";
import type { Order } from "@/lib/orders/schema";

/**
 * QPay through the erxes payment plugin (backend/plugins/payment_api), not QPay directly: the QPay merchant
 * credentials stay in erxes (Settings → Payments), never in this website.
 *
 *   ERXES_API_URL       erxes gateway
 *   ERXES_PAYMENT_IDS   comma-separated _id of the erxes payment method(s) to offer (the QPay method)
 *
 * Mutations used (public in erxes: wrapperConfig.skipPermission, see graphql/resolvers/mutations/invoices.ts):
 *   generateInvoiceUrl(input: InvoiceInput!): String   → hosted erxes payment page …/pl:payment/widget/invoice/<id>
 *   invoicesCheck(_id: String!): String                 → asks QPay, marks the invoice paid once (checkInvoiceAndClaim)
 */
export const paymentIds = () =>
  (process.env.ERXES_PAYMENT_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
export const paymentsConfigured = () => !!erxesUrl() && paymentIds().length > 0;

const ID = /^[A-Za-z0-9_-]{6,64}$/;
export const isInvoiceId = (s: unknown): s is string => typeof s === "string" && ID.test(s);

export async function createInvoice(order: Order, reference: string, siteOrigin: string) {
  if (!paymentsConfigured()) return { ok: false as const, error: "not_configured" };
  const res = await erxesGraphql<{ generateInvoiceUrl: string | null }>(`mutation Invoice($input: InvoiceInput!) { generateInvoiceUrl(input: $input) }`, {
    input: {
      amount: order.total,
      currency: "MNT",
      phone: order.phone,
      email: order.email ?? undefined,
      description: `tryLuxé ${reference}`,
      paymentIds: paymentIds(),
      redirectUri: `${siteOrigin}/order/${reference}`,
      data: { reference, source: "tryluxe-web" },
    },
  });
  if (!res.ok || !res.data.generateInvoiceUrl) {
    console.error(`[payment] ${reference}: invoice failed`, res.ok ? "empty url" : res.error);
    return { ok: false as const, error: "invoice_failed" };
  }
  const url = res.data.generateInvoiceUrl;
  const invoiceId = url.split("/").pop() ?? "";
  if (!isInvoiceId(invoiceId)) return { ok: false as const, error: "invoice_failed" };
  return { ok: true as const, invoiceId, url };
}

/** erxes PAYMENT_STATUS: paid, pending, refunded, failed, cancelled, rejected, expired. */
export const PAYMENT_STATES = ["paid", "pending", "refunded", "failed", "cancelled", "rejected", "expired"] as const;
export type PaymentState = (typeof PAYMENT_STATES)[number];

export async function checkInvoice(invoiceId: string) {
  if (!paymentsConfigured()) return { ok: false as const, error: "not_configured" };
  const res = await erxesGraphql<{ invoicesCheck: string | null }>(`mutation Check($id: String!) { invoicesCheck(_id: $id) }`, { id: invoiceId });
  if (!res.ok) return { ok: false as const, error: "check_failed" };
  const status = PAYMENT_STATES.find((s) => s === res.data.invoicesCheck) ?? "pending";
  return { ok: true as const, status };
}
