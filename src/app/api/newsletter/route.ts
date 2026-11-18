import { NextResponse } from "next/server";
import { erxesGraphql, erxesUrl } from "@/lib/erxes";

/**
 * Newsletter sign-up → erxes form (public `widgetsSaveLead`), so the address lands on a customer in erxes.
 *   ERXES_NEWSLETTER_FORM_ID         _id of the erxes form for sign-ups
 *   ERXES_NEWSLETTER_EMAIL_FIELD_ID  _id of that form's email field
 * Returns 503 not_configured until both are set.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; website?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().slice(0, 120) : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ ok: false, error: "validation" }, { status: 422 });
  if (body?.website) return NextResponse.json({ ok: true });

  const formId = process.env.ERXES_NEWSLETTER_FORM_ID;
  const fieldId = process.env.ERXES_NEWSLETTER_EMAIL_FIELD_ID;
  if (!erxesUrl() || !formId || !fieldId) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const res = await erxesGraphql<{ widgetsSaveLead?: { status: string } }>(
    `mutation SaveLead($formId: String!, $submissions: [FieldValueInput], $browserInfo: JSON!) {
      widgetsSaveLead(formId: $formId, submissions: $submissions, browserInfo: $browserInfo) { status }
    }`,
    { formId, submissions: [{ _id: fieldId, type: "email", text: "email", value: email }], browserInfo: { url: "website", hostname: "tryluxe", language: "mn" } },
  );
  if (res.ok && res.data.widgetsSaveLead?.status === "ok") return NextResponse.json({ ok: true });
  console.error("[newsletter] erxes rejected", res.ok ? "status" : res.error);
  return NextResponse.json({ ok: false, error: "error" }, { status: 502 });
}
