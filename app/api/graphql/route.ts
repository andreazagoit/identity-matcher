/**
 * GraphQL API Endpoint
 *
 * POST /api/graphql
 */

import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { NextRequest, NextResponse } from "next/server";
import { typeDefs } from "@/lib/graphql/typedefs";
import { resolvers } from "@/lib/graphql/resolvers";
import { createContext, type GraphQLContext } from "@/lib/graphql/context";

const server = new ApolloServer<GraphQLContext>({ typeDefs, resolvers });

const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(
  server,
  { context: async (req) => createContext(req) },
);

export async function GET(request: NextRequest) {
  return handler(request) as Promise<NextResponse>;
}

export async function POST(request: NextRequest) {
  return handler(request) as Promise<NextResponse>;
}
