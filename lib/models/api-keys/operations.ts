/**
 * API Keys – pure DB operations.
 * Every function receives `db` so it can be called from
 * server-actions (singleton db) **and** standalone scripts (seed).
 *
 * Note: create/delete go through better-auth's `auth.api` and are
 * therefore kept in actions.ts (they need request context).
 */

import { apikey } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import type { Db } from "@/lib/db";

// ── READ ─────────────────────────────────────────────────────────

export async function findApiKeysByClient(db: Db, clientId?: string) {
  return await db.query.apikey.findMany({
    where: clientId ? eq(apikey.clientId, clientId) : undefined,
    orderBy: (keys) => [desc(keys.createdAt)],
  });
}

// ── UPDATE ───────────────────────────────────────────────────────

export async function linkApiKeyToClient(
  db: Db,
  keyId: string,
  clientId: string,
) {
  await db.update(apikey).set({ clientId }).where(eq(apikey.id, keyId));
}
