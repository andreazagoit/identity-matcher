"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  findAllClients,
  findClientById,
  insertClient,
  updateClientConfig,
  removeClient,
  regenerateClientSecret,
} from "./operations";

export async function getClients() {
  return await findAllClients(db);
}

export async function createClient(formData: FormData) {
  const name = formData.get("name") as string;
  const redirectUris = (formData.get("redirectUris") as string)
    .split(",")
    .map((uri) => uri.trim());

  const result = await insertClient(db, { name, redirectUris });

  revalidatePath("/dashboard");
  return result;
}

export async function deleteClient(id: string) {
  await removeClient(db, id);
  revalidatePath("/dashboard");
}

export async function getClientById(id: string) {
  return await findClientById(db, id);
}

export async function updateClient(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const redirectUris = (formData.get("redirectUris") as string)
    .split(",")
    .map((uri) => uri.trim());

  await updateClientConfig(db, id, { name, redirectUris });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${id}`);
}

export async function rotateClientSecret(id: string) {
  const result = await regenerateClientSecret(db, id);
  revalidatePath(`/dashboard/${id}`);
  return result;
}
