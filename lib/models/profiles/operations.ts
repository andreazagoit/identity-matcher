/**
 * Profile operations: CRUD + Matching Engine.
 * Every function receives `db` so it can be called from
 * server-actions, GraphQL resolvers, **and** standalone scripts (seed).
 *
 * Key feature: client-scoped matching.
 * Clients only see users who gave consent for that specific client.
 */

import { eq, ne, sql, and, inArray } from "drizzle-orm";
import { cosineDistance } from "drizzle-orm";
import {
  user,
  profiles,
  oauthConsent,
  DEFAULT_MATCHING_WEIGHTS,
  type profiles as ProfilesTable,
} from "@/lib/schema";
import { generateAllUserEmbeddings } from "@/lib/embeddings";
import type { ProfileData } from "@/lib/models/assessments/assembler";
import type { Db } from "@/lib/db";

// ============================================
// TYPES
// ============================================

type Profile = typeof ProfilesTable.$inferSelect;

export interface ProfileMatch {
  profile: Profile;
  user: {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    image: string | null;
    gender: string | null;
    birthDate: string;
  };
  similarity: number;
  breakdown: {
    psychological: number;
    values: number;
    interests: number;
    behavioral: number;
  };
}

export interface FindMatchesOptions {
  /** User to find matches for */
  userId: string;
  /** OAuth client_id (string identifier) for scoping */
  clientId?: string;
  /** Max results */
  limit?: number;
  /** Custom weights override */
  weights?: Record<keyof typeof DEFAULT_MATCHING_WEIGHTS, number>;
  /** Gender filter */
  gender?: string[];
  /** Minimum age (inclusive) */
  minAge?: number;
  /** Maximum age (inclusive) */
  maxAge?: number;
}

// ============================================
// PROFILE CRUD
// ============================================

/**
 * Create or update a user profile.
 * Generates vector embeddings from textual descriptions via OpenAI.
 */
export async function upsertProfile(
  db: Db,
  userId: string,
  data: ProfileData,
  assessmentVersion: number = 1,
): Promise<Profile> {
  const embeddings = await generateAllUserEmbeddings({
    psychological: data.psychologicalDesc,
    values: data.valuesDesc,
    interests: data.interestsDesc,
    behavioral: data.behavioralDesc,
  });

  const now = new Date();

  const [profile] = await db
    .insert(profiles)
    .values({
      userId,
      psychologicalDesc: data.psychologicalDesc,
      valuesDesc: data.valuesDesc,
      interestsDesc: data.interestsDesc,
      behavioralDesc: data.behavioralDesc,
      psychologicalEmbedding: embeddings.psychological,
      valuesEmbedding: embeddings.values,
      interestsEmbedding: embeddings.interests,
      behavioralEmbedding: embeddings.behavioral,
      assessmentVersion,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        psychologicalDesc: data.psychologicalDesc,
        valuesDesc: data.valuesDesc,
        interestsDesc: data.interestsDesc,
        behavioralDesc: data.behavioralDesc,
        psychologicalEmbedding: embeddings.psychological,
        valuesEmbedding: embeddings.values,
        interestsEmbedding: embeddings.interests,
        behavioralEmbedding: embeddings.behavioral,
        assessmentVersion,
        updatedAt: now,
      },
    })
    .returning();

  return profile;
}

/**
 * Retrieve a user profile by User ID.
 */
export async function getProfileByUserId(
  db: Db,
  userId: string,
): Promise<Profile | null> {
  const result = await db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
  return result || null;
}

/**
 * Check if a user has a complete profile with embeddings.
 */
export async function hasCompleteProfile(
  db: Db,
  userId: string,
): Promise<boolean> {
  const profile = await getProfileByUserId(db, userId);
  return !!profile?.psychologicalEmbedding;
}

// ============================================
// MATCHING ENGINE
// ============================================

/**
 * Find compatible matches using ANN search + weighted ranking.
 *
 * Scoping: only users with oauthConsent for the given client.
 *
 * Matching stages:
 * 1. ANN Search on 'psychological' axis (dominant) for candidate pool
 * 2. Multi-axis similarity calculation
 * 3. Weighted ranking
 */
