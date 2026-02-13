"use server";

import { db } from "@/lib/db";
import { oauthClient } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { generateRandomString } from "better-auth/crypto";

export async function getClients() {
  return await db.query.oauthClient.findMany({
    orderBy: (clients, { desc }) => [desc(clients.createdAt)],
  });
}

export async function createClient(formData: FormData) {
  const name = formData.get("name") as string;
  const redirectUris = (formData.get("redirectUris") as string)
    .split(",")
    .map((uri) => uri.trim());

  const clientId = generateRandomString(32);
  const clientSecret = generateRandomString(32);

  await db.insert(oauthClient).values({
    id: generateRandomString(16),
    clientId,
    clientSecret,
    name,
    redirectUris,
    grantTypes: ["authorization_code", "refresh_token"],
    responseTypes: ["code"],
    type: "third_party",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  revalidatePath("/dashboard");
  return { clientId, clientSecret };
}

export async function deleteClient(id: string) {
  await db.delete(oauthClient).where(eq(oauthClient.id, id));
  revalidatePath("/dashboard");
}

export async function getClientById(id: string) {
  return await db.query.oauthClient.findFirst({
    where: eq(oauthClient.id, id),
  });
}

export async function updateClient(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const redirectUris = (formData.get("redirectUris") as string)
    .split(",")
    .map((uri) => uri.trim());

  await db
    .update(oauthClient)
    .set({
      name,
      redirectUris,
      updatedAt: new Date(),
    })
    .where(eq(oauthClient.id, id));

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${id}`);
}
