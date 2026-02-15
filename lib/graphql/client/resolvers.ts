/**
 * Client API - GraphQL Resolvers
 *
 * All queries are authenticated via OAuth 2.1 access token.
 * The context contains the authenticated user and client info
 * extracted from the verified JWT.
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
import {
  QUESTIONS,
  SECTIONS,
} from "@/lib/models/assessments/questions";
import {
  updateUser,
  updateUserLocation,
  type UpdateUserOpts,
} from "@/lib/models/users/operations";

// ============================================
// CONTEXT TYPE
// ============================================

export interface ClientContext {
  /** Authenticated user ID (from JWT sub claim) */
  userId: string | null;
  /** OAuth client_id (from JWT aud or azp claim) */
  clientId: string | null;
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
// AUTH GUARD
// ============================================

function requireAuth(context: ClientContext): {
  userId: string;
  clientId: string | null;
} {
  if (!context.userId) {
    throw new GraphQLError("Unauthorized: valid access token required", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }
  return { userId: context.userId, clientId: context.clientId };
}

// ============================================
// RESOLVERS
// ============================================

export const clientResolvers = {
  JSON: JSONScalar,

  Query: {
    me: async (_: unknown, __: unknown, context: ClientContext) => {
      const { userId } = requireAuth(context);

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

    profileStatus: async (_: unknown, __: unknown, context: ClientContext) => {
      const { userId } = requireAuth(context);

      const [assessment, profile] = await Promise.all([
        findAssessmentByUserId(db, userId),
        getProfileByUserId(db, userId),
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
        limit?: number;
        gender?: string[];
        minAge?: number;
        maxAge?: number;
      },
      context: ClientContext,
    ) => {
      const { userId, clientId } = requireAuth(context);

      const matches = await findMatches(db, {
        userId,
        clientId: clientId || undefined,
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
      args: { answers: Record<string, number | string> },
      context: ClientContext,
    ) => {
      const { userId } = requireAuth(context);

      // 1. Save assessment
      await insertAssessment(db, {
        userId,
        answers: args.answers,
      });

      // 2. Assemble profile text from answers
      const profileData = assembleProfile(args.answers);

      // 3. Generate embeddings and upsert profile
      await upsertProfile(db, userId, profileData);

      return {
        success: true,
        profileComplete: true,
      };
    },

    updateUser: async (
      _: unknown,
      args: { input: UpdateUserOpts },
      context: ClientContext,
    ) => {
      const { userId } = requireAuth(context);

      const updated = await updateUser(db, userId, args.input);

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
      context: ClientContext,
    ) => {
      const { userId } = requireAuth(context);

      // Validate coordinates
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

      const updated = await updateUserLocation(db, userId, args.latitude, args.longitude);

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
