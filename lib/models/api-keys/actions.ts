"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { findApiKeysByClient, linkApiKeyToClient } from "./operations";

export async function getApiKeys(clientId?: string) {
  return await findApiKeysByClient(db, clientId);
}

export async function createApiKey(formData: FormData) {
  const name = formData.get("name") as string;
  const clientId = formData.get("clientId") as string;

  const result = await auth.api.createApiKey({
    headers: await headers(),
    body: { name },
  });

  if (result && clientId) {
    await linkApiKeyToClient(db, result.id, clientId);
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
    body: { keyId: id },
  });
  revalidatePath("/dashboard");
}
