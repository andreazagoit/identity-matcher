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
import { db } from "@/lib/db";
import { findClientByApiKey } from "@/lib/models/clients/operations";

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
  const authHeader = req.headers.get("authorization");
  const apiKeyHeader = req.headers.get("x-api-key");

  const key = apiKeyHeader || authHeader?.replace("Bearer ", "");

  if (!key) return null;

  try {
    const client = await findClientByApiKey(db, key);

    if (!client || client.disabled) return null;

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
