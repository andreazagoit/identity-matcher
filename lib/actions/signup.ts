"use server";

import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/models/users/schema";
import { session as sessionTable } from "@/lib/models/auth/schema";

interface SignupInput {
  email: string;
  givenName: string;
  familyName: string;
  birthdate: string;
  gender: string;
}

interface SignupResult {
  success: boolean;
  error?: string;
  sessionToken?: string;
}

/**
 * Passwordless signup: inserts user + creates session directly in DB.
 * No password is ever stored or generated.
 */
export async function signupPasswordless(
  input: SignupInput,
): Promise<SignupResult> {
  const { email, givenName, familyName, birthdate, gender } = input;

  // Validation
  if (!email || !givenName || !familyName || !birthdate || !gender) {
    return { success: false, error: "Tutti i campi sono obbligatori" };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthdate)) {
    return { success: false, error: "Data di nascita non valida" };
  }

  if (!["man", "woman", "non_binary"].includes(gender)) {
    return { success: false, error: "Genere non valido" };
  }

  try {
    // Check if user already exists
    const existing = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });

    if (existing) {
      return { success: false, error: "Esiste già un account con questa email" };
    }

    const now = new Date();
    const userId = nanoid();
    const sessionId = nanoid();
    const sessionToken = nanoid(32);
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Insert user
    await db.insert(userTable).values({
      id: userId,
      email,
      name: `${givenName} ${familyName}`,
      givenName,
      familyName,
      birthdate,
      gender,
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    });

    // Create session
    await db.insert(sessionTable).values({
      id: sessionId,
      token: sessionToken,
      userId,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, sessionToken };
  } catch (err) {
    console.error("Signup error:", err);
    return { success: false, error: "Errore durante la registrazione" };
  }
}
