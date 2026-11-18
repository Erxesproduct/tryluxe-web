import { NextResponse } from "next/server";
import { checkInvoice, isInvoiceId } from "@/lib/payments";

/**
 * Payment status of one erxes invoice. erxes asks QPay and marks the invoice paid exactly once
 * (checkInvoiceAndClaim), so polling this repeatedly never processes a payment twice.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { invoiceId?: unknown } | null;
  if (!isInvoiceId(body?.invoiceId)) return NextResponse.json({ ok: false, error: "invalid_invoice" }, { status: 400 });
  const res = await checkInvoice(body.invoiceId);
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error }, { status: res.error === "not_configured" ? 503 : 502 });
  return NextResponse.json({ ok: true, status: res.status }, { headers: { "Cache-Control": "no-store" } });
}
