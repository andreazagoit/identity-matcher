/**
 * Client API - GraphQL Endpoint
 *
 * Authentication: OAuth 2.1 access token via Authorization header.
 * This endpoint is used by client apps (e.g. @matcher) after completing
 * the OAuth flow to query user data, profile status, assessments, and matches.
 *
 * Usage:
 *   POST /api/client/v1/graphql
 *   Authorization: Bearer <access_token>
 *   Content-Type: application/json
 *   { "query": "...", "variables": {} }
 */

import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest, NextResponse } from "next/server";
import { clientTypeDefs } from "@/lib/graphql/client/typedefs";
import {
  clientResolvers,
  type ClientContext,
} from "@/lib/graphql/client/resolvers";
import { oauthProviderResourceClient } from "@better-auth/oauth-provider/resource-client";
import { auth } from "@/lib/auth";

// ============================================
// APOLLO SERVER
// ============================================

const server = new ApolloServer<ClientContext>({
  typeDefs: clientTypeDefs,
  resolvers: clientResolvers,
});

// ============================================
// TOKEN VERIFICATION
// ============================================

const resourceClient = oauthProviderResourceClient(auth);
const { verifyAccessToken } = resourceClient.getActions();

/**
 * Extract and verify the OAuth access token from the request.
 * Returns the user ID and client ID from the JWT payload.
 */
async function getAuthFromToken(
  req: NextRequest,
): Promise<ClientContext> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return { userId: null, clientId: null };
  }

  try {
    const payload = await verifyAccessToken(token);

    return {
      userId: (payload.sub as string) || null,
      clientId:
        (payload.azp as string) ||
        (Array.isArray(payload.aud) ? payload.aud[0] : (payload.aud as string)) ||
        null,
    };
  } catch (error) {
    console.error("[Client GraphQL] Token verification failed:", error);
    return { userId: null, clientId: null };
  }
}

// ============================================
// HANDLER
// ============================================

const handler = startServerAndCreateNextHandler<NextRequest, ClientContext>(
  server,
  {
    context: async (req) => {
      return await getAuthFromToken(req);
    },
  },
);

export async function GET(request: NextRequest) {
  return handler(request) as Promise<NextResponse>;
}

export async function POST(request: NextRequest) {
  return handler(request) as Promise<NextResponse>;
}