export async function findMatches(
  db: Db,
  options: FindMatchesOptions,
): Promise<ProfileMatch[]> {
  const {
    userId,
    clientId,
    limit = 10,
    weights = DEFAULT_MATCHING_WEIGHTS,
    gender,
    minAge,
    maxAge,
  } = options;

  const CANDIDATES = 200;

  const currentProfile = await getProfileByUserId(db, userId);
  if (!currentProfile?.psychologicalEmbedding) {
    throw new Error("Profile not found. Complete the assessment first.");
  }

  const psychEmbedding = currentProfile.psychologicalEmbedding as number[];
  const valuesEmbedding = currentProfile.valuesEmbedding as number[] | null;
  const interestsEmbedding =
    currentProfile.interestsEmbedding as number[] | null;
  const behavioralEmbedding =
    currentProfile.behavioralEmbedding as number[] | null;

  // Build base query with filters
  const filterConditions = [ne(profiles.userId, userId)];

  if (gender && gender.length > 0) {
    filterConditions.push(inArray(user.gender, gender));
  }

  if (minAge !== undefined) {
    filterConditions.push(
      sql`EXTRACT(YEAR FROM AGE(CAST(${user.birthDate} AS DATE))) >= ${minAge}`,
    );
  }

  if (maxAge !== undefined) {
    filterConditions.push(
      sql`EXTRACT(YEAR FROM AGE(CAST(${user.birthDate} AS DATE))) <= ${maxAge}`,
    );
  }

  // Scope to users with consent for this client
  if (clientId) {
    const usersWithConsent = db
      .select({ userId: oauthConsent.userId })
      .from(oauthConsent)
      .where(eq(oauthConsent.clientId, clientId));

    filterConditions.push(inArray(user.id, usersWithConsent));
  }

  const whereClause =
    filterConditions.length > 1
      ? and(...filterConditions)!
      : filterConditions[0];

  // STAGE 1: ANN Search using HNSW index on psychological axis
  const candidateProfiles = await db
    .select({
      profile: profiles,
      user: user,
      psychSimilarity: sql<number>`1 - (${cosineDistance(
        profiles.psychologicalEmbedding,
        psychEmbedding,
      )})`,
    })
    .from(profiles)
    .innerJoin(user, eq(profiles.userId, user.id))
    .where(whereClause)
    .orderBy(
      sql`${cosineDistance(profiles.psychologicalEmbedding, psychEmbedding)}`,
    )
    .limit(CANDIDATES);

  // STAGE 2: Multi-axis weighted ranking
  const matches: ProfileMatch[] = candidateProfiles.map((candidate) => {
    const cp = candidate.profile;
    const psychSim = candidate.psychSimilarity;

    const valuesSim =
      valuesEmbedding && cp.valuesEmbedding
        ? cosineSimilarity(valuesEmbedding, cp.valuesEmbedding as number[])
        : 0;

    const interestsSim =
      interestsEmbedding && cp.interestsEmbedding
        ? cosineSimilarity(
            interestsEmbedding,
            cp.interestsEmbedding as number[],
          )
        : 0;

    const behavioralSim =
      behavioralEmbedding && cp.behavioralEmbedding
        ? cosineSimilarity(
            behavioralEmbedding,
            cp.behavioralEmbedding as number[],
          )
        : 0;

    const similarity =
      weights.psychological * psychSim +
      weights.values * valuesSim +
      weights.interests * interestsSim +
      weights.behavioral * behavioralSim;

    return {
      profile: cp,
      user: {
        id: candidate.user.id,
        name: candidate.user.name,
        firstName: candidate.user.firstName,
        lastName: candidate.user.lastName,
        image: candidate.user.image,
        gender: candidate.user.gender,
        birthDate: candidate.user.birthDate,
      },
      similarity,
      breakdown: {
        psychological: psychSim,
        values: valuesSim,
        interests: interestsSim,
        behavioral: behavioralSim,
      },
    };
  });

  return matches.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
}

// ============================================
// UTILITY
// ============================================

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
