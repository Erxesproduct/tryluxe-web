import { NextResponse } from "next/server";
import { deliverOrder, makeReference } from "@/lib/orders/deliver";
import { validateOrder } from "@/lib/orders/schema";
import { createInvoice } from "@/lib/payments";
import { siteUrl } from "@/lib/site-url";

/**
 * 1. validate (prices and stock from the catalog)  2. record the order in erxes (form → Sales card)
 * 3. create the QPay invoice in erxes. Without step 2 there is no invoice: money is never asked for an order
 * staff cannot see.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const result = validateOrder(body);
  if (!result.ok) return NextResponse.json({ ok: false, error: "validation", errors: result.errors }, { status: 422 });
  const { order } = result;
  const reference = makeReference((body as { key?: unknown }).key);
  const totals = { reference, subtotal: order.subtotal, deliveryFee: order.deliveryFee, total: order.total, preorder: order.preorder };

  // Honeypot filled → pretend success, drop silently.
  if (order.website) return NextResponse.json({ ok: true, ...totals, payment: null });

  const delivery = await deliverOrder(order, reference);
  if (!delivery.delivered) return NextResponse.json({ ok: false, error: delivery.reason, ...totals }, { status: 503 });

  const origin = new URL(request.url).origin.startsWith("http://localhost") ? new URL(request.url).origin : siteUrl;
  const invoice = await createInvoice(order, reference, origin);
  return NextResponse.json({
    ok: true,
    ...totals,
    payment: invoice.ok ? { invoiceId: invoice.invoiceId, url: invoice.url } : null,
    paymentError: invoice.ok ? undefined : invoice.error,
  });
}
