"use server";

import { revalidatePath } from "next/cache";
import {
  findAllClients,
  findClientById,
  insertClient,
  updateClientConfig,
  removeClient,
  regenerateClientSecret,
  regenerateApiKey,
} from "./operations";

export async function getClients() {
  return await findAllClients();
}

export async function createClient(formData: FormData) {
  const name = formData.get("name") as string;
  const redirectUris = (formData.get("redirectUris") as string)
    .split(",")
    .map((uri) => uri.trim());

  const result = await insertClient({ name, redirectUris });

  revalidatePath("/dashboard");
  return result;
}

export async function deleteClient(id: string) {
  await removeClient(id);
  revalidatePath("/dashboard");
}

export async function getClientById(id: string) {
  return await findClientById(id);
}

export async function updateClient(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const redirectUris = (formData.get("redirectUris") as string)
    .split(",")
    .map((uri) => uri.trim());

  await updateClientConfig(id, { name, redirectUris });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${id}`);
}

export async function rotateClientSecret(id: string) {
  const result = await regenerateClientSecret(id);
  revalidatePath(`/dashboard/${id}`);
  return result;
}

export async function rotateApiKey(id: string) {
  const result = await regenerateApiKey(id);
  revalidatePath(`/dashboard/${id}`);
  return result;
}
