import "server-only";

/** erxes gateway, e.g. https://<subdomain>.next.erxes.io/gateway (ERXES_API_URL). Null until configured. */
export const erxesUrl = () => process.env.ERXES_API_URL?.trim().replace(/\/$/, "") || null;

/** POST a GraphQL operation to the erxes gateway. Never throws; never logs variables (they hold customer data). */
export async function erxesGraphql<T>(query: string, variables: Record<string, unknown>): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const url = erxesUrl();
  if (!url) return { ok: false, error: "not_configured" };
  try {
    const res = await fetch(`${url}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const json = (await res.json().catch(() => null)) as { data?: T; errors?: { message: string }[] } | null;
    if (!json) return { ok: false, error: `http_${res.status}` };
    if (json.errors?.length) return { ok: false, error: json.errors.map((e) => e.message).join("; ").slice(0, 300) };
    if (!json.data) return { ok: false, error: `http_${res.status}` };
    return { ok: true, data: json.data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.name : "request_failed" };
  }
}
