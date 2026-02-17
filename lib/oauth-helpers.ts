/**
 * Pure utility functions for OAuth sign-in flow.
 */

// ---------------------------------------------------------------------------
// Error mapping
// ---------------------------------------------------------------------------

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_email_or_password: "Credenziali non valide",
  account_not_linked:
    "Account non collegato al metodo di accesso scelto. Prova con il provider usato in registrazione.",
  user_already_exists: "Esiste già un account con questa email.",
};

export function mapAuthErrorMessage(
  error: { code?: string; message?: string } | null | undefined,
): string {
  if (!error) return "Accesso fallito";
  const code = (error.code || "").toLowerCase();
  return AUTH_ERROR_MESSAGES[code] ?? error.message ?? "Accesso fallito";
}

// ---------------------------------------------------------------------------
// OAuth query helpers
// ---------------------------------------------------------------------------

/** Extract signed query params (up to and including `sig`) from a URL search string. */
export function parseSignedQuery(search: string): string | undefined {
  const params = new URLSearchParams(search);
  if (!params.has("sig")) return undefined;

  const signed = new URLSearchParams();
  for (const [key, value] of params.entries()) {
    signed.append(key, value);
    if (key === "sig") break;
  }
  return signed.toString();
}

/**
 * When the page receives `?redirect=/api/auth/oauth2/authorize?...`,
 * pull out the authorize query string so we can resume the flow.
 */
export function extractAuthorizeQuery(
  redirectParam: string | null,
): string | undefined {
  if (!redirectParam?.startsWith("/api/auth/oauth2/authorize")) return undefined;
  const idx = redirectParam.indexOf("?");
  if (idx === -1) return undefined;
  return redirectParam.slice(idx + 1) || undefined;
}

/** Try to get the best `redirect_url` from sign-in result data. */
export function extractRedirectUrl(
  data: Record<string, unknown> | null | undefined,
): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const url = data.url;
  return typeof url === "string" ? url : undefined;
}
