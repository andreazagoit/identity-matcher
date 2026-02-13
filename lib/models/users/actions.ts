"use server";

import { db } from "@/lib/db";
import { findClientUsers, findClientStats } from "./operations";

export async function getClientUsers(clientId: string) {
  return await findClientUsers(db, clientId);
}

export async function getClientStats(clientId: string) {
  return await findClientStats(db, clientId);
}
