/**
 * Users – pure DB operations.
 * Every function receives `db` so it can be called from
 * server-actions (singleton db) **and** standalone scripts (seed).
 */

import { user, oauthConsent, profiles, session } from "@/lib/schema";
import { eq, count, and, sql, countDistinct } from "drizzle-orm";
import type { Db } from "@/lib/db";

// ── CREATE ───────────────────────────────────────────────────────

export interface InsertUserOpts {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  gender?: string;
  emailVerified?: boolean;
}

export async function insertUser(db: Db, opts: InsertUserOpts) {
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

// ── READ ─────────────────────────────────────────────────────────

export async function findClientUsers(db: Db, clientId: string) {
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
    .from(oauthConsent)
    .innerJoin(user, eq(oauthConsent.userId, user.id))
    .leftJoin(profiles, eq(user.id, profiles.userId))
    .where(eq(oauthConsent.clientId, clientId))
    .orderBy(oauthConsent.createdAt);

  return results.map((r) => ({
    ...r.user,
    joinedAt: r.consent.createdAt,
    isProfileComplete: !!r.hasProfile,
  }));
}

export async function findClientStats(db: Db, clientId: string) {
  const [totalUsers] = await db
    .select({ value: count() })
    .from(oauthConsent)
    .where(eq(oauthConsent.clientId, clientId));

  // "Active" = session activity in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [activeUsers] = await db
    .select({ value: countDistinct(oauthConsent.userId) })
    .from(oauthConsent)
    .innerJoin(session, eq(oauthConsent.userId, session.userId))
    .where(
      and(
        eq(oauthConsent.clientId, clientId),
        sql`${session.updatedAt} >= ${thirtyDaysAgo.toISOString()}::timestamp`,
      ),
    );

  return {
    totalUsers: totalUsers.value,
    activeUsers: activeUsers.value,
  };
}
