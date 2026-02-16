/**
 * Profile & Matching resolvers.
 *
 * OAuth:   profileStatus, findMatches     (userId from token)
 * API key: userProfileStatus, userMatches (userId from args)
 */

import { withOAuth, withApiKey } from "@/lib/graphql/auth";
import { findMatches, getProfileByUserId } from "./operations";
import { findAssessmentByUserId } from "@/lib/models/assessments/operations";

async function resolveProfileStatus(userId: string) {
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
}

export const profileResolvers = {
  Query: {
    // OAuth
    profileStatus: withOAuth(async (userId) => resolveProfileStatus(userId)),

    findMatches: withOAuth(async (userId, args, ctx) => {
      return await findMatches({
        userId,
        clientId: ctx.clientId,
        limit: args.limit,
        gender: args.gender,
        minAge: args.minAge,
        maxAge: args.maxAge,
        maxDistance: args.maxDistance,
      });
    }),

    // API key
    userProfileStatus: withApiKey(async (userId) => resolveProfileStatus(userId)),

    userMatches: withApiKey(async (userId, args, ctx) => {
      return await findMatches({
        userId,
        clientId: ctx.clientId,
        limit: args.limit,
        gender: args.gender,
        minAge: args.minAge,
        maxAge: args.maxAge,
        maxDistance: args.maxDistance,
      });
    }),
  },
};
