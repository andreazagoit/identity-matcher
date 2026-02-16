"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  parseSignedQuery,
  extractAuthorizeQuery,
} from "@/lib/oauth-helpers";

/**
 * Detects whether the current sign-in page is part of an OAuth authorization
 * flow and provides helpers to resume it after authentication.
 */
export function useOAuthFlow() {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const redirectParam = searchParams.get("redirect");
    const authorizeQuery = extractAuthorizeQuery(redirectParam);

    const isOAuthFlow =
      searchParams.has("oauth_query") ||
      searchParams.has("client_id") ||
      searchParams.has("sig") ||
      Boolean(authorizeQuery);

    const fallbackRedirect = redirectParam || "/";

    /** Resolve the best oauth_query string from available sources. */
    function getOAuthQuery(): string | undefined {
      const fromParam = searchParams.get("oauth_query");
      if (fromParam) return fromParam;
      if (authorizeQuery) return authorizeQuery;
      return parseSignedQuery(window.location.search);
    }

    /** Build the /authorize URL to resume the OAuth flow. */
    function getContinueUrl(): string | undefined {
      const q = getOAuthQuery();
      return q ? `/api/auth/oauth2/authorize?${q}` : undefined;
    }

    return {
      isOAuthFlow,
      fallbackRedirect,
      getOAuthQuery,
      getContinueUrl,
    };
  }, [searchParams]);
}
