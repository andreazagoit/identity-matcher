/**
 * Unified GraphQL Resolvers
 *
 * Supports dual authentication:
 *   - OAuth 2.1 access token → context.userId is set
 *   - API key → context.clientId is set (no userId)
 *
 * Shared operations (findMatches, profileStatus, submitAssessment)
 * resolve userId from either the arg or the authenticated user.
 *
 * User-only operations (me, updateUser, updateLocation) require OAuth.
 */

import { GraphQLError, GraphQLScalarType, Kind } from "graphql";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/models/users/schema";
import { eq } from "drizzle-orm";
import {
  findMatches,
  getProfileByUserId,
} from "@/lib/models/profiles/operations";
import { upsertProfile } from "@/lib/models/profiles/operations";
import { assembleProfile } from "@/lib/models/assessments/assembler";
import {
  insertAssessment,
  findAssessmentByUserId,
} from "@/lib/models/assessments/operations";
import { QUESTIONS, SECTIONS } from "@/lib/models/assessments/questions";
import {
  updateUser,
  updateUserLocation,
  type UpdateUserOpts,
} from "@/lib/models/users/operations";

// ============================================
// CONTEXT TYPE
// ============================================

export interface GraphQLContext {
  /** Authenticated user ID (from OAuth JWT sub claim). Null for API key auth. */
  userId: string | null;
  /** OAuth client_id (from JWT) or API key client_id. */
  clientId: string | null;
  /** How the caller authenticated. */
  authType: "oauth" | "apikey" | null;
}

// ============================================
// CUSTOM SCALARS
// ============================================

const JSONScalar = new GraphQLScalarType({
  name: "JSON",
  description: "Arbitrary JSON scalar",
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral: (ast) => {
    if (ast.kind === Kind.STRING) return JSON.parse(ast.value);
    if (ast.kind === Kind.INT) return parseInt(ast.value, 10);
    if (ast.kind === Kind.FLOAT) return parseFloat(ast.value);
    if (ast.kind === Kind.BOOLEAN) return ast.value;
    return null;
  },
});

// ============================================
// AUTH HELPERS
// ============================================

/** Require any form of authentication. */
function requireAuth(ctx: GraphQLContext) {
  if (!ctx.authType) {
    throw new GraphQLError("Unauthorized: valid access token or API key required", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }
  return ctx;
}

/** Require OAuth user authentication specifically. */
function requireOAuth(ctx: GraphQLContext): { userId: string; clientId: string | null } {
  if (ctx.authType !== "oauth" || !ctx.userId) {
    throw new GraphQLError("Unauthorized: this operation requires a user access token", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }
  return { userId: ctx.userId, clientId: ctx.clientId };
}

/**
 * Resolve the target userId for shared operations.
 *
 * Security rules:
 *   - OAuth → always uses the authenticated user. If a userId arg is
 *     provided and differs from the token's user, the request is rejected.
 *   - API key → userId arg is required (server-to-server is trusted).
 */
function resolveUserId(ctx: GraphQLContext, argUserId?: string | null): string {
  requireAuth(ctx);

  if (ctx.authType === "oauth" && ctx.userId) {
    // OAuth users can only operate on themselves
    if (argUserId && argUserId !== ctx.userId) {
      throw new GraphQLError(
        "Forbidden: you can only perform this operation on your own account",
        { extensions: { code: "FORBIDDEN" } },
      );
    }
    return ctx.userId;
  }

  if (ctx.authType === "apikey") {
    if (!argUserId) {
      throw new GraphQLError(
        "userId is required when authenticating with an API key",
        { extensions: { code: "BAD_USER_INPUT" } },
      );
    }
    return argUserId;
  }

  throw new GraphQLError("Unauthorized", {
    extensions: { code: "UNAUTHORIZED" },
  });
}

// ============================================
// RESOLVERS
// ============================================

export const resolvers = {
  JSON: JSONScalar,

  Query: {
    health: () => "Identity Matcher API is operational",

    me: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const { userId } = requireOAuth(ctx);

      const result = await db.query.user.findFirst({
        where: eq(userTable.id, userId),
      });

      if (!result) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return {
        ...result,
        createdAt: result.createdAt.toISOString(),
        locationUpdatedAt: result.locationUpdatedAt?.toISOString() || null,
      };
    },

    profileStatus: async (
      _: unknown,
      args: { userId?: string },
      ctx: GraphQLContext,
    ) => {
      const userId = resolveUserId(ctx, args.userId);

      const [assessment, profile] = await Promise.all([
        findAssessmentByUserId(userId),
        getProfileByUserId(userId),
      ]);

      return {
        hasAssessment: !!assessment,
        hasProfile: !!profile?.psychologicalEmbedding,
        assessmentName: assessment?.assessmentName || null,
        completedAt: assessment?.completedAt?.toISOString() || null,
      };
    },

    assessmentQuestions: () => {
      return SECTIONS.map((section) => ({
        section,
        questions: QUESTIONS[section].map((q) => ({
          id: q.id,
          type: q.type,
          text: q.text,
          options: q.type === "closed" ? q.options : null,
          scaleLabels: q.type === "closed" ? q.scaleLabels : null,
          template: q.type === "open" ? q.template : null,
          placeholder: q.type === "open" ? q.placeholder : null,
        })),
      }));
    },

    findMatches: async (
      _: unknown,
      args: {
        userId?: string;
        limit?: number;
        gender?: string[];
        minAge?: number;
        maxAge?: number;
      },
      ctx: GraphQLContext,
    ) => {
      const userId = resolveUserId(ctx, args.userId);

      const matches = await findMatches({
        userId,
        clientId: ctx.clientId || undefined,
        limit: args.limit,
        gender: args.gender,
        minAge: args.minAge,
        maxAge: args.maxAge,
      });

      return matches;
    },
  },

  Mutation: {
    submitAssessment: async (
      _: unknown,
      args: { userId?: string; answers: Record<string, number | string> },
      ctx: GraphQLContext,
    ) => {
      const userId = resolveUserId(ctx, args.userId);

      // 1. Save assessment
      await insertAssessment({ userId, answers: args.answers });

      // 2. Assemble profile text from answers
      const profileData = assembleProfile(args.answers);

      // 3. Generate embeddings and upsert profile
      await upsertProfile(userId, profileData);

      return { success: true, profileComplete: true };
    },

    updateUser: async (
      _: unknown,
      args: { input: UpdateUserOpts },
      ctx: GraphQLContext,
    ) => {
      const { userId } = requireOAuth(ctx);

      const updated = await updateUser(userId, args.input);

      if (!updated) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        locationUpdatedAt: updated.locationUpdatedAt?.toISOString() || null,
      };
    },

    updateLocation: async (
      _: unknown,
      args: { latitude: number; longitude: number },
      ctx: GraphQLContext,
    ) => {
      const { userId } = requireOAuth(ctx);

      if (args.latitude < -90 || args.latitude > 90) {
        throw new GraphQLError("Invalid latitude: must be between -90 and 90", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      if (args.longitude < -180 || args.longitude > 180) {
        throw new GraphQLError("Invalid longitude: must be between -180 and 180", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const updated = await updateUserLocation(userId, args.latitude, args.longitude);

      if (!updated) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      return {
        latitude: updated.latitude!,
        longitude: updated.longitude!,
        updatedAt: updated.locationUpdatedAt!.toISOString(),
      };
    },
  },
};
