"use server";

import { db } from "@/lib/db";
import { user, oauthConsent, profiles, session } from "@/lib/schema";
import { eq, count, and, sql, countDistinct } from "drizzle-orm";

export async function getClientUsers(clientId: string) {
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

  return results.map(r => ({
    ...r.user,
    joinedAt: r.consent.createdAt,
    isProfileComplete: !!r.hasProfile,
  }));
}

export async function getClientStats(clientId: string) {
  const [totalUsers] = await db
    .select({ value: count() })
    .from(oauthConsent)
    .where(eq(oauthConsent.clientId, clientId));

  // Consideriamo "attivi" gli utenti che hanno avuto un'attività (sessione) negli ultimi 30 giorni
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [activeUsers] = await db
    .select({ value: countDistinct(oauthConsent.userId) })
    .from(oauthConsent)
    .innerJoin(session, eq(oauthConsent.userId, session.userId))
    .where(
      and(
        eq(oauthConsent.clientId, clientId),
        sql`${session.updatedAt} >= ${thirtyDaysAgo.toISOString()}::timestamp`
      )
    );

  return {
    totalUsers: totalUsers.value,
    activeUsers: activeUsers.value,
  };
}
