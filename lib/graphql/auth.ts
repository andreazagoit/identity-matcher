/**
 * GraphQL Authentication — Higher-Order Function wrappers.
 *
 * Two wrappers, one per auth type. No overlap.
 *
 *   withOAuth  — requires OAuth (session or JWT), userId from token
 *   withApiKey — requires API key, userId from args (required)
 */

import { GraphQLError } from "graphql";
import type { GraphQLContext } from "./context";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Args = Record<string, any>;

/**
 * Require OAuth authentication. userId comes from the token/session.
 *
 * @example
 *   me: withOAuth(async (userId) => { ... })
 *   findMatches: withOAuth(async (userId, args, ctx) => { ... })
 */
export function withOAuth<TArgs extends Args = Args>(
  fn: (userId: string, args: TArgs, ctx: GraphQLContext) => unknown | Promise<unknown>,
) {
  return async (_parent: unknown, args: TArgs, ctx: GraphQLContext) => {
    if (ctx.authType !== "oauth" || !ctx.userId) {
      throw new GraphQLError("This operation requires a user access token", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }
    return fn(ctx.userId, args, ctx);
  };
}

/**
 * Require API key authentication. userId comes from args.userId (required).
 *
 * @example
 *   userMatches: withApiKey(async (userId, args, ctx) => { ... })
 */
export function withApiKey<TArgs extends Args = Args>(
  fn: (userId: string, args: TArgs, ctx: GraphQLContext) => unknown | Promise<unknown>,
) {
  return async (_parent: unknown, args: TArgs, ctx: GraphQLContext) => {
    if (ctx.authType !== "apikey" || !ctx.clientId) {
      throw new GraphQLError("This operation requires an API key", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }
    if (!args.userId) {
      throw new GraphQLError("userId is required for API key operations", {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    return fn(args.userId as string, args, ctx);
  };
}
