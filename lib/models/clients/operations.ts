/**
 * Clients – pure DB operations.
 * Every function receives `db` so it can be called from
 * server-actions (singleton db) **and** standalone scripts (seed).
 */

import { oauthClient } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { generateRandomString } from "better-auth/crypto";
import type { Db } from "@/lib/db";

/** Fixed OAuth 2.1 defaults applied to every client. */
export const OAUTH_DEFAULTS = {
  grantTypes: ["authorization_code", "refresh_token"],
  responseTypes: ["code"],
  scopes: ["openid", "profile", "email", "offline_access"],
} as const;

// ── CREATE ───────────────────────────────────────────────────────

export interface InsertClientOpts {
  name: string;
  redirectUris: readonly string[];
  /** Override auto-generated values (useful for seeding) */
  id?: string;
  clientId?: string;
  clientSecret?: string;
  userId?: string;
}

export async function insertClient(db: Db, opts: InsertClientOpts) {
  const id = opts.id ?? generateRandomString(16);
  const clientId = opts.clientId ?? generateRandomString(32);
  const clientSecret = opts.clientSecret ?? generateRandomString(32);
  const now = new Date();

  await db.insert(oauthClient).values({
    id,
    clientId,
    clientSecret,
    name: opts.name,
    redirectUris: [...opts.redirectUris],
    grantTypes: [...OAUTH_DEFAULTS.grantTypes],
    responseTypes: [...OAUTH_DEFAULTS.responseTypes],
    scopes: [...OAUTH_DEFAULTS.scopes],
    userId: opts.userId,
    createdAt: now,
    updatedAt: now,
  });

  return { id, clientId, clientSecret };
}

// ── READ ─────────────────────────────────────────────────────────

export async function findAllClients(db: Db) {
  return await db.query.oauthClient.findMany({
    orderBy: (clients, { desc }) => [desc(clients.createdAt)],
  });
}

export async function findClientById(db: Db, id: string) {
  return await db.query.oauthClient.findFirst({
    where: eq(oauthClient.id, id),
  });
}

// ── UPDATE ───────────────────────────────────────────────────────

export async function updateClientConfig(
  db: Db,
  id: string,
  opts: { name: string; redirectUris: string[] },
) {
  await db
    .update(oauthClient)
    .set({
      name: opts.name,
      redirectUris: opts.redirectUris,
      updatedAt: new Date(),
    })
    .where(eq(oauthClient.id, id));
}

export async function regenerateClientSecret(db: Db, id: string) {
  const newSecret = generateRandomString(32);

  await db
    .update(oauthClient)
    .set({
      clientSecret: newSecret,
      updatedAt: new Date(),
    })
    .where(eq(oauthClient.id, id));

  return { clientSecret: newSecret };
}

// ── DELETE ───────────────────────────────────────────────────────

export async function removeClient(db: Db, id: string) {
  await db.delete(oauthClient).where(eq(oauthClient.id, id));
}
