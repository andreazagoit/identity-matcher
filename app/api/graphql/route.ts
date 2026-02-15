/**
 * Unified GraphQL API Endpoint
 *
 * Single endpoint supporting dual authentication:
 *   - OAuth 2.1 access token (Bearer <jwt>) → user-scoped operations
 *   - API key (Bearer <api_key> or x-api-key header) → server-to-server operations
 *
 * The handler inspects the Authorization header to determine auth type:
 *   1. Try to verify as OAuth JWT → if valid, set authType = "oauth"
 *   2. Otherwise, look up as API key → if valid, set authType = "apikey"
 *   3. If neither, proceed unauthenticated (public queries like health)
 *
 * Usage:
 *   POST /api/graphql
 *   Authorization: Bearer <access_token_or_api_key>
 *   Content-Type: application/json
 *   { "query": "...", "variables": {} }
 */

import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest, NextResponse } from "next/server";
import { typeDefs } from "@/lib/graphql/typedefs";
import { resolvers, type GraphQLContext } from "@/lib/graphql/resolvers";
import { oauthProviderResourceClient } from "@better-auth/oauth-provider/resource-client";
import { auth } from "@/lib/auth";
import { findClientByApiKey } from "@/lib/models/clients/operations";

// ============================================
// APOLLO SERVER
// ============================================

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
});

// ============================================
// AUTH: OAuth token verification
// ============================================

const resourceClient = oauthProviderResourceClient(auth);
const { verifyAccessToken } = resourceClient.getActions();

// ============================================
// CONTEXT BUILDER
// ============================================

async function buildContext(req: NextRequest): Promise<GraphQLContext> {
  const authHeader = req.headers.get("authorization");
  const apiKeyHeader = req.headers.get("x-api-key");

  // 1. Try x-api-key header first (unambiguous)
  if (apiKeyHeader) {
    return await tryApiKey(apiKeyHeader);
  }

  // 2. If Bearer token, try OAuth first, then API key fallback
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return { userId: null, clientId: null, authType: null };
  }

  // Try as OAuth JWT
  try {
    const payload = await verifyAccessToken(token);
    return {
      userId: (payload.sub as string) || null,
      clientId:
        (payload.azp as string) ||
        (Array.isArray(payload.aud) ? payload.aud[0] : (payload.aud as string)) ||
        null,
      authType: "oauth",
    };
  } catch {
    // Not a valid JWT — try as API key
  }

  // Try as API key
  return await tryApiKey(token);
}

async function tryApiKey(key: string): Promise<GraphQLContext> {
  try {
    const client = await findClientByApiKey(key);
    if (client && !client.disabled) {
      return {
        userId: null,
        clientId: client.clientId,
        authType: "apikey",
      };
    }
  } catch {
    // Invalid key
  }
  return { userId: null, clientId: null, authType: null };
}

// ============================================
// HANDLER
// ============================================

const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(
  server,
  { context: async (req) => buildContext(req) },
);

export async function GET(request: NextRequest) {
  return handler(request) as Promise<NextResponse>;
}

export async function POST(request: NextRequest) {
  return handler(request) as Promise<NextResponse>;
}
