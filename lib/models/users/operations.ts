/**
 * Users – DB operations.
 */

import { db } from "@/lib/db";
import { user } from "./schema";
import { oauthClient, oauthConsent } from "@/lib/models/clients/schema";
import { profiles } from "@/lib/models/profiles/schema";
import { session } from "@/lib/models/auth/schema";
import { eq, count, and, sql, countDistinct } from "drizzle-orm";

// ── CREATE ───────────────────────────────────────────────────────

export interface InsertUserOpts {
  name: string;
  givenName: string;
  familyName: string;
  email: string;
  birthdate: string;
  gender: string;
  emailVerified?: boolean;
}

export async function insertUser(opts: InsertUserOpts) {
  const [newUser] = await db
    .insert(user)
    .values({
      id: crypto.randomUUID(),
      ...opts,
      emailVerified: opts.emailVerified ?? false,
    })
    .returning();

  return newUser;
}

// ── FIND ─────────────────────────────────────────────────────────

export async function findUserById(id: string) {
  return db.query.user.findFirst({
    where: eq(user.id, id),
  });
}

// ── UPDATE ────────────────────────────────────────────────────────

export interface UpdateUserOpts {
  givenName?: string;
  familyName?: string;
  birthdate?: string;
  gender?: string | null;
  image?: string | null;
}

export async function updateUser(userId: string, opts: UpdateUserOpts) {
  const updateData: Record<string, unknown> = {};

  if (opts.givenName !== undefined) updateData.givenName = opts.givenName;
  if (opts.familyName !== undefined) updateData.familyName = opts.familyName;
  if (opts.birthdate !== undefined) updateData.birthdate = opts.birthdate;
  if (opts.gender !== undefined) updateData.gender = opts.gender;
  if (opts.image !== undefined) updateData.image = opts.image;

  // Auto-update name if givenName or familyName changed
  if (opts.givenName !== undefined || opts.familyName !== undefined) {
    const existing = await findUserById(userId);
    if (existing) {
      const newFirst = opts.givenName ?? existing.givenName;
      const newLast = opts.familyName ?? existing.familyName;
      updateData.name = `${newFirst} ${newLast}`.trim();
    }
  }

  if (Object.keys(updateData).length === 0) {
    return findUserById(userId);
  }

  const [updated] = await db
    .update(user)
    .set(updateData)
    .where(eq(user.id, userId))
    .returning();

  return updated;
}

export async function updateUserLocation(
  userId: string,
  latitude: number,
  longitude: number,
) {
  // TODO: Add rate limiting and velocity checks for security
  const [updated] = await db
    .update(user)
    .set({
      location: { x: longitude, y: latitude },
      locationUpdatedAt: new Date(),
    })
    .where(eq(user.id, userId))
    .returning();

  return updated;
}

// ── READ (client-scoped) ─────────────────────────────────────────

export async function findClientUsers(id: string) {
  const results = await db
    .select({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      consent: {
        createdAt: oauthConsent.createdAt,
      },
      hasProfile: profiles.id,
    })
    .from(oauthClient)
    .innerJoin(oauthConsent, eq(oauthClient.clientId, oauthConsent.clientId))
    .innerJoin(user, eq(oauthConsent.userId, user.id))
    .leftJoin(profiles, eq(user.id, profiles.userId))
    .where(eq(oauthClient.id, id))
    .orderBy(oauthConsent.createdAt);

  return results.map((r) => ({
    ...r.user,
    joinedAt: r.consent.createdAt,
    isProfileComplete: !!r.hasProfile,
  }));
}

export async function findClientStats(id: string) {
  const [totalUsers] = await db
    .select({ value: count() })
    .from(oauthClient)
    .innerJoin(oauthConsent, eq(oauthClient.clientId, oauthConsent.clientId))
    .where(eq(oauthClient.id, id));

  // "Active" = session activity in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [activeUsers] = await db
    .select({ value: countDistinct(oauthConsent.userId) })
    .from(oauthClient)
    .innerJoin(oauthConsent, eq(oauthClient.clientId, oauthConsent.clientId))
    .innerJoin(session, eq(oauthConsent.userId, session.userId))
    .where(
      and(
        eq(oauthClient.id, id),
        sql`${session.updatedAt} >= ${thirtyDaysAgo.toISOString()}::timestamp`,
      ),
    );

  return {
    totalUsers: totalUsers.value,
    activeUsers: activeUsers.value,
  };
}
