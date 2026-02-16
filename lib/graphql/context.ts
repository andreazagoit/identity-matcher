/**
 * GraphQL Context
 *
 * Resolves the caller's identity from the request.
 * Supports three authentication methods:
 *   1. x-api-key header → API key (server-to-server)
 *   2. Bearer token → OAuth JWT, then API key fallback
 *   3. Session cookie → first-party pages (assessment, dashboard)
 */

import { NextRequest } from "next/server";
import { headers as nextHeaders } from "next/headers";
import { oauthProviderResourceClient } from "@better-auth/oauth-provider/resource-client";
import { auth } from "@/lib/auth";
import { findClientByApiKey } from "@/lib/models/clients/operations";

export interface GraphQLContext {
  /** Authenticated user ID (from OAuth JWT or session cookie). */
  userId?: string;
  /** OAuth client_id (from JWT) or API key client_id. */
  clientId?: string;
  /** How the caller authenticated. Undefined = unauthenticated (guest). */
  authType?: "oauth" | "apikey";
}

const resourceClient = oauthProviderResourceClient(auth);
const { verifyAccessToken } = resourceClient.getActions();

/**
 * Resolves the caller's identity from the incoming request.
 * Returns an empty (guest) context when no credentials are found,
 * so that introspection and the Apollo Sandbox always work.
 * Individual resolvers enforce authentication via the guards in auth.ts.
 */
export async function createContext(req: NextRequest): Promise<GraphQLContext> {
  // 1. x-api-key header
  const apiKey = req.headers.get("x-api-key");
  if (apiKey) {
    const client = await findClientByApiKey(apiKey).catch(() => null);
    if (client && !client.disabled) {
      return { clientId: client.clientId, authType: "apikey" };
    }
  }

  // 2. Bearer token → OAuth JWT, then API key fallback
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (token) {
    try {
      const payload = await verifyAccessToken(token);
      return {
        userId: (payload.sub as string) || undefined,
        clientId:
          (payload.azp as string) ||
          (Array.isArray(payload.aud) ? payload.aud[0] : (payload.aud as string)) ||
          undefined,
        authType: "oauth",
      };
    } catch {
      // Not a JWT — try as API key
    }

    const client = await findClientByApiKey(token).catch(() => null);
    if (client && !client.disabled) {
      return { clientId: client.clientId, authType: "apikey" };
    }
  }

  // 3. Session cookie (first-party pages)
  const session = await auth.api.getSession({ headers: await nextHeaders() }).catch(() => null);
  if (session?.user?.id) {
    return { userId: session.user.id, authType: "oauth" };
  }

  // No valid credentials — return guest context
  return {};
}
