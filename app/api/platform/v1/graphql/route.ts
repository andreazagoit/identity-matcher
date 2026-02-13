/**
 * Platform API - GraphQL Endpoint
 *
 * Authentication: API key via Authorization header or x-api-key header.
 *
 * Usage:
 *   POST /api/platform/v1/graphql
 *   Authorization: Bearer <api_key>
 *   Content-Type: application/json
 *   { "query": "...", "variables": {} }
 */

import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest, NextResponse } from "next/server";
import { platformTypeDefs } from "@/lib/graphql/platform/typedefs";
import {
  platformResolvers,
  type PlatformContext,
} from "@/lib/graphql/platform/resolvers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apikey, oauthClient } from "@/lib/schema";
import { eq } from "drizzle-orm";

// ============================================
// APOLLO SERVER
// ============================================

const server = new ApolloServer<PlatformContext>({
  typeDefs: platformTypeDefs,
  resolvers: platformResolvers,
});

// ============================================
// API KEY AUTHENTICATION
// ============================================

async function getClientFromApiKey(
  req: NextRequest,
): Promise<PlatformContext["client"]> {
  // Extract API key from header
  const authHeader = req.headers.get("authorization");
  const apiKeyHeader = req.headers.get("x-api-key");

  const key = apiKeyHeader || authHeader?.replace("Bearer ", "");

  if (!key) return null;

  try {
    // Verify API key via better-auth
    const result = await auth.api.verifyApiKey({
      body: { key },
    });

    if (!result?.valid || !result.key) return null;

    // Get the API key record to find associated client
    const keyRecord = await db.query.apikey.findFirst({
      where: eq(apikey.id, result.key.id),
    });

    if (!keyRecord?.clientId) return null;

    // Get the OAuth client details
    const client = await db.query.oauthClient.findFirst({
      where: eq(oauthClient.id, keyRecord.clientId),
    });

    if (!client) return null;

    return {
      clientId: client.clientId,
      name: client.name,
    };
  } catch {
    return null;
  }
}

// ============================================
// HANDLER
// ============================================

const handler = startServerAndCreateNextHandler<NextRequest, PlatformContext>(
  server,
  {
    context: async (req) => {
      const client = await getClientFromApiKey(req);
      return { client };
    },
  },
);

export async function GET(request: NextRequest) {
  return handler(request) as Promise<NextResponse>;
}

export async function POST(request: NextRequest) {
  return handler(request) as Promise<NextResponse>;
}
