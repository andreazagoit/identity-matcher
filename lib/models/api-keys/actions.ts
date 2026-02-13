"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { apikey } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function getApiKeys(clientId?: string) {
  return await db.query.apikey.findMany({
    where: clientId ? eq(apikey.clientId, clientId) : undefined,
    orderBy: (keys) => [desc(keys.createdAt)],
  });
}

export async function createApiKey(formData: FormData) {
  const name = formData.get("name") as string;
  const clientId = formData.get("clientId") as string;
  
  const result = await auth.api.createApiKey({
    headers: await headers(),
    body: {
      name,
    },
  });

  if (result && clientId) {
    await db.update(apikey)
      .set({ clientId })
      .where(eq(apikey.id, result.id));
  }

  if (clientId) {
    revalidatePath(`/dashboard/${clientId}`);
  }
  revalidatePath("/dashboard");
  return result;
}

export async function deleteApiKey(id: string) {
  await auth.api.deleteApiKey({
    headers: await headers(),
    body: {
      keyId: id,
    },
  });
  revalidatePath("/dashboard");
}
