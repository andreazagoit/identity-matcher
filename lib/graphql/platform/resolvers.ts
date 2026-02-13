/**
 * Platform API - GraphQL Resolvers
 *
 * All queries are authenticated via API key.
 * The context contains the calling client info for scoping.
 */

import { GraphQLError, GraphQLScalarType, Kind } from "graphql";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { assessments, profiles } from "@/lib/schema";
import { findMatches } from "@/lib/models/profiles/operations";
import { assembleProfile } from "@/lib/models/assessments/assembler";
import { upsertProfile } from "@/lib/models/profiles/operations";
import {
  QUESTIONS,
  SECTIONS,
  ASSESSMENT_NAME,
} from "@/lib/models/assessments/questions";

// ============================================
// CONTEXT TYPE
// ============================================

export interface PlatformContext {
  client: {
    clientId: string; // OAuth client_id string
    type: string | null; // "first_party" | "third_party" | null
    name: string | null;
  } | null;
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

function requireClient(context: PlatformContext) {
  if (!context.client) {
    throw new GraphQLError("Unauthorized: valid API key required", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }
  return context.client;
}

// ============================================
// RESOLVERS
// ============================================

export const platformResolvers = {
  JSON: JSONScalar,

  Query: {
    health: () => "Identity Matcher Platform API v1 is operational",

    findMatches: async (
      _: unknown,
      args: {
        userId: string;
        limit?: number;
        gender?: string[];
        minAge?: number;
        maxAge?: number;
      },
      context: PlatformContext,
    ) => {
      const client = requireClient(context);

      const matches = await findMatches({
        userId: args.userId,
        clientId: client.clientId,
        clientType: client.type || "third_party",
        limit: args.limit,
        gender: args.gender,
        minAge: args.minAge,
        maxAge: args.maxAge,
      });

      return matches;
    },

    profileStatus: async (
      _: unknown,
      args: { userId: string },
      context: PlatformContext,
    ) => {
      requireClient(context);

      const assessment = await db.query.assessments.findFirst({
        where: eq(assessments.userId, args.userId),
      });

      const profile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, args.userId),
      });

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
  },

  Mutation: {
    submitAssessment: async (
      _: unknown,
      args: { userId: string; answers: Record<string, number | string> },
      context: PlatformContext,
    ) => {
      requireClient(context);

      // 1. Save assessment
      await db.insert(assessments).values({
        userId: args.userId,
        assessmentName: ASSESSMENT_NAME,
        answers: args.answers,
        status: "completed",
      });

      // 2. Assemble profile text from answers
      const profileData = assembleProfile(args.answers);

      // 3. Generate embeddings and upsert profile
      await upsertProfile(args.userId, profileData);

      return {
        success: true,
        profileComplete: true,
      };
    },
  },
};
