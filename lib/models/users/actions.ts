"use server";

import { findClientUsers, findClientStats } from "./operations";

export async function getClientUsers(clientId: string) {
  return await findClientUsers(clientId);
}

export async function getClientStats(clientId: string) {
  return await findClientStats(clientId);
}
