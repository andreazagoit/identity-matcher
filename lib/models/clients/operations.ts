/**
 * Clients – pure DB operations.
 * Every function receives `db` so it can be called from
 * server-actions (singleton db) **and** standalone scripts (seed).
 */

import { oauthClient } from "./schema";
import { eq } from "drizzle-orm";
import { generateRandomString } from "better-auth/crypto";
import type { Db } from "@/lib/db";

/** Hash a secret via SHA-256 → base64url (same as @better-auth/oauth-provider). */
async function hashSecret(secret: string): Promise<string> {
  const data = new TextEncoder().encode(secret);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hash).toString("base64url");
}

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
  const clientSecretPlain = opts.clientSecret ?? generateRandomString(32);
  const clientSecretHashed = await hashSecret(clientSecretPlain);
  const apiKey = `idm_${generateRandomString(40)}`;
  const now = new Date();

  await db.insert(oauthClient).values({
    id,
    clientId,
    clientSecret: clientSecretHashed,
    name: opts.name,
    redirectUris: [...opts.redirectUris],
    userId: opts.userId,
    apiKey,
    createdAt: now,
    updatedAt: now,
  });

  return { id, clientId, clientSecret: clientSecretPlain, apiKey };
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
  const hashedSecret = await hashSecret(newSecret);

  await db
    .update(oauthClient)
    .set({
      clientSecret: hashedSecret,
      updatedAt: new Date(),
    })
    .where(eq(oauthClient.id, id));

  return { clientSecret: newSecret };
}

// ── API KEY ─────────────────────────────────────────────────────

/** Regenerate the API key for a client. */
export async function regenerateApiKey(db: Db, id: string) {
  const apiKey = `idm_${generateRandomString(40)}`;

  await db
    .update(oauthClient)
    .set({
      apiKey,
      updatedAt: new Date(),
    })
    .where(eq(oauthClient.id, id));

  return { apiKey };
}

/** Find a client by its API key (plain text lookup). */
export async function findClientByApiKey(db: Db, key: string) {
  return await db.query.oauthClient.findFirst({
    where: eq(oauthClient.apiKey, key),
  });
}

// ── DELETE ───────────────────────────────────────────────────────

export async function removeClient(db: Db, id: string) {
  await db.delete(oauthClient).where(eq(oauthClient.id, id));
}
